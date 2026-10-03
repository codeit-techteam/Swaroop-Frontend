import { type ReactNode, useRef, useState } from 'react';

import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { InputField, PrimaryButton, SecondaryButton, Typography } from '@/components';
import { addShipmentEvent, createShipment, updateShipment } from '@/features/import/api';
import {
  Card,
  DateField,
  EmptyBlock,
  KeyValues,
  Notice,
  StatusPill,
} from '@/features/import/components';
import { SHIPMENT_MODES, SHIPMENT_TIMELINE } from '@/features/import/config';
import {
  DECIMAL_QTY,
  formatDate,
  formatDateTime,
  formatQty,
  importLabel,
  newIdempotencyKey,
  parseImportError,
  toDateOnly,
} from '@/features/import/format';
import type {
  ImportDealDetail,
  ImportDealStatus,
  ImportShipment,
  ImportShipmentCreateInput,
  ImportShipmentDetailsInput,
  ImportShipmentEventInput,
  ImportShipmentMode,
  ImportShipmentStatus,
} from '@/features/import/types';
import { cn } from '@/utils/cn';

const SHIPPABLE_DEALS: ImportDealStatus[] = ['CONFIRMED', 'PARTIALLY_FULFILLED'];
const TERMINAL: ImportShipmentStatus[] = ['DELIVERED', 'CANCELLED'];

// Decimal quantities (up to 3 places) are summed as integer thousandths to avoid float drift.
const MILLI = BigInt(1000);
const ZERO = BigInt(0);

function toMilli(value: string | null | undefined): bigint {
  if (!value) return ZERO;
  const [int = '0', frac = ''] = value.split('.');
  return BigInt(int || '0') * MILLI + BigInt(`${frac}000`.slice(0, 3));
}

function fromMilli(value: bigint): string {
  const abs = value < ZERO ? -value : value;
  const frac = (abs % MILLI).toString().padStart(3, '0').replace(/0+$/, '');
  return `${value < ZERO ? '-' : ''}${abs / MILLI}${frac ? `.${frac}` : ''}`;
}

/** Deal quantity booked on non-cancelled shipments, delivered, and still unshipped. */
export function shipmentTotals(deal: ImportDealDetail) {
  let booked = ZERO;
  let delivered = ZERO;
  for (const s of deal.shipments) {
    if (s.status !== 'CANCELLED') booked += toMilli(s.quantity);
    if (s.status === 'DELIVERED') delivered += toMilli(s.quantity);
  }
  const remaining = toMilli(deal.quantity) - booked;
  return {
    booked: fromMilli(booked),
    delivered: fromMilli(delivered),
    remaining: fromMilli(remaining > ZERO ? remaining : ZERO),
    hasRemaining: remaining > ZERO,
  };
}

const dateOnlyFromIso = (iso: string | null): string | null =>
  iso ? toDateOnly(new Date(iso)) : null;

/** Midday local time keeps a calendar date stable across time zones. */
function isoFromDateOnly(value: string): string {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12, 0, 0).toISOString();
}

const pad = (n: number) => String(n).padStart(2, '0');
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

function actorLabel(actor: string, mine: string): string {
  return actor === mine ? 'You' : importLabel(actor);
}

// Section --------------------------------------------------------------------------

type SheetState =
  | { kind: 'book' }
  | { kind: 'edit'; shipment: ImportShipment }
  | { kind: 'status'; shipment: ImportShipment }
  | { kind: 'note'; shipment: ImportShipment }
  | null;

