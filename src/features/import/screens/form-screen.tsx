import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Pressable, View } from 'react-native';

import { type Href, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

import Toast from 'react-native-toast-message';

import { InputField, PrimaryButton, SecondaryButton, Typography } from '@/components';
import { useCanManageImport, ViewOnlyNotice } from '@/features/import/access';
import {
  createListing,
  fetchImportBrands,
  fetchImportGrades,
  fetchImportMaster,
  fetchImportPaymentTerms,
  fetchImportPorts,
  fetchImportProducts,
  fetchListing,
  publishListing,
  updateListing,
} from '@/features/import/api';
import {
  AsyncSelectField,
  Card,
  CheckRow,
  DateField,
  EnumField,
  ErrorBlock,
  ImportScreen,
  KeyValues,
  LoadingBlock,
  MoreDetails,
  Notice,
  SelectField,
  useImportLoader,
  type Option,
} from '@/features/import/components';
import { IMPORT_MODES, type ImportMode } from '@/features/import/config';
import {
  DECIMAL_PRICE,
  DECIMAL_QTY,
  formatDate,
  formatDateTime,
  importLabel,
  newIdempotencyKey,
  OPEN_STATUSES,
  parseImportError,
  portLabel,
  toDateOnly,
  type ImportFieldError,
} from '@/features/import/format';
import { DocumentsCard } from '@/features/import/trade-widgets';
import type {
  ImportListing,
  ImportListingInput,
  ImportMasterBundle,
  ImportSide,
} from '@/features/import/types';
import { showConfirmDialog } from '@/store/dialog-store';
import { cn } from '@/utils/cn';

type Values = Required<Pick<ImportListingInput, 'documentRequirementIds'>> &
  Omit<ImportListingInput, 'documentRequirementIds'>;

type StepId = 'product' | 'commercial' | 'shipping' | 'quality' | 'review';

const stepsFor = (side: ImportSide): { id: StepId; title: string }[] => [
  { id: 'product', title: 'Product' },
  { id: 'commercial', title: 'Commercial' },
  { id: 'shipping', title: 'Shipping' },
  { id: 'quality', title: 'Quality' },
  { id: 'review', title: side === 'BUY' ? 'Review & submit' : 'Review' },
];

/** BUY validity is assigned by the server on publish; the app never sends it. */
const VALIDITY_FIELDS = new Set(['validUntil', 'validFrom']);

/** Optional fields per step, collapsed under "More details" unless they hold values or errors. */
const OPTIONAL_PRODUCT_BUY: (keyof Values)[] = [
  'packagingId',
  'acceptableQuantityMin',
  'acceptableQuantityMax',
  'requiredDeliveryDate',
  'application',
  'hsCode',
  'casNumber',
  'specialRequirements',
];
const OPTIONAL_PRODUCT_SELL: (keyof Values)[] = [
  'packagingId',
  'maximumQuantity',
  'application',
  'hsCode',
  'casNumber',
];
const OPTIONAL_SHIPPING: (keyof Values)[] = [
  'transitMinDays',
  'transitMaxDays',
  'partialShipment',
  'transshipment',
  'shipmentType',
  'containerCount',
];
const OPTIONAL_QUALITY: (keyof Values)[] = [
  'specification',
  'inspectionType',
  'documentRequirementIds',
  'remarks',
];

const FIELD_STEP: Record<string, StepId> = {
  categoryId: 'product',
  gradeId: 'product',
  customGradeName: 'product',
  brandId: 'product',
  originCountryId: 'product',
  quantity: 'product',
  quantityUnit: 'product',
  packagingId: 'product',
  application: 'product',
  hsCode: 'product',
  casNumber: 'product',
  acceptableQuantityMin: 'product',
  acceptableQuantityMax: 'product',
  requiredDeliveryDate: 'product',
  specialRequirements: 'product',
  moq: 'product',
  maximumQuantity: 'product',
  readyStockType: 'product',
  price: 'commercial',
  currencyId: 'commercial',
  priceUnit: 'commercial',
  priceType: 'commercial',
  incotermId: 'commercial',
  priceBasisPortId: 'commercial',
  priceBasisLocation: 'commercial',
  paymentTermId: 'commercial',
  gstTreatment: 'commercial',
  polId: 'shipping',
  podId: 'shipping',
  esd: 'shipping',
  lsd: 'shipping',
  transitMinDays: 'shipping',
  transitMaxDays: 'shipping',
  partialShipment: 'shipping',
  transshipment: 'shipping',
  shipmentType: 'shipping',
  containerSize: 'shipping',
  containerCount: 'shipping',
  specification: 'quality',
  inspectionType: 'quality',
  documentRequirementIds: 'quality',
  remarks: 'quality',
  validUntil: 'review',
  validFrom: 'review',
};

/** Fields frozen once published (mirrors the backend LOCKED_AFTER_PUBLISH). */
const LOCKED_AFTER_PUBLISH = new Set([
  'categoryId',
  'gradeId',
  'customGradeName',
  'brandId',
  'originCountryId',
  'currencyId',
  'incotermId',
  'polId',
  'podId',
  'quantityUnit',
  'priceUnit',
]);

const DECIMAL_FIELDS: Record<string, RegExp> = {
  quantity: DECIMAL_QTY,
  acceptableQuantityMin: DECIMAL_QTY,
  acceptableQuantityMax: DECIMAL_QTY,
  moq: DECIMAL_QTY,
  maximumQuantity: DECIMAL_QTY,
  price: DECIMAL_PRICE,
};

function toValues(side: ImportSide, l?: ImportListing | null): Values {
  return {
    categoryId: l?.product.categoryId ?? null,
    gradeId: l?.product.gradeId ?? null,
    customGradeName: l?.product.customGradeName ?? null,
    brandId: l?.product.brandId ?? null,
    originCountryId: l?.product.originCountryId ?? null,
    quantity: l?.product.quantity ?? null,
    quantityUnit: l?.product.quantityUnit ?? 'MT',
    packagingId: l?.product.packagingId ?? null,
    application: l?.product.application ?? null,
    hsCode: l?.product.hsCode ?? null,
    casNumber: l?.product.casNumber ?? null,
    price: l?.commercial.price ?? null,
    currencyId: l?.commercial.currencyId ?? null,
    priceUnit: l?.commercial.priceUnit ?? 'MT',
    priceType: l?.commercial.priceType ?? null,
    incotermId: l?.commercial.incotermId ?? null,
    priceBasisPortId: l?.commercial.priceBasisPortId ?? null,
    priceBasisLocation: l?.commercial.priceBasisLocation ?? null,
    paymentTermId: l?.commercial.paymentTermId ?? null,
    gstTreatment: l?.commercial.gstTreatment ?? null,
    polId: l?.shipping.polId ?? null,
    podId: l?.shipping.podId ?? null,
    esd: l?.shipping.esd ?? null,
    lsd: l?.shipping.lsd ?? null,
    transitMinDays: l?.shipping.transitMinDays ?? null,
    transitMaxDays: l?.shipping.transitMaxDays ?? null,
    partialShipment: l?.shipping.partialShipment ?? null,
    transshipment: l?.shipping.transshipment ?? null,
    shipmentType: l?.shipping.shipmentType ?? null,
    containerSize: l?.shipping.containerSize ?? null,
    containerCount: l?.shipping.containerCount ?? null,
    specification: l?.quality.specification ?? null,
    inspectionType: l?.quality.inspectionType ?? null,
    documentRequirementIds: l?.quality.documentRequirementIds ?? [],
    acceptableQuantityMin: l?.buyTerms?.acceptableQuantityMin ?? null,
    acceptableQuantityMax: l?.buyTerms?.acceptableQuantityMax ?? null,
    requiredDeliveryDate: l?.buyTerms?.requiredDeliveryDate ?? null,
    specialRequirements: l?.buyTerms?.specialRequirements ?? null,
    moq: l?.sellTerms?.moq ?? null,
    maximumQuantity: l?.sellTerms?.maximumQuantity ?? null,
    readyStockType: l?.sellTerms?.readyStockType ?? null,
    remarks: l?.remarks ?? null,
    ...(side === 'SELL' ? { validUntil: l?.validity.validUntil ?? null } : {}),
  };
}

function payloadFor(side: ImportSide, input: ImportListingInput): ImportListingInput {
  if (side !== 'BUY') return input;
  const out: Record<string, unknown> = { ...input };
  for (const key of VALIDITY_FIELDS) delete out[key];
  return out as ImportListingInput;
}

function labelsFrom(l?: ImportListing | null): Record<string, string> {
  if (!l) return {};
  const out: Record<string, string> = {};
  if (l.product.category) out.categoryId = l.product.category.name;
  if (l.product.grade) out.gradeId = l.product.grade.name;
  if (l.product.brand) out.brandId = l.product.brand.name;
  if (l.shipping.pol) out.polId = portLabel(l.shipping.pol);
  if (l.shipping.pod) out.podId = portLabel(l.shipping.pod);
  if (l.commercial.priceBasisPort) out.priceBasisPortId = portLabel(l.commercial.priceBasisPort);
  return out;
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Only well-formed values are sent; malformed decimals wait for the user. */
function diff(from: Values, to: Values): ImportListingInput {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(to) as (keyof Values)[]) {
    const next = to[key];
    if (same(from[key], next)) continue;
    const pattern = DECIMAL_FIELDS[key];
    if (pattern && typeof next === 'string' && next !== '' && !pattern.test(next)) continue;
    out[key] = next === '' ? null : next;
  }
  return out as ImportListingInput;
}

function localDecimalError(key: string, value: unknown): string | undefined {
  const pattern = DECIMAL_FIELDS[key];
  if (!pattern || typeof value !== 'string' || value === '') return undefined;
  if (pattern.test(value)) return undefined;
  return key === 'price'
    ? 'Enter a number with up to 4 decimal places.'
    : 'Enter a number with up to 3 decimal places.';
}

/** New drafts start from the Admin-configured default import currency. */
function initialValues(
  side: ImportSide,
  initial: ImportListing | null,
  bundle: ImportMasterBundle,
): Values {
  const values = toValues(side, initial);
  if (initial || values.currencyId) return values;
  const def = bundle.currencies.find((c) => c.code === bundle.defaultCurrencyCode);
  return def ? { ...values, currencyId: def.id } : values;
}

/** End of the chosen local day, as an ISO instant. */
function endOfDayIso(dateOnly: string): string {
  const [y, m, d] = dateOnly.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, 23, 59, 0).toISOString();
}

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'conflict';

