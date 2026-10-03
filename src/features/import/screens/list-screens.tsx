import { useState } from 'react';

import { Pressable, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { InputField, PrimaryButton, Typography } from '@/components';
import { useCanManageImport, ViewOnlyNotice } from '@/features/import/access';
import {
  fetchDeals,
  fetchImportConfig,
  fetchImportMaster,
  fetchImportPorts,
  fetchImportProducts,
  fetchImportSummary,
  fetchListings,
  fetchNegotiations,
  type ListingQuery,
} from '@/features/import/api';
import {
  AsyncSelectField,
  Card,
  Chips,
  DateField,
  EmptyBlock,
  ErrorBlock,
  ImportScreen,
  LoadingBlock,
  Notice,
  Pager,
  SearchBox,
  SelectField,
  StatusPill,
  useDebounced,
  useImportLoader,
} from '@/features/import/components';
import { IMPORT_MODES, type ImportMode } from '@/features/import/config';
import {
  DECIMAL_PRICE,
  formatDate,
  formatDateTime,
  formatPrice,
  formatQty,
  importLabel,
  portLabel,
} from '@/features/import/format';
import { ListingRow } from '@/features/import/listing-details';

export const pushImport = (
  router: ReturnType<typeof useRouter>,
  pathname: string,
  params?: Record<string, string>,
) => router.push((params ? { pathname, params } : pathname) as unknown as Href);

// Hub ---------------------------------------------------------------------------

export function ImportHubScreen({ mode }: { mode: ImportMode }) {
  const cfg = IMPORT_MODES[mode];
  const router = useRouter();
  const canManage = useCanManageImport(mode);
  const state = useImportLoader(async () => {
    const config = await fetchImportConfig();
    if (!config.enabled) return { enabled: false as const };
    const summary = await fetchImportSummary();
    return { enabled: true as const, side: mode === 'customer' ? summary.buy : summary.sell };
  }, [mode]);

  const side = state.data?.enabled ? state.data.side : undefined;
  const count = (statuses: string[]) =>
    statuses.reduce((sum, s) => sum + (side?.listings[s] ?? 0), 0);

  const rows: { title: string; subtitle: string; route: string; badge?: number }[] = [
    {
      title: `My ${cfg.copy.ownPlural.toLowerCase()}`,
      subtitle: 'Drafts, live listings, matches and history',
      route: cfg.routes.mine,
    },
    {
      title: `${cfg.copy.marketPlural} market`,
      subtitle: `Browse open ${cfg.copy.marketPlural.toLowerCase()} and make offers`,
      route: cfg.routes.market,
    },
    {
      title: 'Negotiations',
      subtitle: 'Offers, counteroffers and agreed terms',
      route: cfg.routes.negotiations,
      badge: side?.openNegotiations,
    },
    {
      title: 'Deals',
      subtitle: 'Confirm agreed deals and track shipments',
      route: cfg.routes.deals,
      badge: side?.pendingDeals,
    },
  ];

  return (
    <ImportScreen title="Import Trading" refreshing={state.refreshing} onRefresh={state.refresh}>
      {state.loading && !state.data ? (
        <LoadingBlock />
      ) : state.error ? (
        <ErrorBlock message={state.error} onRetry={() => void state.reload()} />
      ) : state.data && !state.data.enabled ? (
        <Notice tone="neutral">Import trading is not available right now.</Notice>
      ) : (
        <>
          <Card>
            <Typography variant="roleTitle">
              International {cfg.copy.ownPlural.toLowerCase()}
            </Typography>
            <Typography variant="roleDescription" className="mt-xs">
              Publish a {cfg.copy.own.toLowerCase()} with Incoterm, ports and shipment window.
              Matching {cfg.copy.marketPlural.toLowerCase()} are scored on fixed criteria and
              counterparties stay anonymous until a deal is confirmed.
            </Typography>
            <View className="mt-md flex-row gap-sm">
              {[
                ['Drafts', count(['DRAFT'])],
                [
                  'Live',
                  count(['PUBLISHED', 'MATCHING', 'OFFER_RECEIVED', 'NEGOTIATION', 'PAUSED']),
                ],
                ['Deals', count(['MATCHED', 'DEAL_CONFIRMED', 'PARTIALLY_FULFILLED', 'FULFILLED'])],
              ].map(([label, value]) => (
                <View key={label} className="flex-1 rounded-xl bg-brand-surface px-md py-sm">
                  <Typography variant="headingLeft" className="text-[20px]">
                    {value}
                  </Typography>
                  <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
                    {label}
                  </Typography>
                </View>
              ))}
            </View>
            {canManage ? (
              <PrimaryButton
                className="mt-md"
                label={`New ${cfg.copy.own.toLowerCase()}`}
                onPress={() => pushImport(router, cfg.routes.form)}
              />
            ) : null}
          </Card>
          {!canManage ? <ViewOnlyNotice /> : null}
          {rows.map((r) => (
            <Pressable
              key={r.route}
              onPress={() => pushImport(router, r.route)}
              accessibilityRole="button"
              className="flex-row items-center justify-between gap-md rounded-2xl border border-brand-border bg-brand-white p-lg active:opacity-80"
            >
              <View className="flex-1">
                <Typography variant="roleTitle" className="text-[15px]">
                  {r.title}
                </Typography>
                <Typography variant="roleDescription" className="mt-xs text-brand-muted">
                  {r.subtitle}
                </Typography>
              </View>
              {r.badge ? (
                <View className="min-w-[24px] items-center rounded-full bg-brand-primary px-sm py-xs">
                  <Typography variant="badge" className="text-brand-white">
                    {r.badge}
                  </Typography>
                </View>
              ) : null}
              <Typography variant="input" className="text-brand-muted">
                ›
              </Typography>
            </Pressable>
          ))}
        </>
      )}
    </ImportScreen>
  );
}

// My listings -------------------------------------------------------------------

const MINE_TABS = [
  { id: 'all', label: 'All', status: undefined },
  { id: 'draft', label: 'Drafts', status: 'DRAFT' },
  { id: 'live', label: 'Live', status: 'PUBLISHED,MATCHING,OFFER_RECEIVED,NEGOTIATION,PAUSED' },
  {
    id: 'matched',
    label: 'Matched & deals',
    status: 'MATCHED,DEAL_CONFIRMED,PARTIALLY_FULFILLED,FULFILLED',
  },
  { id: 'closed', label: 'Expired & cancelled', status: 'EXPIRED,CANCELLED' },
] as const;

type MineTab = (typeof MINE_TABS)[number]['id'];

export function ImportMyListingsScreen({ mode }: { mode: ImportMode }) {
  const cfg = IMPORT_MODES[mode];
  const router = useRouter();
  const canManage = useCanManageImport(mode);
  const [tab, setTab] = useState<MineTab>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounced(search.trim());
  const status = MINE_TABS.find((t) => t.id === tab)?.status;
  const state = useImportLoader(
    () =>
      fetchListings(cfg.ownSide, {
        scope: 'mine',
        status,
        search: debounced || undefined,
        page,
        limit: 20,
      }),
    [cfg.ownSide, status, debounced, page],
  );

  return (
    <ImportScreen
      title={`My ${cfg.copy.ownPlural.toLowerCase()}`}
      refreshing={state.refreshing}
      onRefresh={state.refresh}
      footer={
        canManage ? (
          <PrimaryButton
            label={`New ${cfg.copy.own.toLowerCase()}`}
            onPress={() => pushImport(router, cfg.routes.form)}
          />
        ) : undefined
      }
    >
      {!canManage ? <ViewOnlyNotice /> : null}
      <Chips
        options={MINE_TABS.map((t) => ({ id: t.id, label: t.label }))}
        value={tab}
        onChange={(id) => {
          setTab(id);
          setPage(1);
        }}
      />
      <SearchBox
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        placeholder="Search reference, product or grade"
      />
      {state.loading ? (
        <LoadingBlock />
      ) : state.error ? (
        <ErrorBlock message={state.error} onRetry={() => void state.reload()} />
      ) : !state.data?.items.length ? (
        <EmptyBlock
          title={`No ${cfg.copy.ownPlural.toLowerCase()} here`}
          message={
            debounced
              ? 'Try a different search.'
              : canManage
                ? `Create a ${cfg.copy.own.toLowerCase()} to get started.`
                : undefined
          }
        />
      ) : (
        <>
          {state.data.items.map((l) => (
            <ListingRow
              key={l.id}
              listing={l}
              onPress={() => pushImport(router, cfg.routes.listing, { id: l.id })}
            />
          ))}
          <Pager
            page={state.data.meta.page}
            totalPages={state.data.meta.totalPages}
            total={state.data.meta.total}
            onPage={setPage}
          />
        </>
      )}
    </ImportScreen>
  );
}

// Market ------------------------------------------------------------------------

const SORTS = {
  newest: { label: 'Newest first', sortBy: 'publishedAt', sortOrder: 'desc', needsCurrency: false },
  expiring: {
    label: 'Expiring soon',
    sortBy: 'validUntil',
    sortOrder: 'asc',
    needsCurrency: false,
  },
  shipment: { label: 'Earliest shipment', sortBy: 'esd', sortOrder: 'asc', needsCurrency: false },
  priceAsc: { label: 'Price: low to high', sortBy: 'price', sortOrder: 'asc', needsCurrency: true },
  quantityDesc: {
    label: 'Quantity: high to low',
    sortBy: 'quantity',
    sortOrder: 'desc',
    needsCurrency: false,
  },
} as const;

type SortId = keyof typeof SORTS;

type MarketFilters = {
  categoryId?: string;
  categoryLabel?: string;
  originCountryId?: string;
  incotermId?: string;
  polId?: string;
  polLabel?: string;
  podId?: string;
  podLabel?: string;
  priceMin?: string;
  priceMax?: string;
  shipmentFrom?: string;
  shipmentTo?: string;
};

const FILTER_KEYS = [
  'categoryId',
  'originCountryId',
  'incotermId',
  'polId',
  'podId',
  'priceMin',
  'priceMax',
  'shipmentFrom',
  'shipmentTo',
] as const;

export function ImportMarketScreen({ mode }: { mode: ImportMode }) {
  const cfg = IMPORT_MODES[mode];
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const [search, setSearch] = useState('');
  const [currencyCode, setCurrencyCode] = useState<string | null>(null);
  const [sort, setSort] = useState<SortId>('newest');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<MarketFilters>({});
  const debounced = useDebounced(search.trim());
  const debouncedPriceMin = useDebounced(filters.priceMin?.trim() ?? '');
  const debouncedPriceMax = useDebounced(filters.priceMax?.trim() ?? '');

  const master = useImportLoader(() => fetchImportMaster(), []);
  const currencies = master.data?.currencies ?? [];

  const update = (patch: Partial<MarketFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };
  const activeFilters = FILTER_KEYS.filter((k) => Boolean(filters[k])).length;

  const priceInvalid =
    (debouncedPriceMin !== '' && !DECIMAL_PRICE.test(debouncedPriceMin)) ||
    (debouncedPriceMax !== '' && !DECIMAL_PRICE.test(debouncedPriceMax));
  // Prices are only comparable within one currency; the backend rejects price filters/sort without it.
  const priceNeedsCurrency = Boolean((debouncedPriceMin || debouncedPriceMax) && !currencyCode);
  const sendPrice = !priceInvalid && !priceNeedsCurrency;

  const s = SORTS[sort];
  const effective = s.needsCurrency && !currencyCode ? SORTS.newest : s;
  const query: ListingQuery = {
    scope: 'market',
    search: debounced || undefined,
    currencyCode: currencyCode ?? undefined,
    categoryId: filters.categoryId,
    originCountryId: filters.originCountryId,
    incotermId: filters.incotermId,
    polId: filters.polId,
    podId: filters.podId,
    priceMin: sendPrice ? debouncedPriceMin || undefined : undefined,
    priceMax: sendPrice ? debouncedPriceMax || undefined : undefined,
    shipmentFrom: filters.shipmentFrom,
    shipmentTo: filters.shipmentTo,
    sortBy: effective.sortBy,
    sortOrder: effective.sortOrder,
    page,
    limit: 20,
  };
  const state = useImportLoader(
    () => fetchListings(cfg.marketSide, query),
    [cfg.marketSide, JSON.stringify(query)],
  );

  return (
    <ImportScreen
      title={cfg.copy.marketPlural}
      refreshing={state.refreshing}
      onRefresh={state.refresh}
    >
      <SearchBox
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        placeholder="Search product, grade or brand"
      />
      <View className="flex-row gap-sm">
        <View className="flex-1">
          <SelectField
            label="Currency"
            value={currencyCode}
            placeholder="All currencies"
            options={currencies.map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
            onChange={(v) => {
              setCurrencyCode(v);
              setPage(1);
            }}
          />
        </View>
        <View className="flex-1">
          <SelectField
            label="Sort"
            value={sort}
            required
            options={Object.entries(SORTS).map(([id, o]) => ({ value: id, label: o.label }))}
            onChange={(v) => {
              if (v) setSort(v as SortId);
              setPage(1);
            }}
          />
        </View>
      </View>
      <Pressable
        onPress={() => setFiltersOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: filtersOpen }}
        className="flex-row items-center justify-between rounded-xl border border-brand-border bg-brand-white px-md py-sm active:opacity-80"
      >
        <Typography variant="roleTitle" className="text-[14px]">
          Filters{activeFilters ? ` (${activeFilters})` : ''}
        </Typography>
        <View className="flex-row items-center gap-md">
          {activeFilters ? (
            <Pressable
              onPress={() => {
                setFilters({});
                setPage(1);
              }}
              hitSlop={8}
              accessibilityLabel="Clear filters"
            >
              <Typography variant="link">Clear</Typography>
            </Pressable>
          ) : null}
          <Typography variant="input" className="text-brand-muted">
            {filtersOpen ? '▴' : '▾'}
          </Typography>
        </View>
      </Pressable>
      {filtersOpen ? (
        <Card>
          <View className="gap-md">
            <AsyncSelectField
              label="Product"
              value={filters.categoryId}
              selectedLabel={filters.categoryLabel}
              placeholder="Any product"
              load={async (q) =>
                (await fetchImportProducts(q || undefined)).map((p) => ({
                  value: p.id,
                  label: p.name,
                }))
              }
              onChange={(v, o) => update({ categoryId: v ?? undefined, categoryLabel: o?.label })}
            />
            <SelectField
              label="Origin"
              value={filters.originCountryId ?? null}
              placeholder="Any origin"
              options={(master.data?.countries ?? []).map((c) => ({ value: c.id, label: c.name }))}
              onChange={(v) => update({ originCountryId: v ?? undefined })}
            />
            <SelectField
              label="Incoterm"
              value={filters.incotermId ?? null}
              placeholder="Any Incoterm"
              options={(master.data?.incoterms ?? []).map((i) => ({
                value: i.id,
                label: `${i.code} — ${i.name}`,
              }))}
              onChange={(v) => update({ incotermId: v ?? undefined })}
            />
            <AsyncSelectField
              label="Port of loading (POL)"
              value={filters.polId}
              selectedLabel={filters.polLabel}
              placeholder="Any POL"
              load={async (q) =>
                (await fetchImportPorts(q || undefined)).map((p) => ({
                  value: p.id,
                  label: portLabel(p),
                  hint: p.countryCode,
                }))
              }
              onChange={(v, o) => update({ polId: v ?? undefined, polLabel: o?.label })}
            />
            <AsyncSelectField
              label="Port of discharge (POD)"
              value={filters.podId}
              selectedLabel={filters.podLabel}
              placeholder="Any POD"
              load={async (q) =>
                (await fetchImportPorts(q || undefined)).map((p) => ({
                  value: p.id,
                  label: portLabel(p),
                  hint: p.countryCode,
                }))
              }
              onChange={(v, o) => update({ podId: v ?? undefined, podLabel: o?.label })}
            />
            <View className="flex-row gap-sm">
              <View className="flex-1">
                <InputField
                  label={`Min price${currencyCode ? ` (${currencyCode})` : ''}`}
                  value={filters.priceMin ?? ''}
                  onChangeText={(v) =>
                    update({ priceMin: v.replace(/,/g, '').trim() || undefined })
                  }
                  keyboardType="decimal-pad"
                  placeholder="Min"
                />
              </View>
              <View className="flex-1">
                <InputField
                  label={`Max price${currencyCode ? ` (${currencyCode})` : ''}`}
                  value={filters.priceMax ?? ''}
                  onChangeText={(v) =>
                    update({ priceMax: v.replace(/,/g, '').trim() || undefined })
                  }
                  keyboardType="decimal-pad"
                  placeholder="Max"
                />
              </View>
            </View>
            <DateField
              label="Shipment from"
              value={filters.shipmentFrom ?? null}
              onChange={(v) => update({ shipmentFrom: v ?? undefined })}
            />
            <DateField
              label="Shipment to"
              value={filters.shipmentTo ?? null}
              minimumDate={filters.shipmentFrom ?? null}
              onChange={(v) => update({ shipmentTo: v ?? undefined })}
            />
          </View>
        </Card>
      ) : null}
      {priceInvalid ? (
        <Notice tone="warning">Enter prices as numbers, up to 4 decimal places.</Notice>
      ) : priceNeedsCurrency ? (
        <Notice tone="warning">
          Select a currency to filter by price. Prices are never converted.
        </Notice>
      ) : s.needsCurrency && !currencyCode ? (
        <Notice tone="warning">
          Select a currency to sort by price. Prices are never converted.
        </Notice>
      ) : null}
      {state.loading ? (
        <LoadingBlock />
      ) : state.error ? (
        <ErrorBlock message={state.error} onRetry={() => void state.reload()} />
      ) : !state.data?.items.length ? (
        <EmptyBlock
          title={`No open ${cfg.copy.marketPlural.toLowerCase()}`}
          message={
            activeFilters || debounced
              ? 'No listings match these filters. Try widening them.'
              : 'New listings appear here as soon as they are published.'
          }
        />
      ) : (
        <>
          {state.data.items.map((l) => (
            <ListingRow
              key={l.id}
              listing={l}
              onPress={() =>
                pushImport(
                  router,
                  cfg.routes.marketListing,
                  from ? { id: l.id, from } : { id: l.id },
                )
              }
            />
          ))}
          <Pager
            page={state.data.meta.page}
            totalPages={state.data.meta.totalPages}
            total={state.data.meta.total}
            onPage={setPage}
          />
        </>
      )}
    </ImportScreen>
  );
}

// Negotiations --------------------------------------------------------------------

const NEGOTIATION_TABS = [
  { id: 'open', label: 'Open', status: 'OPEN' },
  { id: 'agreed', label: 'Agreed', status: 'AGREED' },
  { id: 'closed', label: 'Closed', status: 'REJECTED,WITHDRAWN,EXPIRED,CANCELLED' },
  { id: 'all', label: 'All', status: undefined },
] as const;

type NegotiationTab = (typeof NEGOTIATION_TABS)[number]['id'];

export function ImportNegotiationsScreen({ mode }: { mode: ImportMode }) {
  const cfg = IMPORT_MODES[mode];
  const router = useRouter();
  const [tab, setTab] = useState<NegotiationTab>('open');
  const [page, setPage] = useState(1);
  const status = NEGOTIATION_TABS.find((t) => t.id === tab)?.status;
  const state = useImportLoader(
    () => fetchNegotiations({ status, page, limit: 20 }),
    [status, page],
  );

  return (
    <ImportScreen title="Negotiations" refreshing={state.refreshing} onRefresh={state.refresh}>
      <Chips
        options={NEGOTIATION_TABS.map((t) => ({ id: t.id, label: t.label }))}
        value={tab}
        onChange={(id) => {
          setTab(id);
          setPage(1);
        }}
      />
      {state.loading ? (
        <LoadingBlock />
      ) : state.error ? (
        <ErrorBlock message={state.error} onRetry={() => void state.reload()} />
      ) : !state.data?.items.length ? (
        <EmptyBlock
          title="No negotiations"
          message={`Make an offer on a ${cfg.copy.market.toLowerCase()} or wait for offers on your listings.`}
        />
      ) : (
        <>
          {state.data.items.map((n) => {
            const t = n.latestTerms;
            const listing = n.listing;
            return (
              <Pressable
                key={n.id}
                onPress={() => pushImport(router, cfg.routes.negotiation, { id: n.id })}
                accessibilityRole="button"
                className="rounded-2xl border border-brand-border bg-brand-white p-lg active:opacity-80"
              >
                <View className="flex-row items-start justify-between gap-sm">
                  <View className="flex-1">
                    <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
                      {n.referenceNumber} · {n.counterpartyRef}
                    </Typography>
                    <Typography variant="roleTitle" className="mt-xs text-[15px]" numberOfLines={1}>
                      {listing?.product ?? '—'}
                      {listing?.grade ? ` · ${listing.grade}` : ''}
                    </Typography>
                  </View>
                  <StatusPill status={n.status} />
                </View>
                <Typography
                  variant="roleDescription"
                  className="mt-sm font-semibold text-brand-heading"
                >
                  {t
                    ? `${formatPrice(t.price, t.currencyCode, t.priceUnit)} · ${formatQty(t.quantity, t.quantityUnit)}`
                    : '—'}
                </Typography>
                <View className="mt-xs flex-row items-center justify-between">
                  <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
                    Round {n.roundCount} · {formatDateTime(n.updatedAt)}
                  </Typography>
                  {n.awaitingMyResponse ? (
                    <StatusPill status="PENDING_CONFIRMATION" label="Your turn" />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
          <Pager
            page={state.data.meta.page}
            totalPages={state.data.meta.totalPages}
            total={state.data.meta.total}
            onPage={setPage}
          />
        </>
      )}
    </ImportScreen>
  );
}

// Deals ---------------------------------------------------------------------------

const DEAL_TABS = [
  { id: 'pending', label: 'Awaiting confirmation', status: 'PENDING_CONFIRMATION' },
  { id: 'confirmed', label: 'Confirmed', status: 'CONFIRMED,PARTIALLY_FULFILLED,FULFILLED' },
  { id: 'cancelled', label: 'Cancelled', status: 'CANCELLED' },
  { id: 'all', label: 'All', status: undefined },
] as const;

type DealTab = (typeof DEAL_TABS)[number]['id'];

export function ImportDealsScreen({ mode }: { mode: ImportMode }) {
  const cfg = IMPORT_MODES[mode];
  const router = useRouter();
  const [tab, setTab] = useState<DealTab>('pending');
  const [page, setPage] = useState(1);
  const status = DEAL_TABS.find((t) => t.id === tab)?.status;
  const state = useImportLoader(() => fetchDeals({ status, page, limit: 20 }), [status, page]);

  return (
    <ImportScreen title="Deals" refreshing={state.refreshing} onRefresh={state.refresh}>
      <Chips
        options={DEAL_TABS.map((t) => ({ id: t.id, label: t.label }))}
        value={tab}
        onChange={(id) => {
          setTab(id);
          setPage(1);
        }}
      />
      {state.loading ? (
        <LoadingBlock />
      ) : state.error ? (
        <ErrorBlock message={state.error} onRetry={() => void state.reload()} />
      ) : !state.data?.items.length ? (
        <EmptyBlock title="No deals" message="Deals are created when both sides agree on terms." />
      ) : (
        <>
          {state.data.items.map((d) => (
            <Pressable
              key={d.id}
              onPress={() => pushImport(router, cfg.routes.deal, { id: d.id })}
              accessibilityRole="button"
              className="rounded-2xl border border-brand-border bg-brand-white p-lg active:opacity-80"
            >
              <View className="flex-row items-start justify-between gap-sm">
                <View className="flex-1">
                  <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
                    {d.referenceNumber} · {importLabel(d.myParty)}
                  </Typography>
                  <Typography variant="roleTitle" className="mt-xs text-[15px]">
                    {formatPrice(d.price, d.currencyCode, d.priceUnit)}
                  </Typography>
                </View>
                <StatusPill status={d.status} />
              </View>
              <Typography variant="roleDescription" className="mt-xs text-brand-muted">
                {formatQty(d.quantity, d.quantityUnit)} · {d.incotermCode ?? '—'} · Ships{' '}
                {formatDate(d.esd)} – {formatDate(d.lsd)}
              </Typography>
              {d.awaitingMyConfirmation ? (
                <View className="mt-sm">
                  <StatusPill status="PENDING_CONFIRMATION" label="Your confirmation needed" />
                </View>
              ) : null}
            </Pressable>
          ))}
          <Pager
            page={state.data.meta.page}
            totalPages={state.data.meta.totalPages}
            total={state.data.meta.total}
            onPage={setPage}
          />
        </>
      )}
    </ImportScreen>
  );
}
