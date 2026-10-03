import { useRef, useState } from 'react';

import { Pressable, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import Toast from 'react-native-toast-message';

import { PrimaryButton, SecondaryButton, Typography } from '@/components';
import { useCanManageImport, ViewOnlyNotice } from '@/features/import/access';
import {
  acceptNegotiation,
  closeNegotiation,
  confirmDeal,
  counterNegotiation,
  fetchDeal,
  fetchImportMaster,
  fetchNegotiation,
} from '@/features/import/api';
import {
  Card,
  ErrorBlock,
  ImportScreen,
  KeyValues,
  LoadingBlock,
  Notice,
  StatusPill,
  useImportLoader,
} from '@/features/import/components';
import { IMPORT_MODES, type ImportMode } from '@/features/import/config';
import {
  formatDate,
  formatDateTime,
  formatPrice,
  formatQty,
  importLabel,
  newIdempotencyKey,
  parseImportError,
} from '@/features/import/format';
import { pushImport } from '@/features/import/screens/list-screens';
import { ShipmentsSection } from '@/features/import/shipments';
import { ReasonSheet, TermsSheet } from '@/features/import/trade-widgets';
import type {
  ImportListingSummary,
  ImportNegotiationEvent,
  ImportParty,
} from '@/features/import/types';
import { cn } from '@/utils/cn';

function partyLabel(actor: ImportParty | 'SYSTEM' | null, mine: ImportParty): string {
  if (!actor) return '—';
  if (actor === 'SYSTEM') return 'System';
  return actor === mine ? 'You' : importLabel(actor);
}

function EventTerms({ e }: { e: ImportNegotiationEvent }) {
  if (!e.price && !e.quantity) return null;
  const rows: [string, string][] = [
    [
      'Price',
      `${formatPrice(e.price, e.currencyCode, e.priceUnit)} ${e.incotermCode ?? ''}`.trim(),
    ],
    ['Quantity', formatQty(e.quantity, e.quantityUnit)],
  ];
  if (e.moq) rows.push(['MOQ', formatQty(e.moq, e.quantityUnit)]);
  if (e.paymentTermName) rows.push(['Payment', e.paymentTermName]);
  if (e.esd) rows.push(['Shipment', `${formatDate(e.esd)} – ${formatDate(e.lsd)}`]);
  if (e.inspectionType) rows.push(['Inspection', importLabel(e.inspectionType)]);
  return (
    <View className="mt-sm">
      <KeyValues rows={rows} />
      {e.otherTerms ? (
        <Typography variant="roleDescription" className="mt-xs">
          {e.otherTerms}
        </Typography>
      ) : null}
    </View>
  );
}

function ListingLink({ mode, listing }: { mode: ImportMode; listing: ImportListingSummary }) {
  const cfg = IMPORT_MODES[mode];
  const router = useRouter();
  const own = listing.side === cfg.ownSide;
  return (
    <Pressable
      onPress={() =>
        pushImport(router, own ? cfg.routes.listing : cfg.routes.marketListing, { id: listing.id })
      }
      className="rounded-2xl border border-brand-border bg-brand-white p-lg active:opacity-80"
    >
      <Typography variant="fieldLabel" className="text-brand-muted">
        {listing.side === 'BUY' ? 'Buy request' : 'Sell offer'}
      </Typography>
      <Typography variant="link" className="mt-xs font-semibold">
        {listing.referenceNumber ?? '—'}
      </Typography>
      <Typography variant="roleDescription" className="mt-xs">
        {[listing.product, listing.grade, listing.brand].filter(Boolean).join(' · ')}
      </Typography>
      <Typography variant="roleDescription" className="mt-xs text-brand-muted">
        {formatQty(listing.quantity, listing.quantityUnit)} ·{' '}
        {formatPrice(listing.price, listing.currencyCode, listing.priceUnit)}{' '}
        {listing.incoterm ?? ''} · {listing.pol?.code ?? '—'} → {listing.pod?.code ?? '—'}
      </Typography>
    </Pressable>
  );
}

// Negotiation detail ----------------------------------------------------------------

export function ImportNegotiationScreen({ mode }: { mode: ImportMode }) {
  const cfg = IMPORT_MODES[mode];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [counterOpen, setCounterOpen] = useState(false);
  const [closing, setClosing] = useState<'reject' | 'withdraw' | null>(null);
  const [busy, setBusy] = useState(false);
  const acceptKey = useRef(newIdempotencyKey());
  const canManage = useCanManageImport(mode);

  const state = useImportLoader(async () => {
    const [negotiation, master] = await Promise.all([fetchNegotiation(id), fetchImportMaster()]);
    return { negotiation, master };
  }, [id]);
  const n = state.data?.negotiation;
  const can = (a: 'COUNTER' | 'ACCEPT' | 'REJECT' | 'WITHDRAW') =>
    canManage && Boolean(n?.allowedActions.includes(a));

  async function accept() {
    if (!n) return;
    setBusy(true);
    try {
      const result = await acceptNegotiation(n.id, acceptKey.current);
      Toast.show({
        type: 'success',
        text1: 'Terms accepted',
        text2: 'Confirm the deal to finalise it.',
      });
      if (result.deal) {
        pushImport(router, cfg.routes.deal, { id: result.deal.id });
      } else {
        await state.reload();
      }
    } catch (error) {
      const e = parseImportError(error);
      if (e.status !== null) acceptKey.current = newIdempotencyKey();
      Toast.show({ type: 'error', text1: e.message });
      void state.reload();
    } finally {
      setBusy(false);
    }
  }

  async function close(note: string) {
    if (!n || !closing) return;
    setBusy(true);
    try {
      await closeNegotiation(n.id, closing, note || undefined);
      Toast.show({
        type: 'success',
        text1: closing === 'reject' ? 'Offer rejected' : 'Negotiation withdrawn',
      });
      setClosing(null);
      await state.reload();
    } catch (error) {
      Toast.show({ type: 'error', text1: parseImportError(error).message });
    } finally {
      setBusy(false);
    }
  }

  const latest = n?.latestTerms;
  const hasActions = can('ACCEPT') || can('COUNTER') || can('REJECT') || can('WITHDRAW');

  return (
    <ImportScreen
      title={n?.referenceNumber ?? 'Negotiation'}
      refreshing={state.refreshing}
      onRefresh={state.refresh}
      footer={
        n && hasActions ? (
          <View className="gap-sm">
            {can('ACCEPT') ? (
              <PrimaryButton
                label={busy ? 'Working…' : 'Accept terms'}
                disabled={busy}
                onPress={() => void accept()}
              />
            ) : null}
            <View className="flex-row gap-sm">
              {can('COUNTER') ? (
                <SecondaryButton
                  variant="outline"
                  label="Counter"
                  className="flex-1"
                  disabled={busy}
                  onPress={() => setCounterOpen(true)}
                />
              ) : null}
              {can('REJECT') ? (
                <SecondaryButton
                  variant="outline"
                  label="Reject"
                  className="flex-1"
                  disabled={busy}
                  onPress={() => setClosing('reject')}
                />
              ) : null}
              {can('WITHDRAW') ? (
                <SecondaryButton
                  variant="outline"
                  label="Withdraw"
                  className="flex-1"
                  disabled={busy}
                  onPress={() => setClosing('withdraw')}
                />
              ) : null}
            </View>
          </View>
        ) : null
      }
    >
      {state.loading && !state.data ? (
        <LoadingBlock />
      ) : state.error || !n || !state.data ? (
        <ErrorBlock
          message={state.error ?? 'Negotiation not found.'}
          onRetry={() => void state.reload()}
        />
      ) : (
        <>
          {!canManage ? <ViewOnlyNotice /> : null}
          {n.status === 'OPEN' ? (
            <Notice tone={n.awaitingMyResponse ? 'warning' : 'neutral'}>
              {n.awaitingMyResponse
                ? `Your response is due${n.expiresAt ? ` by ${formatDateTime(n.expiresAt)}` : ''}.`
                : `Waiting for the ${cfg.copy.counterparty.toLowerCase()} to respond${n.expiresAt ? ` (expires ${formatDateTime(n.expiresAt)})` : ''}.`}
            </Notice>
          ) : null}
          {n.deal ? (
            <Pressable
              onPress={() => n.deal && pushImport(router, cfg.routes.deal, { id: n.deal.id })}
              className="rounded-2xl border border-brand-success bg-brand-success-light p-lg"
            >
              <Typography variant="roleTitle" className="text-[14px] text-brand-success">
                Deal {n.deal.referenceNumber} · {importLabel(n.deal.status)}
              </Typography>
              <Typography variant="link" className="mt-xs">
                View deal ›
              </Typography>
            </Pressable>
          ) : null}
          <Card title="Summary" right={<StatusPill status={n.status} />}>
            <KeyValues
              rows={[
                [cfg.copy.counterparty, n.counterpartyRef],
                ['Rounds', String(n.roundCount)],
                [
                  'Fixed terms',
                  `${n.fixedTerms.currencyCode ?? '—'} / ${importLabel(n.fixedTerms.priceUnit)} · ${n.fixedTerms.incoterm ?? '—'}${n.fixedTerms.priceBasis ? ` ${n.fixedTerms.priceBasis}` : ''}`,
                ],
                [
                  'Latest terms',
                  latest
                    ? `${formatPrice(latest.price, latest.currencyCode, latest.priceUnit)} · ${formatQty(latest.quantity, latest.quantityUnit)}`
                    : null,
                ],
              ]}
            />
          </Card>
          <Card title="Timeline">
            <View className="gap-lg">
              {n.events.map((e) => {
                const mine = e.actorParty === n.myParty;
                return (
                  <View key={e.id} className="flex-row gap-md">
                    <View
                      className={cn(
                        'mt-[5px] h-3 w-3 rounded-full',
                        e.type === 'ACCEPTED'
                          ? 'bg-brand-success'
                          : e.type === 'REJECTED' || e.type === 'WITHDRAWN' || e.type === 'EXPIRED'
                            ? 'bg-brand-indicator'
                            : mine
                              ? 'bg-brand-primary'
                              : 'bg-[#F59E0B]',
                      )}
                    />
                    <View className="flex-1">
                      <Typography variant="roleTitle" className="text-[14px]">
                        {importLabel(e.type)} · {partyLabel(e.actorParty, n.myParty)}
                      </Typography>
                      <Typography
                        variant="roleDescription"
                        className="text-[12px] text-brand-muted"
                      >
                        #{e.sequence} · {formatDateTime(e.createdAt)}
                      </Typography>
                      <EventTerms e={e} />
                      {e.note ? (
                        <View className="mt-sm rounded-xl bg-brand-surface px-md py-sm">
                          <Typography variant="roleDescription">{e.note}</Typography>
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
          {[n.buyListing, n.sellListing].map((l) =>
            l ? <ListingLink key={l.id} mode={mode} listing={l} /> : null,
          )}
        </>
      )}
      {n && state.data ? (
        <TermsSheet
          visible={counterOpen}
          onClose={() => setCounterOpen(false)}
          title="Send a counteroffer"
          description="Edit the terms you want to change. Unchanged terms carry over from the last round."
          submitLabel="Send counteroffer"
          fixed={n.fixedTerms}
          inspectionTypes={state.data.master.enums.inspectionTypes}
          defaults={{
            price: latest?.price,
            quantity: latest?.quantity,
            paymentTermId: latest?.paymentTermId,
            esd: latest?.esd,
            lsd: latest?.lsd,
            inspectionType: latest?.inspectionType,
          }}
          onSubmit={async (terms, key) => {
            await counterNegotiation(n.id, terms, key);
            Toast.show({ type: 'success', text1: 'Counteroffer sent' });
            await state.reload();
          }}
        />
      ) : null}
      <ReasonSheet
        visible={closing !== null}
        title={closing === 'reject' ? 'Reject this offer?' : 'Withdraw from this negotiation?'}
        message="The negotiation closes permanently. You can start a new one while the listing is live."
        confirmLabel={closing === 'reject' ? 'Reject' : 'Withdraw'}
        inputLabel="Message (optional)"
        busy={busy}
        onClose={() => setClosing(null)}
        onConfirm={(note) => void close(note)}
      />
    </ImportScreen>
  );
}

// Deal detail -------------------------------------------------------------------------

export function ImportDealScreen({ mode }: { mode: ImportMode }) {
  const cfg = IMPORT_MODES[mode];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [busy, setBusy] = useState(false);
  const key = useRef(newIdempotencyKey());
  const canManage = useCanManageImport(mode);
  const state = useImportLoader(() => fetchDeal(id), [id]);
  const d = state.data;

  async function confirm() {
    if (!d) return;
    setBusy(true);
    try {
      const result = await confirmDeal(d.id, key.current);
      Toast.show({
        type: 'success',
        text1:
          result.status === 'CONFIRMED'
            ? 'Deal confirmed by both parties'
            : 'Your confirmation is recorded',
      });
      state.setData(result);
      void state.reload();
    } catch (error) {
      const e = parseImportError(error);
      if (e.status !== null) key.current = newIdempotencyKey();
      Toast.show({ type: 'error', text1: e.message });
    } finally {
      setBusy(false);
    }
  }

  const counterparty = d ? (d.myParty === 'BUYER' ? d.seller : d.buyer) : undefined;
  const counterpartyRef = d ? (d.myParty === 'BUYER' ? d.sellerRef : d.buyerRef) : '';
  const showShipments = Boolean(
    d &&
    ((d.shipments?.length ?? 0) > 0 ||
      ['CONFIRMED', 'PARTIALLY_FULFILLED', 'FULFILLED'].includes(d.status)),
  );

  return (
    <ImportScreen
      title={d?.referenceNumber ?? 'Deal'}
      refreshing={state.refreshing}
      onRefresh={state.refresh}
      footer={
        d?.awaitingMyConfirmation && canManage ? (
          <PrimaryButton
            label={busy ? 'Confirming…' : 'Confirm deal'}
            disabled={busy}
            onPress={() => void confirm()}
          />
        ) : null
      }
    >
      {state.loading && !d ? (
        <LoadingBlock />
      ) : state.error || !d ? (
        <ErrorBlock
          message={state.error ?? 'Deal not found.'}
          onRetry={() => void state.reload()}
        />
      ) : (
        <>
          {!canManage ? <ViewOnlyNotice /> : null}
          <Card>
            <View className="flex-row items-start justify-between gap-sm">
              <View className="flex-1">
                <Pressable
                  onPress={() =>
                    pushImport(router, cfg.routes.negotiation, { id: d.negotiation.id })
                  }
                >
                  <Typography variant="link">
                    Negotiation {d.negotiation.referenceNumber}
                  </Typography>
                </Pressable>
                <Typography variant="headingLeft" className="mt-xs text-[19px]">
                  {formatQty(d.quantity, d.quantityUnit)} at{' '}
                  {formatPrice(d.price, d.currencyCode, d.priceUnit)} {d.incotermCode ?? ''}
                </Typography>
              </View>
              <StatusPill status={d.status} />
            </View>
          </Card>
          <Card title="Agreed terms">
            <KeyValues
              rows={[
                ['Price', formatPrice(d.price, d.currencyCode, d.priceUnit)],
                ['Quantity', formatQty(d.quantity, d.quantityUnit)],
                ['Incoterm', [d.incotermCode, d.priceBasisLocation].filter(Boolean).join(' ')],
                ['Payment terms', d.paymentTermName],
                ['Shipment window', d.esd ? `${formatDate(d.esd)} – ${formatDate(d.lsd)}` : null],
                [cfg.copy.counterparty, counterparty ? counterparty.name : counterpartyRef],
              ]}
            />
          </Card>
          <Card title="Confirmations">
            <View className="gap-sm">
              {(['BUYER', 'SELLER'] as const).map((party) => {
                const at = party === 'BUYER' ? d.buyerConfirmedAt : d.sellerConfirmedAt;
                return (
                  <View
                    key={party}
                    className="flex-row items-center justify-between rounded-xl border border-brand-border px-md py-sm"
                  >
                    <Typography
                      variant="roleDescription"
                      className="font-medium text-brand-heading"
                    >
                      {party === d.myParty ? 'You' : cfg.copy.counterparty}
                    </Typography>
                    <Typography
                      variant="roleDescription"
                      className={at ? 'text-brand-success' : 'text-[#B45309]'}
                    >
                      {at ? `Confirmed ${formatDateTime(at)}` : 'Awaiting confirmation'}
                    </Typography>
                  </View>
                );
              })}
            </View>
            {d.status === 'PENDING_CONFIRMATION' ? (
              <Typography variant="roleDescription" className="mt-sm text-[12px] text-brand-muted">
                Company names are shared with both parties once both confirmations are recorded.
              </Typography>
            ) : null}
          </Card>
          {showShipments ? (
            <ShipmentsSection
              deal={{ ...d, shipments: d.shipments ?? [] }}
              canManage={mode === 'seller' && d.myParty === 'SELLER' && canManage}
              onChanged={state.reload}
            />
          ) : null}
        </>
      )}
    </ImportScreen>
  );
}