export function ImportListingFormScreen({ mode }: { mode: ImportMode }) {
  const cfg = IMPORT_MODES[mode];
  const { id } = useLocalSearchParams<{ id?: string }>();
  const canManage = useCanManageImport(mode);
  const state = useImportLoader(async () => {
    const [bundle, listing] = await Promise.all([
      fetchImportMaster(),
      id ? fetchListing(cfg.ownSide, id) : Promise.resolve(null),
    ]);
    return { bundle, listing };
  }, [cfg.ownSide, id]);

  const title = id ? `Edit ${cfg.copy.own.toLowerCase()}` : `New ${cfg.copy.own.toLowerCase()}`;
  // The form owns its state after the first load; later focus reloads must not reset it.
  const [loaded, setLoaded] = useState<typeof state.data>(null);
  if (state.data && !loaded) setLoaded(state.data);

  if (!canManage) {
    return (
      <ImportScreen title={title}>
        <ViewOnlyNotice />
      </ImportScreen>
    );
  }
  if (!loaded) {
    return (
      <ImportScreen title={title}>
        {state.error ? (
          <ErrorBlock message={state.error} onRetry={() => void state.reload()} />
        ) : (
          <LoadingBlock label="Loading form options…" />
        )}
      </ImportScreen>
    );
  }
  const l = loaded.listing;
  if (
    l &&
    (l.viewerRole !== 'OWNER' || ![...OPEN_STATUSES, 'DRAFT', 'PAUSED'].includes(l.status))
  ) {
    return (
      <ImportScreen title={title}>
        <ErrorBlock message="This listing can no longer be edited." />
      </ImportScreen>
    );
  }
  return <ListingForm mode={mode} side={cfg.ownSide} initial={l} bundle={loaded.bundle} />;
}