export function ShipmentsSection({
  deal,
  canManage,
  onChanged,
}: {
  deal: ImportDealDetail;
  /** The signed-in seller party may book and update shipments. */
  canManage: boolean;
  onChanged: () => Promise<void>;
}) {
  const [sheet, setSheet] = useState<SheetState>(null);
  const isSeller = deal.myParty === 'SELLER';
  const totals = shipmentTotals(deal);
  const canBook = canManage && SHIPPABLE_DEALS.includes(deal.status) && totals.hasRemaining;
  const close = () => setSheet(null);

  return (
    <>
      <Card
        title="Shipments"
        right={
          deal.shipments.length ? (
            <Typography variant="roleDescription" className="text-brand-muted">
              {deal.shipments.length}
            </Typography>
          ) : undefined
        }
      >
        <View className="gap-md">
          {isSeller ? (
            <KeyValues
              rows={[
                ['Deal quantity', formatQty(deal.quantity, deal.quantityUnit)],
                ['Booked / shipped', formatQty(totals.booked, deal.quantityUnit)],
                ['Delivered', formatQty(totals.delivered, deal.quantityUnit)],
                ['Remaining to ship', formatQty(totals.remaining, deal.quantityUnit)],
              ]}
            />
          ) : null}
          {canBook ? (
            <PrimaryButton label="Book shipment" onPress={() => setSheet({ kind: 'book' })} />
          ) : null}
          {deal.shipments.length === 0 ? (
            <EmptyBlock
              title={
                isSeller ? 'No shipments booked yet' : 'The seller has not booked a shipment yet.'
              }
              message={
                isSeller
                  ? 'Book a shipment with carrier and tracking details so the buyer can follow it.'
                  : 'Tracking details appear here as soon as the seller books the shipment.'
              }
            />
          ) : null}
        </View>
      </Card>
      {deal.shipments.map((s) => (
        <ShipmentCard
          key={s.id}
          shipment={s}
          confirmedAt={deal.confirmedAt}
          canManage={canManage && s.canManage}
          onAction={(kind) => setSheet({ kind, shipment: s })}
        />
      ))}
      <ShipmentDetailsSheet
        visible={sheet?.kind === 'book' || sheet?.kind === 'edit'}
        deal={deal}
        shipment={sheet?.kind === 'edit' ? sheet.shipment : null}
        remaining={totals.remaining}
        onClose={close}
        onChanged={onChanged}
      />
      <ShipmentEventSheet
        visible={sheet?.kind === 'status' || sheet?.kind === 'note'}
        kind={sheet?.kind === 'note' ? 'note' : 'status'}
        shipment={sheet && sheet.kind !== 'book' ? sheet.shipment : null}
        onClose={close}
        onChanged={onChanged}
      />
    </>
  );
}

// Card -------------------------------------------------------------------------------