function ListingForm({
  mode,
  side,
  initial,
  bundle,
}: {
  mode: ImportMode;
  side: ImportSide;
  initial: ImportListing | null;
  bundle: ImportMasterBundle;
}) {
  const cfg = IMPORT_MODES[mode];
  const router = useRouter();
  const navigation = useNavigation();
  const isBuy = side === 'BUY';
  const live = Boolean(initial && initial.status !== 'DRAFT');
  const STEPS = useMemo(() => stepsFor(side), [side]);

  const [listing, setListing] = useState<ImportListing | null>(initial);
  const [values, setValues] = useState<Values>(() => initialValues(side, initial, bundle));
  const [labels, setLabels] = useState<Record<string, string>>(() => labelsFrom(initial));
  const [step, setStep] = useState<StepId>('product');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [terms, setTerms] = useState<Option[] | null>(null);

  const savedRef = useRef<Values>(initialValues(side, initial, bundle));
  const versionRef = useRef<number>(initial?.version ?? 0);
  const idRef = useRef<string | null>(initial?.id ?? null);
  const savingRef = useRef<Promise<boolean> | null>(null);
  const publishKeyRef = useRef<string | null>(null);
  const valuesRef = useRef(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);
  // Mirrors savedRef for rendering; savedRef stays authoritative inside async saves.
  const [savedSnapshot, setSavedSnapshot] = useState<Values>(() =>
    initialValues(side, initial, bundle),
  );

  const currencyCode = bundle.currencies.find((c) => c.id === values.currencyId)?.code ?? null;
  const incoterm = bundle.incoterms.find((i) => i.id === values.incotermId);

  useEffect(() => {
    if (!currencyCode) return;
    let cancelled = false;
    fetchImportPaymentTerms(currencyCode)
      .then((list) => {
        if (!cancelled)
          setTerms(list.map((t) => ({ value: t.id, label: t.displayName ?? t.name })));
      })
      .catch(() => {
        if (!cancelled) setTerms([]);
      });
    return () => {
      cancelled = true;
    };
  }, [currencyCode]);

  const set = useCallback(
    <K extends keyof Values>(key: K, value: Values[K], label?: string) => {
      if (live && LOCKED_AFTER_PUBLISH.has(key as string)) return;
      setValues((v) => {
        const next = { ...v, [key]: value };
        if (key === 'categoryId' && value !== v.categoryId) next.gradeId = null;
        // Payment terms depend on currency; GST applies to INR only.
        if (key === 'currencyId' && value !== v.currencyId) {
          next.paymentTermId = null;
          const code = bundle.currencies.find((c) => c.id === value)?.code;
          if (code !== 'INR') next.gstTreatment = null;
        }
        return next;
      });
      if (key === 'currencyId') setTerms(null);
      if (label !== undefined) setLabels((l) => ({ ...l, [key]: label }));
      setFieldErrors((e) => {
        if (!e[key as string]) return e;
        const rest = { ...e };
        delete rest[key as string];
        return rest;
      });
    },
    [live, bundle],
  );

  const pending = useMemo(() => diff(savedSnapshot, values), [savedSnapshot, values]);
  const hasPending = Object.keys(pending).length > 0;

  const applyErrors = useCallback(
    (errors: ImportFieldError[]) => {
      const relevant = isBuy ? errors.filter((e) => !VALIDITY_FIELDS.has(e.field)) : errors;
      if (relevant.length) {
        setFieldErrors(Object.fromEntries(relevant.map((e) => [e.field, e.message])));
      }
    },
    [isBuy],
  );

  /** Persists pending changes as a backend draft. Resolves false on failure. */
  const save = useCallback(async (): Promise<boolean> => {
    if (savingRef.current) await savingRef.current;
    const changes = diff(savedRef.current, valuesRef.current);
    if (!Object.keys(changes).length) return true;

    const run = (async () => {
      setSaveState('saving');
      try {
        let result: ImportListing;
        if (!idRef.current) {
          result = await createListing(
            side,
            payloadFor(side, { ...diff(toValues(side, null), savedRef.current), ...changes }),
          );
          idRef.current = result.id;
        } else {
          result = await updateListing(side, idRef.current, {
            ...payloadFor(side, changes),
            version: versionRef.current,
          });
        }
        versionRef.current = result.version;
        savedRef.current = { ...savedRef.current, ...(changes as Partial<Values>) };
        setSavedSnapshot(savedRef.current);
        setListing(result);
        setSavedAt(new Date().toISOString());
        setSaveState(same(diff(savedRef.current, valuesRef.current), {}) ? 'saved' : 'dirty');
        return true;
      } catch (error) {
        const e = parseImportError(error);
        if (e.code === 'IMPORT_DRAFT_CONFLICT') {
          setSaveState('conflict');
        } else {
          setSaveState('error');
          applyErrors(e.fields);
          if (!e.fields.length) Toast.show({ type: 'error', text1: e.message });
        }
        return false;
      }
    })();
    savingRef.current = run;
    try {
      return await run;
    } finally {
      savingRef.current = null;
    }
  }, [side, applyErrors]);

  // Drafts autosave after each edit; live listings save explicitly so
  // counterparties are not notified on every keystroke.
  const conflicted = saveState === 'conflict';
  useEffect(() => {
    if (live || conflicted) return;
    if (!Object.keys(diff(savedSnapshot, values)).length) return;
    const timer = setTimeout(() => void save(), 1500);
    return () => clearTimeout(timer);
  }, [values, savedSnapshot, live, conflicted, save]);

  // Confirm before leaving with unsaved edits.
  const leavingRef = useRef(false);
  useEffect(() => {
    return navigation.addListener('beforeRemove', (event) => {
      if (leavingRef.current || !Object.keys(diff(savedRef.current, valuesRef.current)).length) {
        return;
      }
      event.preventDefault();
      showConfirmDialog({
        title: 'Discard unsaved changes?',
        message: live
          ? 'Your edits to this live listing have not been saved.'
          : 'Some edits have not been saved to the draft yet.',
        confirmLabel: 'Discard',
        cancelLabel: 'Keep editing',
        onConfirm: () => {
          leavingRef.current = true;
          navigation.dispatch(event.data.action);
        },
      });
    });
  }, [navigation, live]);

  async function handleSaveLive() {
    if (await save()) Toast.show({ type: 'success', text1: 'Changes saved' });
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      const ok = await save();
      if (!ok || !idRef.current) return;
      publishKeyRef.current ??= newIdempotencyKey();
      const result = await publishListing(side, idRef.current, publishKeyRef.current);
      publishKeyRef.current = null;
      Toast.show({ type: 'success', text1: `${result.referenceNumber ?? 'Listing'} published` });
      leavingRef.current = true;
      router.replace({
        pathname: cfg.routes.listing,
        params: { id: result.id },
      } as unknown as Href);
    } catch (error) {
      const e = parseImportError(error);
      if (e.status !== null) publishKeyRef.current = null;
      const fields = isBuy ? e.fields.filter((f) => !VALIDITY_FIELDS.has(f.field)) : e.fields;
      if (fields.length) {
        applyErrors(fields);
        const firstField = fields[0]?.field;
        const first = firstField ? FIELD_STEP[firstField] : undefined;
        if (first) setStep(first);
        Toast.show({
          type: 'error',
          text1: `Please fix ${fields.length} field${fields.length > 1 ? 's' : ''} before publishing.`,
        });
      } else {
        Toast.show({ type: 'error', text1: e.message });
      }
    } finally {
      setPublishing(false);
    }
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const goToStep = (index: number) => {
    const target = STEPS[index];
    if (!target) return;
    if (!live && hasPending) void save();
    setStep(target.id);
  };
  const stepErrors = useMemo(() => {
    const counts: Partial<Record<StepId, number>> = {};
    for (const key of Object.keys(fieldErrors)) {
      const s = FIELD_STEP[key];
      if (s) counts[s] = (counts[s] ?? 0) + 1;
    }
    return counts;
  }, [fieldErrors]);

  const err = (key: string) =>
    fieldErrors[key] ?? localDecimalError(key, values[key as keyof Values]);
  const locked = (key: string) => live && LOCKED_AFTER_PUBLISH.has(key);
  const str = (key: keyof Values) => (values[key] as string | null | undefined) ?? '';

  const text = (
    key: keyof Values,
    label: string,
    opts: {
      required?: boolean;
      decimal?: boolean;
      multiline?: boolean;
      maxLength?: number;
      placeholder?: string;
    } = {},
  ) => (
    <InputField
      label={`${label}${opts.required ? ' *' : ''}`}
      value={str(key)}
      onChangeText={(v) =>
        set(key, (opts.decimal ? v.replace(/,/g, '').trim() : v) as Values[typeof key])
      }
      keyboardType={opts.decimal ? 'decimal-pad' : 'default'}
      multiline={opts.multiline}
      maxLength={opts.maxLength}
      placeholder={opts.placeholder}
      editable={!locked(key as string)}
      error={err(key as string)}
    />
  );

  const intField = (key: 'transitMinDays' | 'transitMaxDays' | 'containerCount', label: string) => (
    <InputField
      label={label}
      value={values[key] === null || values[key] === undefined ? '' : String(values[key])}
      onChangeText={(v) => {
        const digits = v.replace(/\D/g, '').slice(0, 4);
        set(key, digits === '' ? null : Number(digits));
      }}
      keyboardType="number-pad"
      error={err(key)}
    />
  );

  const enumField = (
    key: keyof Values,
    label: string,
    list: readonly string[],
    required?: boolean,
  ) => (
    <EnumField
      label={label}
      required={required}
      value={str(key) || null}
      values={list}
      disabled={locked(key as string)}
      error={err(key as string)}
      onChange={(v) => set(key, v as Values[typeof key])}
    />
  );

  const portField = (key: 'polId' | 'podId' | 'priceBasisPortId', label: string, hint?: string) => (
    <AsyncSelectField
      label={label}
      required
      value={values[key]}
      selectedLabel={labels[key]}
      placeholder="Search port or UN/LOCODE"
      hint={hint}
      disabled={locked(key)}
      error={err(key)}
      load={async (search) =>
        (await fetchImportPorts(search || undefined)).map((p) => ({
          value: p.id,
          label: portLabel(p),
          hint: p.countryCode,
        }))
      }
      onChange={(v, o) => set(key, v, o?.label ?? '')}
    />
  );

  const qtyUnit = importLabel(values.quantityUnit ?? 'MT');
  const termsName = terms?.find((t) => t.value === values.paymentTermId)?.label;
  const containerUnit = values.quantityUnit === 'CONTAINER';

  const filled = (keys: (keyof Values)[]) =>
    keys.some((k) => {
      const v = values[k];
      return Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined && v !== '';
    });
  const hasErr = (keys: (keyof Values)[]) => keys.some((k) => Boolean(err(k as string)));
  const optionalProduct = isBuy ? OPTIONAL_PRODUCT_BUY : OPTIONAL_PRODUCT_SELL;
  // Container size is mandatory when quantity is counted in containers.
  const optionalShipping: (keyof Values)[] = containerUnit
    ? OPTIONAL_SHIPPING
    : [...OPTIONAL_SHIPPING, 'containerSize'];
  const validityDays = bundle.buyRequestValidityDays;
  const docNames = bundle.documentRequirements
    .filter((d) => values.documentRequirementIds.includes(d.id))
    .map((d) => d.name)
    .join(', ');

  let statusLine: string;
  if (saveState === 'conflict') statusLine = 'Changed elsewhere — reload to continue';
  else if (saveState === 'saving') statusLine = 'Saving…';
  else if (saveState === 'error') statusLine = 'Not saved — check highlighted fields';
  else if (hasPending) statusLine = 'Unsaved changes';
  else if (savedAt) statusLine = `Saved ${formatDateTime(savedAt)}`;
  else statusLine = live ? 'No changes' : 'Draft saves automatically';

  const isLast = stepIndex === STEPS.length - 1;

  return (
    <ImportScreen
      title={
        listing?.referenceNumber ??
        (initial ? `Edit ${cfg.copy.own.toLowerCase()}` : `New ${cfg.copy.own.toLowerCase()}`)
      }
      footer={
        <View className="gap-sm">
          <Typography
            variant="roleDescription"
            className="text-center text-[12px] text-brand-muted"
          >
            {statusLine}
          </Typography>
          <View className="flex-row gap-sm">
            <SecondaryButton
              variant="outline"
              label="Back"
              className="flex-1"
              disabled={stepIndex === 0}
              onPress={() => goToStep(stepIndex - 1)}
            />
            {live ? (
              <PrimaryButton
                label={saveState === 'saving' ? 'Saving…' : 'Save changes'}
                className="flex-1"
                disabled={!hasPending || saveState === 'saving' || saveState === 'conflict'}
                onPress={() => void handleSaveLive()}
              />
            ) : isLast ? (
              <PrimaryButton
                label={publishing ? 'Publishing…' : 'Publish'}
                className="flex-1"
                disabled={publishing || saveState === 'conflict'}
                onPress={() => void handlePublish()}
              />
            ) : (
              <PrimaryButton
                label="Next"
                className="flex-1"
                onPress={() => goToStep(stepIndex + 1)}
              />
            )}
          </View>
          {live && !isLast ? (
            <Pressable onPress={() => goToStep(stepIndex + 1)} className="items-center py-xs">
              <Typography variant="link">Next section ›</Typography>
            </Pressable>
          ) : null}
        </View>
      }
    >
      <View className="flex-row gap-xs">
        {STEPS.map((s, i) => {
          const active = s.id === step;
          const errors = stepErrors[s.id];
          return (
            <Pressable
              key={s.id}
              onPress={() => goToStep(i)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className="flex-1 items-center gap-xs"
            >
              <View
                className={cn(
                  'h-7 w-7 items-center justify-center rounded-full',
                  errors
                    ? 'bg-brand-error-light'
                    : active
                      ? 'bg-brand-primary'
                      : i < stepIndex
                        ? 'bg-brand-success-light'
                        : 'bg-brand-border',
                )}
              >
                <Typography
                  variant="badge"
                  className={cn(
                    errors
                      ? 'text-brand-error'
                      : active
                        ? 'text-brand-white'
                        : i < stepIndex
                          ? 'text-brand-success'
                          : 'text-brand-body',
                  )}
                >
                  {errors ? '!' : i < stepIndex ? '✓' : String(i + 1)}
                </Typography>
              </View>
              <Typography
                variant="roleDescription"
                className={cn(
                  'text-center text-[11px]',
                  active ? 'font-semibold text-brand-heading' : 'text-brand-muted',
                )}
              >
                {s.title}
              </Typography>
            </Pressable>
          );
        })}
      </View>

      {saveState === 'conflict' ? (
        <Notice tone="warning">
          This draft was changed on another device. Go back and reopen it to get the latest version.
          Unsaved edits here will be discarded.
        </Notice>
      ) : null}
      {live ? (
        <Notice tone="info">
          This listing is live. Product, origin, currency, Incoterm, ports and units are locked.
          Counterparties in active negotiations are notified when price, shipment dates or payment
          terms change.
        </Notice>
      ) : null}

      {step === 'product' ? (
        <Card title="Product details">
          <View className="gap-lg">
            <AsyncSelectField
              label="Product / material"
              required
              value={values.categoryId}
              selectedLabel={labels.categoryId}
              placeholder="Search product (e.g. PP, HDPE)"
              disabled={locked('categoryId')}
              error={err('categoryId')}
              load={async (search) =>
                (await fetchImportProducts(search || undefined)).map((p) => ({
                  value: p.id,
                  label: p.displayName ?? p.name,
                  hint: p.parentGroup ?? undefined,
                }))
              }
              onChange={(v, o) => set('categoryId', v, o?.label ?? '')}
            />
            <AsyncSelectField
              label="Grade"
              required
              value={values.gradeId}
              selectedLabel={labels.gradeId}
              placeholder={values.categoryId ? 'Search grade' : 'Select a product first'}
              hint={
                bundle.allowCustomGrade
                  ? "Can't find it? Enter a custom grade name below."
                  : undefined
              }
              disabled={!values.categoryId || locked('gradeId')}
              error={err('gradeId')}
              load={async (search) =>
                (
                  await fetchImportGrades(values.categoryId ?? undefined, search || undefined, side)
                ).map((g) => ({
                  value: g.id,
                  label: g.displayName ?? g.name,
                  hint: [g.manufacturer, g.gradeGroup].filter(Boolean).join(' · ') || g.code,
                }))
              }
              onChange={(v, o) => set('gradeId', v, o?.label ?? '')}
            />
            {bundle.allowCustomGrade && !values.gradeId
              ? text('customGradeName', 'Custom grade name', {
                  maxLength: 120,
                  placeholder: 'Grade as quoted by the manufacturer',
                })
              : null}
            <AsyncSelectField
              label="Brand / manufacturer"
              required
              value={values.brandId}
              selectedLabel={labels.brandId}
              placeholder="Search brand"
              disabled={locked('brandId')}
              error={err('brandId')}
              load={async (search) =>
                (await fetchImportBrands(search || undefined)).map((b) => ({
                  value: b.id,
                  label: b.name,
                  hint: b.country?.code,
                }))
              }
              onChange={(v, o) => set('brandId', v, o?.label ?? '')}
            />
            <SelectField
              label="Country of origin"
              required
              value={values.originCountryId}
              placeholder="Select country"
              disabled={locked('originCountryId')}
              error={err('originCountryId')}
              options={bundle.countries.map((c) => ({ value: c.id, label: c.name, hint: c.code }))}
              onChange={(v) => set('originCountryId', v)}
            />
            {text('quantity', isBuy ? 'Required quantity' : 'Available quantity', {
              required: true,
              decimal: true,
              placeholder: 'e.g. 500',
            })}
            {enumField('quantityUnit', 'Unit', bundle.enums.quantityUnits, true)}
            {!isBuy ? (
              <>
                {text('moq', `Minimum order quantity (${qtyUnit})`, {
                  required: true,
                  decimal: true,
                })}
                {enumField('readyStockType', 'Stock type', bundle.enums.readyStockTypes, true)}
              </>
            ) : null}
            <MoreDetails hasValues={filled(optionalProduct)} hasErrors={hasErr(optionalProduct)}>
              <SelectField
                label="Packaging"
                value={values.packagingId}
                placeholder="Select packaging"
                options={bundle.packaging.map((p) => ({ value: p.id, label: p.name }))}
                error={err('packagingId')}
                onChange={(v) => set('packagingId', v)}
              />
              {isBuy ? (
                <>
                  {text('acceptableQuantityMin', `Minimum acceptable quantity (${qtyUnit})`, {
                    decimal: true,
                  })}
                  {text('acceptableQuantityMax', `Maximum acceptable quantity (${qtyUnit})`, {
                    decimal: true,
                  })}
                  <DateField
                    label="Required delivery date"
                    value={values.requiredDeliveryDate}
                    minimumDate={toDateOnly(new Date())}
                    error={err('requiredDeliveryDate')}
                    onChange={(v) => set('requiredDeliveryDate', v)}
                  />
                </>
              ) : (
                text('maximumQuantity', `Maximum per buyer (${qtyUnit})`, { decimal: true })
              )}
              {text('application', 'Application', {
                maxLength: 300,
                placeholder: 'e.g. Injection moulding',
              })}
              {text('hsCode', 'HS code', { maxLength: 20, placeholder: 'e.g. 39021000' })}
              {text('casNumber', 'CAS number', { maxLength: 20, placeholder: 'e.g. 9003-07-0' })}
              {isBuy
                ? text('specialRequirements', 'Special requirements', {
                    multiline: true,
                    maxLength: 3000,
                  })
                : null}
            </MoreDetails>
          </View>
        </Card>
      ) : null}

      {step === 'commercial' ? (
        <Card title="Commercial terms">
          <View className="gap-lg">
            <SelectField
              label="Currency"
              required
              value={values.currencyId}
              placeholder="Select currency"
              disabled={locked('currencyId')}
              error={err('currencyId')}
              options={bundle.currencies.map((c) => ({
                value: c.id,
                label: `${c.code} — ${c.name}`,
              }))}
              onChange={(v) => set('currencyId', v)}
            />
            {enumField('priceType', 'Price type', bundle.enums.priceTypes, true)}
            {text('price', `${cfg.copy.price}${currencyCode ? ` (${currencyCode})` : ''}`, {
              required: true,
              decimal: true,
              placeholder: 'e.g. 1050.00',
            })}
            {enumField('priceUnit', 'Price per', bundle.enums.quantityUnits, true)}
            <SelectField
              label="Incoterm"
              required
              value={values.incotermId}
              placeholder="Select Incoterm"
              disabled={locked('incotermId')}
              error={err('incotermId')}
              options={bundle.incoterms.map((i) => ({
                value: i.id,
                label: `${i.code} — ${i.name}`,
              }))}
              onChange={(v) => {
                set('incotermId', v);
                const basis = bundle.incoterms.find((i) => i.id === v)?.priceBasis;
                const port =
                  basis === 'ORIGIN' ? 'polId' : basis === 'DESTINATION' ? 'podId' : null;
                if (port && values[port] && !values.priceBasisPortId) {
                  set('priceBasisPortId', values[port], labels[port]);
                }
              }}
            />
            {portField(
              'priceBasisPortId',
              'Price basis port',
              incoterm?.priceBasis === 'ORIGIN'
                ? 'For this Incoterm the price usually refers to the port of loading.'
                : incoterm?.priceBasis === 'DESTINATION'
                  ? 'For this Incoterm the price usually refers to the port of discharge.'
                  : 'Prices are only compared when Incoterm and basis location match.',
            )}
            {!values.priceBasisPortId
              ? text('priceBasisLocation', 'Price basis location (if not a listed port)', {
                  maxLength: 160,
                })
              : null}
            <SelectField
              label="Payment terms"
              required
              value={values.paymentTermId}
              placeholder={
                !currencyCode
                  ? 'Select a currency first'
                  : terms === null
                    ? 'Loading…'
                    : 'Select payment term'
              }
              hint={currencyCode ? `Showing terms available for ${currencyCode}.` : undefined}
              disabled={!currencyCode || terms === null}
              error={err('paymentTermId')}
              options={terms ?? []}
              onChange={(v) => set('paymentTermId', v)}
            />
            {currencyCode === 'INR'
              ? enumField('gstTreatment', 'GST treatment', bundle.enums.gstTreatments, true)
              : null}
          </View>
        </Card>
      ) : null}

      {step === 'shipping' ? (
        <Card title="Shipping">
          <View className="gap-lg">
            {portField('polId', 'Port of loading (POL)')}
            {portField('podId', 'Port of discharge (POD)')}
            <DateField
              label="Earliest shipment date"
              required
              value={values.esd}
              minimumDate={toDateOnly(new Date())}
              error={err('esd')}
              onChange={(v) => set('esd', v)}
            />
            <DateField
              label="Latest shipment date"
              required
              value={values.lsd}
              minimumDate={values.esd ?? toDateOnly(new Date())}
              error={
                err('lsd') ??
                (values.esd && values.lsd && values.esd > values.lsd
                  ? 'Must be on or after the earliest shipment date.'
                  : undefined)
              }
              onChange={(v) => set('lsd', v)}
            />
            {containerUnit
              ? enumField('containerSize', 'Container size', bundle.enums.containerSizes, true)
              : null}
            <MoreDetails hasValues={filled(optionalShipping)} hasErrors={hasErr(optionalShipping)}>
              {intField('transitMinDays', 'Transit time — minimum days')}
              {intField('transitMaxDays', 'Transit time — maximum days')}
              <Notice tone="neutral">
                Estimated arrival:{' '}
                {listing?.shipping.estimatedEta
                  ? `${formatDate(listing.shipping.estimatedEta.from)} – ${formatDate(listing.shipping.estimatedEta.to)}`
                  : 'add shipment dates and transit days to see an estimate'}
                . Estimate only: shipment window plus transit days, not a carrier schedule.
              </Notice>
              {enumField('partialShipment', 'Partial shipment', bundle.enums.shipmentPermissions)}
              {enumField('transshipment', 'Transshipment', bundle.enums.shipmentPermissions)}
              {enumField('shipmentType', 'Shipment type', bundle.enums.shipmentTypes)}
              {!containerUnit
                ? enumField('containerSize', 'Container size', bundle.enums.containerSizes)
                : null}
              {intField('containerCount', 'Number of containers')}
            </MoreDetails>
          </View>
        </Card>
      ) : null}

      {step === 'quality' ? (
        <>
          <Card title="Quality & documents">
            <View className="gap-lg">
              <Typography variant="roleDescription" className="text-brand-muted">
                Nothing here is required. Specifications and documents help{' '}
                {cfg.copy.counterparty.toLowerCase()}s respond with accurate terms.
              </Typography>
              <MoreDetails
                hasValues={filled(OPTIONAL_QUALITY)}
                hasErrors={hasErr(OPTIONAL_QUALITY)}
              >
                {text('specification', 'Specification', {
                  multiline: true,
                  maxLength: 5000,
                  placeholder: 'MFI, density, additives, moisture…',
                })}
                {enumField('inspectionType', 'Inspection', bundle.enums.inspectionTypes)}
                <View className="gap-sm">
                  <Typography variant="fieldLabel">
                    {isBuy ? 'Required documents' : 'Documents offered'}
                  </Typography>
                  {bundle.documentRequirements.map((d) => {
                    const checked = values.documentRequirementIds.includes(d.id);
                    return (
                      <CheckRow
                        key={d.id}
                        checked={checked}
                        title={d.name}
                        description={d.description}
                        onToggle={() =>
                          set(
                            'documentRequirementIds',
                            checked
                              ? values.documentRequirementIds.filter((x) => x !== d.id)
                              : [...values.documentRequirementIds, d.id],
                          )
                        }
                      />
                    );
                  })}
                  {err('documentRequirementIds') ? (
                    <Typography variant="error">{err('documentRequirementIds')}</Typography>
                  ) : null}
                </View>
                {text('remarks', 'Remarks', { multiline: true, maxLength: 3000 })}
              </MoreDetails>
            </View>
          </Card>
          {listing ? (
            <DocumentsCard listingId={listing.id} canManage />
          ) : (
            <Notice tone="neutral">
              Attachments (COA, TDS, certificates) can be uploaded once the draft has been saved.
            </Notice>
          )}
        </>
      ) : null}

      {step === 'review' ? (
        <>
          {isBuy ? (
            <Notice tone="info">
              {live && listing?.validity.validUntil
                ? `This request is open until ${formatDateTime(listing.validity.validUntil)}.`
                : validityDays
                  ? `Your request stays open for ${validityDays} days after you publish it.`
                  : 'Your request stays open for a fixed period after you publish it. The closing date is set when it goes live.'}
            </Notice>
          ) : (
            <Card title="Validity">
              <View className="gap-md">
                <DateField
                  label="Valid until"
                  required
                  value={values.validUntil ? toDateOnly(new Date(values.validUntil)) : null}
                  minimumDate={toDateOnly(new Date())}
                  hint={
                    values.validUntil
                      ? `Expires ${formatDateTime(values.validUntil)} (checked against the server clock).`
                      : 'The listing expires automatically at the end of this day.'
                  }
                  error={err('validUntil')}
                  onChange={(v) => set('validUntil', v ? endOfDayIso(v) : null)}
                />
                <View className="flex-row gap-sm">
                  {[7, 15, 30].map((days) => (
                    <SecondaryButton
                      key={days}
                      variant="outline"
                      label={`${days} days`}
                      className="flex-1"
                      onPress={() =>
                        set(
                          'validUntil',
                          endOfDayIso(toDateOnly(new Date(Date.now() + days * 86400000))),
                        )
                      }
                    />
                  ))}
                </View>
              </View>
            </Card>
          )}
          {(
            [
              {
                id: 'product',
                title: 'Product',
                rows: [
                  ['Product', labels.categoryId],
                  ['Grade', labels.gradeId ?? values.customGradeName],
                  ['Brand', labels.brandId],
                  ['Origin', bundle.countries.find((c) => c.id === values.originCountryId)?.name],
                  ['Quantity', values.quantity ? `${values.quantity} ${qtyUnit}` : null],
                  ...((isBuy
                    ? [
                        [
                          'Acceptable range',
                          values.acceptableQuantityMin || values.acceptableQuantityMax
                            ? `${values.acceptableQuantityMin || '—'} – ${values.acceptableQuantityMax || '—'} ${qtyUnit}`
                            : null,
                        ],
                        [
                          'Required delivery',
                          values.requiredDeliveryDate
                            ? formatDate(values.requiredDeliveryDate)
                            : null,
                        ],
                      ]
                    : [
                        ['MOQ', values.moq ? `${values.moq} ${qtyUnit}` : null],
                        [
                          'Max per buyer',
                          values.maximumQuantity ? `${values.maximumQuantity} ${qtyUnit}` : null,
                        ],
                        [
                          'Stock type',
                          values.readyStockType ? importLabel(values.readyStockType) : null,
                        ],
                      ]) as [string, string | null | undefined][]),
                  ['Packaging', bundle.packaging.find((p) => p.id === values.packagingId)?.name],
                ],
              },
              {
                id: 'commercial',
                title: 'Commercial',
                rows: [
                  [
                    cfg.copy.price,
                    values.price
                      ? `${currencyCode ?? ''} ${values.price} / ${importLabel(values.priceUnit ?? 'MT')}`
                      : null,
                  ],
                  ['Price type', values.priceType ? importLabel(values.priceType) : null],
                  [
                    'Incoterm',
                    incoterm
                      ? `${incoterm.code} ${labels.priceBasisPortId ?? values.priceBasisLocation ?? ''}`
                      : null,
                  ],
                  ['Payment terms', termsName],
                  ...((currencyCode === 'INR'
                    ? [['GST', values.gstTreatment ? importLabel(values.gstTreatment) : null]]
                    : []) as [string, string | null][]),
                ],
              },
              {
                id: 'shipping',
                title: 'Shipping',
                rows: [
                  [
                    'POL → POD',
                    labels.polId && labels.podId ? `${labels.polId} → ${labels.podId}` : null,
                  ],
                  [
                    'Shipment window',
                    values.esd && values.lsd
                      ? `${formatDate(values.esd)} – ${formatDate(values.lsd)}`
                      : null,
                  ],
                  [
                    'Transit',
                    values.transitMinDays !== null &&
                    values.transitMinDays !== undefined &&
                    values.transitMaxDays !== null &&
                    values.transitMaxDays !== undefined
                      ? `${values.transitMinDays}–${values.transitMaxDays} days`
                      : null,
                  ],
                  ['Shipment type', values.shipmentType ? importLabel(values.shipmentType) : null],
                  [
                    'Containers',
                    values.containerSize || values.containerCount
                      ? [
                          values.containerCount ? `${values.containerCount} ×` : null,
                          values.containerSize ? importLabel(values.containerSize) : null,
                        ]
                          .filter(Boolean)
                          .join(' ')
                      : null,
                  ],
                ],
              },
              {
                id: 'quality',
                title: 'Quality & documents',
                rows: [
                  ['Inspection', values.inspectionType ? importLabel(values.inspectionType) : null],
                  [isBuy ? 'Required documents' : 'Documents offered', docNames || null],
                  ['Specification', values.specification],
                  ['Remarks', values.remarks],
                ],
              },
            ] as { id: StepId; title: string; rows: [string, string | null | undefined][] }[]
          ).map((section) => {
            const errors = stepErrors[section.id];
            return (
              <Card
                key={section.id}
                title={section.title}
                right={
                  <Pressable
                    onPress={() => goToStep(STEPS.findIndex((s) => s.id === section.id))}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${section.title}`}
                  >
                    <Typography
                      variant="link"
                      className={cn('font-semibold', errors && 'text-brand-error')}
                    >
                      {errors ? `Edit · ${errors} to fix` : 'Edit'}
                    </Typography>
                  </Pressable>
                }
              >
                <KeyValues rows={section.rows} />
              </Card>
            );
          })}
          {Object.keys(fieldErrors).length ? (
            <Card title="Fix these before publishing">
              <View className="gap-xs">
                {Object.entries(fieldErrors).map(([field, message]) => (
                  <Pressable key={field} onPress={() => setStep(FIELD_STEP[field] ?? 'review')}>
                    <Typography variant="error" className="text-[13px] underline">
                      {message}
                    </Typography>
                  </Pressable>
                ))}
              </View>
            </Card>
          ) : null}
        </>
      ) : null}
    </ImportScreen>
  );
}