function ShipmentCard({
  shipment: s,
  confirmedAt,
  canManage,
  onAction,
}: {
  shipment: ImportShipment;
  confirmedAt: string | null;
  canManage: boolean;
  onAction: (kind: 'edit' | 'status' | 'note') => void;
}) {
  const [showAllEvents, setShowAllEvents] = useState(false);
  const terminal = TERMINAL.includes(s.status);
  const transitions = s.allowedTransitions ?? [];
  const containers =
    s.containerNumbers.length > 6
      ? `${s.containerNumbers.slice(0, 6).join(', ')} +${s.containerNumbers.length - 6} more`
      : s.containerNumbers.join(', ');
  const events = [...s.events].reverse();
  const visibleEvents = showAllEvents ? events : events.slice(0, 4);

  const actions: { label: string; kind: 'edit' | 'status' | 'note' }[] = [];
  if (canManage && !terminal) {
    if (transitions.length) actions.push({ label: 'Update status', kind: 'status' });
    actions.push({ label: 'Add note', kind: 'note' });
    actions.push({ label: 'Edit details', kind: 'edit' });
  }

  return (
    <Card>
      <View className="gap-md">
        <View className="flex-row items-start justify-between gap-sm">
          <View className="flex-1">
            <Typography variant="roleTitle" className="text-[15px]">
              {s.referenceNumber}
            </Typography>
            <Typography variant="roleDescription" className="mt-xs text-[12px] text-brand-muted">
              {importLabel(s.mode)} · {formatQty(s.quantity, s.quantityUnit)}
            </Typography>
          </View>
          <StatusPill status={s.status} />
        </View>

        {s.status === 'EXCEPTION' ? (
          <Notice tone="danger">
            Shipment exception: {s.exceptionReason ?? 'An issue was reported on this shipment.'}
          </Notice>
        ) : null}
        {s.status === 'CANCELLED' ? (
          <Notice tone="neutral">
            This shipment was cancelled{s.cancelledAt ? ` on ${formatDate(s.cancelledAt)}` : ''}.
          </Notice>
        ) : null}

        <KeyValues
          rows={[
            ['Mode', importLabel(s.mode)],
            ['Quantity', formatQty(s.quantity, s.quantityUnit)],
            ['Carrier', s.carrierName],
            ['Tracking no.', s.trackingNumber],
            ['Vessel / voyage', [s.vesselName, s.voyageNumber].filter(Boolean).join(' / ')],
            ['Containers', containers],
            [
              'Route',
              s.originLocation || s.destinationLocation
                ? `${s.originLocation ?? '—'} → ${s.destinationLocation ?? '—'}`
                : null,
            ],
            ['ETD', s.etd ? formatDate(s.etd) : null],
            ['ETA', s.eta ? formatDate(s.eta) : 'ETA not available yet'],
            ...(s.departedAt
              ? ([['Departed', formatDateTime(s.departedAt)]] as [string, string][])
              : []),
            ...(s.arrivedAt
              ? ([['Arrived', formatDateTime(s.arrivedAt)]] as [string, string][])
              : []),
            ...(s.deliveredAt
              ? ([['Delivered', formatDateTime(s.deliveredAt)]] as [string, string][])
              : []),
          ]}
        />
        {s.remarks ? (
          <View className="rounded-xl bg-brand-surface px-md py-sm">
            <Typography variant="roleDescription">{s.remarks}</Typography>
          </View>
        ) : null}

        {s.status !== 'CANCELLED' ? (
          <TrackingTimeline shipment={s} confirmedAt={confirmedAt} />
        ) : null}

        {actions.length ? (
          <View className="flex-row flex-wrap gap-sm">
            {actions.map((a) => (
              <Pressable
                key={a.kind}
                onPress={() => onAction(a.kind)}
                accessibilityRole="button"
                className="rounded-full border border-brand-primary px-md py-sm active:opacity-80"
              >
                <Typography
                  variant="roleDescription"
                  className="font-semibold text-brand-primary-dark"
                >
                  {a.label}
                </Typography>
              </Pressable>
            ))}
          </View>
        ) : null}

        {events.length ? (
          <View className="gap-sm">
            <Typography variant="fieldLabel" className="text-brand-muted">
              History
            </Typography>
            {visibleEvents.map((e) => (
              <View key={e.id} className="rounded-xl border border-brand-border px-md py-sm">
                <View className="flex-row items-start justify-between gap-sm">
                  <Typography
                    variant="roleDescription"
                    className="flex-1 font-medium text-brand-heading"
                  >
                    {e.previousStatus
                      ? importLabel(e.status)
                      : e.description
                        ? 'Note'
                        : 'Location update'}
                  </Typography>
                  <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
                    {actorLabel(e.actorParty, s.myParty)}
                  </Typography>
                </View>
                <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
                  {formatDateTime(e.occurredAt)}
                  {e.location ? ` · ${e.location}` : ''}
                </Typography>
                {e.description ? (
                  <Typography variant="roleDescription" className="mt-xs">
                    {e.description}
                  </Typography>
                ) : null}
              </View>
            ))}
            {events.length > 4 ? (
              <Pressable onPress={() => setShowAllEvents((v) => !v)} hitSlop={8}>
                <Typography variant="link">
                  {showAllEvents ? 'Show less' : `Show all ${events.length} updates`}
                </Typography>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </Card>
  );
}

/** Steps are done once the shipment reached them; skipped steps (e.g. no transit leg) count as passed. */
function TrackingTimeline({
  shipment,
  confirmedAt,
}: {
  shipment: ImportShipment;
  confirmedAt: string | null;
}) {
  const reachedAt = new Map<ImportShipmentStatus, string>();
  for (const e of shipment.events) {
    if (!reachedAt.has(e.status)) reachedAt.set(e.status, e.occurredAt);
  }
  const reached = new Set<ImportShipmentStatus>([shipment.status, ...reachedAt.keys()]);
  let current = -1;
  SHIPMENT_TIMELINE.forEach((step, i) => {
    if (step.statuses.some((st) => reached.has(st))) current = i;
  });
  const steps = [
    { label: 'Order confirmed', done: Boolean(confirmedAt), at: confirmedAt },
    ...SHIPMENT_TIMELINE.map((step, i) => ({
      label: step.label,
      done: i <= current,
      at: step.statuses.map((st) => reachedAt.get(st)).find(Boolean) ?? null,
    })),
  ];

  return (
    <View className="gap-xs">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        const active = i === current + 1 && shipment.status !== 'EXCEPTION';
        return (
          <View key={step.label} className="flex-row gap-md">
            <View className="items-center">
              <View
                className={cn(
                  'h-4 w-4 items-center justify-center rounded-full border',
                  step.done
                    ? 'border-brand-success bg-brand-success'
                    : active
                      ? 'border-brand-primary bg-brand-white'
                      : 'border-brand-border bg-brand-white',
                )}
              />
              {!last ? (
                <View
                  className={cn(
                    'w-[2px] flex-1',
                    step.done ? 'bg-brand-success' : 'bg-brand-border',
                  )}
                  style={{ minHeight: 14 }}
                />
              ) : null}
            </View>
            <View className="flex-1 flex-row justify-between gap-sm pb-sm">
              <Typography
                variant="roleDescription"
                className={cn(
                  step.done ? 'font-medium text-brand-heading' : 'text-brand-muted',
                  active && 'font-semibold text-brand-primary-dark',
                )}
              >
                {step.label}
              </Typography>
              {step.done && step.at ? (
                <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
                  {formatDate(step.at)}
                </Typography>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// Sheets ------------------------------------------------------------------------------

function SheetLayout({
  title,
  description,
  onClose,
  children,
  footer,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 justify-end"
      style={{ backgroundColor: 'rgba(16, 52, 96, 0.52)' }}
    >
      <Pressable className="flex-1" onPress={onClose} accessibilityLabel="Close" />
      <View
        className="max-h-[90%] rounded-t-[28px] bg-brand-white px-lg pt-lg"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="mb-md h-1.5 w-12 self-center rounded-full bg-brand-border" />
        <Typography variant="headingLeft" className="text-[19px]">
          {title}
        </Typography>
        {description ? (
          <Typography variant="roleDescription" className="mt-xs text-brand-muted">
            {description}
          </Typography>
        ) : null}
        <ScrollView
          className="mt-md"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 14, paddingBottom: 12 }}
        >
          {children}
        </ScrollView>
        <View className="flex-row gap-sm pt-sm">{footer}</View>
      </View>
    </KeyboardAvoidingView>
  );
}

function ChoiceChips<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string;
}) {
  return (
    <View className="gap-sm">
      <Typography variant="fieldLabel">{label}</Typography>
      <View className="flex-row flex-wrap gap-sm">
        {options.map((o) => {
          const active = o === value;
          return (
            <Pressable
              key={o}
              onPress={() => onChange(o)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className={cn(
                'rounded-full border px-md py-xs',
                active
                  ? 'border-brand-primary bg-brand-primary-light'
                  : 'border-brand-border bg-brand-white',
              )}
            >
              <Typography
                variant="roleDescription"
                className={active ? 'font-semibold text-brand-primary-dark' : 'text-brand-body'}
              >
                {importLabel(o)}
              </Typography>
            </Pressable>
          );
        })}
      </View>
      {error ? <Typography variant="error">{error}</Typography> : null}
    </View>
  );
}

type DetailsValues = {
  quantity: string;
  mode: ImportShipmentMode;
  carrierName: string;
  trackingNumber: string;
  vesselName: string;
  voyageNumber: string;
  containers: string;
  originLocation: string;
  destinationLocation: string;
  etd: string | null;
  eta: string | null;
  remarks: string;
};

const TEXT_KEYS = [
  'carrierName',
  'trackingNumber',
  'vesselName',
  'voyageNumber',
  'originLocation',
  'destinationLocation',
  'remarks',
] as const;

function detailsFrom(shipment: ImportShipment | null, remaining: string): DetailsValues {
  return {
    quantity: shipment ? shipment.quantity : remaining,
    mode: shipment?.mode ?? 'SEA',
    carrierName: shipment?.carrierName ?? '',
    trackingNumber: shipment?.trackingNumber ?? '',
    vesselName: shipment?.vesselName ?? '',
    voyageNumber: shipment?.voyageNumber ?? '',
    containers: shipment?.containerNumbers.join(', ') ?? '',
    originLocation: shipment?.originLocation ?? '',
    destinationLocation: shipment?.destinationLocation ?? '',
    etd: dateOnlyFromIso(shipment?.etd ?? null),
    eta: dateOnlyFromIso(shipment?.eta ?? null),
    remarks: shipment?.remarks ?? '',
  };
}

const parseContainers = (value: string): string[] => [
  ...new Set(
    value
      .split(/[,\n]/)
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean),
  ),
];

const FIELD_ALIASES: Record<string, keyof DetailsValues> = { containerNumbers: 'containers' };

type DetailsSheetProps = {
  visible: boolean;
  deal: ImportDealDetail;
  /** null books a new shipment. */
  shipment: ImportShipment | null;
  remaining: string;
  onClose: () => void;
  onChanged: () => Promise<void>;
};

function ShipmentDetailsSheet(props: DetailsSheetProps) {
  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="slide"
      onRequestClose={props.onClose}
      statusBarTranslucent
    >
      {/* Mounted per open: fresh form values and a new Idempotency-Key each time. */}
      {props.visible ? <ShipmentDetailsForm {...props} /> : null}
    </Modal>
  );
}

function ShipmentDetailsForm({ deal, shipment, remaining, onClose, onChanged }: DetailsSheetProps) {
  const editing = Boolean(shipment);
  const [initial] = useState(() => detailsFrom(shipment, remaining));
  const [form, setForm] = useState<DetailsValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const keyRef = useRef(newIdempotencyKey());
  const unit = importLabel(deal.quantityUnit);

  const set = <K extends keyof DetailsValues>(key: K, value: DetailsValues[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!e[key]) return e;
      const rest = { ...e };
      delete rest[key];
      return rest;
    });
  };

  function validate(): Record<string, string> {
    const local: Record<string, string> = {};
    if (!editing) {
      if (!form.quantity || !DECIMAL_QTY.test(form.quantity)) {
        local.quantity = 'Enter a quantity with up to 3 decimal places.';
      } else if (toMilli(form.quantity) <= ZERO) {
        local.quantity = 'Quantity must be greater than 0.';
      } else if (toMilli(form.quantity) > toMilli(remaining)) {
        local.quantity = `Only ${formatQty(remaining, deal.quantityUnit)} is still unshipped.`;
      }
    }
    const containers = parseContainers(form.containers);
    if (containers.length > 200) local.containers = 'Enter at most 200 container numbers.';
    else if (containers.some((c) => c.length > 20)) {
      local.containers = 'Each container number can have at most 20 characters.';
    }
    if (form.etd && form.eta && form.eta < form.etd) {
      local.eta = 'ETA must be on or after the ETD.';
    }
    return local;
  }

  function buildDetails(): ImportShipmentDetailsInput {
    const out: ImportShipmentDetailsInput = {};
    const changed = <K extends keyof DetailsValues>(key: K) =>
      !editing || form[key] !== initial[key];
    if (changed('mode')) out.mode = form.mode;
    for (const key of TEXT_KEYS) {
      const value = form[key].trim();
      if (changed(key) && (editing || value)) out[key] = value || null;
    }
    if (changed('containers')) {
      const list = parseContainers(form.containers);
      if (editing || list.length) out.containerNumbers = list;
    }
    if (changed('etd') && (editing || form.etd))
      out.etd = form.etd ? isoFromDateOnly(form.etd) : null;
    if (changed('eta') && (editing || form.eta))
      out.eta = form.eta ? isoFromDateOnly(form.eta) : null;
    return out;
  }

  async function submit() {
    const local = validate();
    setErrors(local);
    if (Object.keys(local).length) return;
    const details = buildDetails();
    if (editing && !Object.keys(details).length) {
      Toast.show({ type: 'info', text1: 'No changes to save' });
      onClose();
      return;
    }
    setSubmitting(true);
    try {
      if (shipment) {
        await updateShipment(shipment.id, { ...details, version: shipment.version });
        Toast.show({ type: 'success', text1: `${shipment.referenceNumber} updated` });
      } else {
        const body: ImportShipmentCreateInput = { ...details, quantity: form.quantity };
        const created = await createShipment(deal.id, body, keyRef.current);
        Toast.show({
          type: 'success',
          text1: `Shipment ${created.referenceNumber} booked`,
          text2: 'The buyer has been notified.',
        });
      }
      onClose();
      await onChanged();
    } catch (error) {
      const e = parseImportError(error);
      if (e.code === 'IMPORT_DRAFT_CONFLICT') {
        onClose();
        Toast.show({
          type: 'info',
          text1: 'This shipment was changed by someone else',
          text2: 'The latest details are loaded. Review them and try again.',
        });
        await onChanged();
        return;
      }
      if (e.code === 'IMPORT_INVALID_STATUS_TRANSITION') {
        onClose();
        Toast.show({ type: 'error', text1: e.message });
        await onChanged();
        return;
      }
      if (e.fields.length) {
        setErrors(
          Object.fromEntries(e.fields.map((f) => [FIELD_ALIASES[f.field] ?? f.field, f.message])),
        );
      }
      Toast.show({ type: 'error', text1: e.message });
    } finally {
      setSubmitting(false);
    }
  }

  const text = (
    key: (typeof TEXT_KEYS)[number],
    label: string,
    maxLength: number,
    opts: {
      placeholder?: string;
      multiline?: boolean;
      autoCapitalize?: 'none' | 'characters';
    } = {},
  ) => (
    <InputField
      label={label}
      value={form[key]}
      onChangeText={(v) => set(key, v)}
      maxLength={maxLength}
      placeholder={opts.placeholder}
      multiline={opts.multiline}
      autoCapitalize={opts.autoCapitalize}
      autoCorrect={false}
      error={errors[key]}
    />
  );

  return (
    <SheetLayout
      title={shipment ? `Edit ${shipment.referenceNumber}` : 'Book shipment'}
      description={
        shipment
          ? 'Carrier and routing details are shared with the buyer. Quantity cannot be changed.'
          : `Deal ${deal.referenceNumber}. Carrier and tracking details are shared with the buyer.`
      }
      onClose={onClose}
      footer={
        <>
          <SecondaryButton
            variant="outline"
            label="Cancel"
            className="flex-1"
            disabled={submitting}
            onPress={onClose}
          />
          <PrimaryButton
            label={submitting ? 'Saving…' : shipment ? 'Save details' : 'Book shipment'}
            className="flex-1"
            disabled={submitting}
            onPress={() => void submit()}
          />
        </>
      }
    >
      {shipment ? null : (
        <InputField
          label={`Quantity (${unit}) *`}
          value={form.quantity}
          onChangeText={(v) => set('quantity', v.replace(/,/g, '').trim())}
          keyboardType="decimal-pad"
          error={errors.quantity}
        />
      )}
      {shipment ? null : (
        <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
          Up to {formatQty(remaining, deal.quantityUnit)} remaining on this deal.
        </Typography>
      )}
      <ChoiceChips
        label="Mode"
        options={SHIPMENT_MODES}
        value={form.mode}
        onChange={(v) => set('mode', v)}
        error={errors.mode}
      />
      {text('carrierName', 'Carrier', 120, { placeholder: 'e.g. Maersk' })}
      {text('trackingNumber', 'Tracking no. (B/L, AWB or LR)', 80, {
        autoCapitalize: 'characters',
      })}
      {text('vesselName', 'Vessel', 120)}
      {text('voyageNumber', 'Voyage', 40, { autoCapitalize: 'characters' })}
      <InputField
        label="Container numbers"
        value={form.containers}
        onChangeText={(v) => set('containers', v)}
        placeholder="Comma separated, e.g. MSKU1234567, TGHU7654321"
        autoCapitalize="characters"
        autoCorrect={false}
        multiline
        error={errors.containers}
      />
      {text('originLocation', 'Origin', 160, {
        placeholder: editing ? undefined : "Leave empty to use the deal's port of loading",
      })}
      {text('destinationLocation', 'Destination', 160, {
        placeholder: editing ? undefined : "Leave empty to use the deal's port of discharge",
      })}
      <DateField
        label="ETD (estimated departure)"
        value={form.etd}
        onChange={(v) => set('etd', v)}
        error={errors.etd}
      />
      <DateField
        label="ETA (estimated arrival)"
        value={form.eta}
        minimumDate={form.etd}
        hint="Leave empty until the carrier confirms an arrival date."
        onChange={(v) => set('eta', v)}
        error={errors.eta}
      />
      {text('remarks', 'Remarks', 2000, { multiline: true })}
    </SheetLayout>
  );
}

type EventSheetProps = {
  visible: boolean;
  kind: 'status' | 'note';
  shipment: ImportShipment | null;
  onClose: () => void;
  onChanged: () => Promise<void>;
};

function ShipmentEventSheet(props: EventSheetProps) {
  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="slide"
      onRequestClose={props.onClose}
      statusBarTranslucent
    >
      {props.visible && props.shipment ? (
        <ShipmentEventForm {...props} shipment={props.shipment} />
      ) : null}
    </Modal>
  );
}

function ShipmentEventForm({
  kind,
  shipment,
  onClose,
  onChanged,
}: EventSheetProps & { shipment: ImportShipment }) {
  const [opened] = useState(() => new Date());
  const [status, setStatus] = useState<ImportShipmentStatus | null>(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<string>(toDateOnly(opened));
  const [time, setTime] = useState(`${pad(opened.getHours())}:${pad(opened.getMinutes())}`);
  const [timeTouched, setTimeTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const isStatus = kind === 'status';
  const needsDescription = status === 'EXCEPTION';

  function occurredAt(): Date | null {
    const match = TIME.exec(time.trim());
    if (!match) return null;
    const [y, m, d] = date.split('-').map(Number);
    return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, Number(match[1]), Number(match[2]));
  }

  async function submit() {
    const local: Record<string, string> = {};
    if (isStatus && !status) local.status = 'Choose the new status.';
    if (needsDescription && !description.trim()) {
      local.description = 'Describe the exception so the buyer knows what happened.';
    }
    if (!isStatus && !location.trim() && !description.trim()) {
      local.description = 'Add a location or a note.';
    }
    const at = occurredAt();
    if (!at) local.occurredAt = 'Enter the time as HH:MM (24-hour).';
    else if (at.getTime() > Date.now() + 60_000) local.occurredAt = 'Cannot be in the future.';
    setErrors(local);
    if (Object.keys(local).length) return;

    const body: ImportShipmentEventInput = {};
    if (isStatus && status) body.status = status;
    if (location.trim()) body.location = location.trim();
    if (description.trim()) body.description = description.trim();
    if (timeTouched && at) body.occurredAt = at.toISOString();

    setSubmitting(true);
    try {
      const updated = await addShipmentEvent(shipment.id, body);
      Toast.show({
        type: 'success',
        text1: isStatus
          ? `${updated.referenceNumber}: ${importLabel(updated.status)}`
          : 'Update added',
      });
      onClose();
      await onChanged();
    } catch (error) {
      const e = parseImportError(error);
      if (e.code === 'IMPORT_DRAFT_CONFLICT' || e.code === 'IMPORT_INVALID_STATUS_TRANSITION') {
        onClose();
        Toast.show({
          type: 'info',
          text1: 'This shipment has changed',
          text2: 'The latest status is loaded. Review it and try again.',
        });
        await onChanged();
        return;
      }
      if (e.fields.length) setErrors(Object.fromEntries(e.fields.map((f) => [f.field, f.message])));
      Toast.show({ type: 'error', text1: e.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SheetLayout
      title={isStatus ? 'Update status' : 'Add note'}
      description={`${shipment.referenceNumber} · currently ${importLabel(shipment.status).toLowerCase()}. The buyer can see this update.`}
      onClose={onClose}
      footer={
        <>
          <SecondaryButton
            variant="outline"
            label="Cancel"
            className="flex-1"
            disabled={submitting}
            onPress={onClose}
          />
          <PrimaryButton
            label={submitting ? 'Saving…' : isStatus ? 'Update status' : 'Add note'}
            className="flex-1"
            disabled={submitting}
            onPress={() => void submit()}
          />
        </>
      }
    >
      {isStatus ? (
        <ChoiceChips
          label="New status *"
          options={shipment.allowedTransitions ?? []}
          value={status}
          onChange={(v) => {
            setStatus(v);
            setErrors((e) => {
              const rest = { ...e };
              delete rest.status;
              return rest;
            });
          }}
          error={errors.status}
        />
      ) : null}
      {status === 'CANCELLED' ? (
        <Notice tone="warning">
          Cancelling releases this quantity so it can be booked on another shipment. This cannot be
          undone.
        </Notice>
      ) : null}
      <InputField
        label="Location"
        value={location}
        onChangeText={setLocation}
        maxLength={160}
        placeholder="e.g. Nhava Sheva (INNSA)"
        error={errors.location}
      />
      <InputField
        label={needsDescription ? 'Description *' : isStatus ? 'Description' : 'Note'}
        value={description}
        onChangeText={setDescription}
        maxLength={2000}
        multiline
        error={errors.description}
      />
      <DateField
        label="Date"
        required
        value={date}
        maximumDate={toDateOnly(new Date())}
        onChange={(v) => {
          if (v) setDate(v);
          setTimeTouched(true);
        }}
      />
      <InputField
        label="Time (24-hour)"
        value={time}
        onChangeText={(v) => {
          setTime(v);
          setTimeTouched(true);
        }}
        placeholder="HH:MM"
        keyboardType="numbers-and-punctuation"
        maxLength={5}
        error={errors.occurredAt}
      />
      <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
        Defaults to now. Back-date it if the event happened earlier.
      </Typography>
    </SheetLayout>
  );
}
