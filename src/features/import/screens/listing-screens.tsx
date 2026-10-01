import { useState } from 'react';

import { Pressable, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import Toast from 'react-native-toast-message';

import { PrimaryButton, Typography } from '@/components';
import {
  deleteListing,
  dismissMatch,
  fetchImportMaster,
  fetchListing,
  fetchMatches,
  fetchNegotiations,
  openNegotiation,
  transitionListing,
} from '@/features/import/api';
import {
  Card,
  Chips,
  EmptyBlock,
  ErrorBlock,
  ImportScreen,
  LoadingBlock,
  Notice,
  StatusPill,
  useImportLoader,
} from '@/features/import/components';
import { IMPORT_MODES, type ImportMode } from '@/features/import/config';
import {
  formatPrice,
  formatQty,
  importLabel,
  listingTitle,
  OPEN_STATUSES,
  parseImportError,
  portLabel,
} from '@/features/import/format';
import { ListingDetails, ListingHeader } from '@/features/import/listing-details';
import { pushImport } from '@/features/import/screens/list-screens';
import { DocumentsCard, ReasonSheet, TermsSheet } from '@/features/import/trade-widgets';
import type { ImportListing, ImportMatch } from '@/features/import/types';
import { showConfirmDialog } from '@/store/dialog-store';
import { cn } from '@/utils/cn';

// Owner detail --------------------------------------------------------------------

type OwnTab = 'matches' | 'negotiations' | 'details' | 'documents';

export function ImportOwnListingScreen({ mode }: { mode: ImportMode }) {
  const cfg = IMPORT_MODES[mode];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tab, setTab] = useState<OwnTab>('matches');
  const [busy, setBusy] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const state = useImportLoader(async () => {
    const listing = await fetchListing(cfg.ownSide, id);
    const [matches, negotiations] = await Promise.all([
      listing.status === 'DRAFT' ? Promise.resolve([]) : fetchMatches(cfg.ownSide, id),
      fetchNegotiations({ listingId: id, limit: 50 }),
    ]);
    return { listing, matches, negotiations: negotiations.items };
  }, [cfg.ownSide, id]);

  const l = state.data?.listing;
  const live = Boolean(l && OPEN_STATUSES.includes(l.status));
  const editable = Boolean(l && [...OPEN_STATUSES, 'DRAFT', 'PAUSED'].includes(l.status));
  const can = (s: string) => Boolean(l?.allowedTransitions?.includes(s as never));

  async function run(action: 'cancel' | 'expire' | 'pause' | 'resume' | 'delete', reason?: string) {
    if (!l) return;
    setBusy(action);
    try {
      if (action === 'delete') {
        await deleteListing(cfg.ownSide, l.id);
        Toast.show({ type: 'success', text1: 'Draft deleted' });
        router.back();
        return;
      }
      await transitionListing(cfg.ownSide, l.id, action, reason || undefined);
      Toast.show({
        type: 'success',
        text1:
          action === 'cancel'
            ? 'Listing cancelled'
            : action === 'expire'
              ? 'Listing closed'
              : action === 'pause'
                ? 'Listing paused'
                : 'Listing resumed',
      });
      setCancelOpen(false);
      await state.reload();
    } catch (error) {
      Toast.show({ type: 'error', text1: parseImportError(error).message });
    } finally {
      setBusy(null);
    }
  }

  const actions: { label: string; onPress: () => void; danger?: boolean }[] = [];
  if (l) {
    if (editable) {
      actions.push({
        label: l.status === 'DRAFT' ? 'Continue draft' : 'Edit',
        onPress: () => pushImport(router, cfg.routes.form, { id: l.id }),
      });
    }
    if (l.status === 'DRAFT') {
      actions.push({
        label: 'Delete draft',
        danger: true,
        onPress: () =>
          showConfirmDialog({
            title: 'Delete this draft?',
            message: 'The draft and its attachments are removed. This cannot be undone.',
            confirmLabel: 'Delete',
            onConfirm: () => void run('delete'),
          }),
      });
    }
    if (cfg.ownSide === 'SELL' && can('PAUSED')) {
      actions.push({ label: 'Pause', onPress: () => void run('pause') });
    }
    if (cfg.ownSide === 'SELL' && l.status === 'PAUSED') {
      actions.push({ label: 'Resume', onPress: () => void run('resume') });
    }
    if (live && can('EXPIRED')) {
      actions.push({
        label: 'Close now',
        onPress: () =>
          showConfirmDialog({
            title: 'Close this listing now?',
            message: 'It stops accepting new offers. Open negotiations are closed.',
            confirmLabel: 'Close listing',
            variant: 'warning',
            onConfirm: () => void run('expire'),
          }),
      });
    }
    if (l.status !== 'DRAFT' && can('CANCELLED')) {
      actions.push({ label: 'Cancel', danger: true, onPress: () => setCancelOpen(true) });
    }
  }

  return (
    <ImportScreen
      title={l?.referenceNumber ?? cfg.copy.own}
      refreshing={state.refreshing}
      onRefresh={state.refresh}
    >
      {state.loading && !state.data ? (
        <LoadingBlock />
      ) : state.error || !l || !state.data ? (
        <ErrorBlock
          message={state.error ?? 'Listing not found.'}
          onRetry={() => void state.reload()}
        />
      ) : (
        <>
          <ListingHeader listing={l} />
          {l.status === 'CANCELLED' && l.cancelReason ? (
            <Notice tone="neutral">Cancellation reason: {l.cancelReason}</Notice>
          ) : null}
          {actions.length ? (
            <View className="flex-row flex-wrap gap-sm">
              {actions.map((a) => (
                <Pressable
                  key={a.label}
                  onPress={a.onPress}
                  disabled={Boolean(busy)}
                  accessibilityRole="button"
                  className={cn(
                    'rounded-full border px-md py-sm',
                    a.danger ? 'border-brand-error' : 'border-brand-primary',
                    busy && 'opacity-50',
                  )}
                >
                  <Typography
                    variant="roleDescription"
                    className={cn(
                      'font-semibold',
                      a.danger ? 'text-brand-error' : 'text-brand-primary-dark',
                    )}
                  >
                    {a.label}
                  </Typography>
                </Pressable>
              ))}
            </View>
          ) : null}
          <Chips
            value={tab}
            onChange={setTab}
            options={[
              { id: 'matches', label: `Matches (${state.data.matches.length})` },
              { id: 'negotiations', label: `Negotiations (${state.data.negotiations.length})` },
              { id: 'details', label: 'Details' },
              { id: 'documents', label: 'Attachments' },
            ]}
          />
          {tab === 'details' ? <ListingDetails listing={l} /> : null}
          {tab === 'documents' ? <DocumentsCard listingId={l.id} canManage={editable} /> : null}
          {tab === 'negotiations' ? (
            state.data.negotiations.length === 0 ? (
              <EmptyBlock
                title="No offers yet"
                message="Counterparties can respond while the listing is live."
              />
            ) : (
              state.data.negotiations.map((n) => (
                <Pressable
                  key={n.id}
                  onPress={() => pushImport(router, cfg.routes.negotiation, { id: n.id })}
                  className="rounded-2xl border border-brand-border bg-brand-white p-lg active:opacity-80"
                >
                  <View className="flex-row items-start justify-between gap-sm">
                    <Typography variant="roleTitle" className="flex-1 text-[14px]">
                      {n.referenceNumber} · {n.counterpartyRef}
                    </Typography>
                    <StatusPill status={n.status} />
                  </View>
                  <Typography variant="roleDescription" className="mt-xs text-brand-muted">
                    {n.latestTerms
                      ? `${formatPrice(n.latestTerms.price, n.latestTerms.currencyCode, n.latestTerms.priceUnit)} · ${formatQty(n.latestTerms.quantity, n.latestTerms.quantityUnit)}`
                      : '—'}{' '}
                    · Round {n.roundCount}
                  </Typography>
                  {n.awaitingMyResponse ? (
                    <View className="mt-sm">
                      <StatusPill status="PENDING_CONFIRMATION" label="Your turn" />
                    </View>
                  ) : null}
                </Pressable>
              ))
            )
          ) : null}
          {tab === 'matches' ? (
            <MatchesPanel
              mode={mode}
              listing={l}
              matches={state.data.matches}
              onDismiss={async (matchId) => {
                try {
                  await dismissMatch(cfg.ownSide, l.id, matchId);
                  await state.reload();
                } catch (error) {
                  Toast.show({ type: 'error', text1: parseImportError(error).message });
                }
              }}
            />
          ) : null}
        </>
      )}
      <ReasonSheet
        visible={cancelOpen}
        title={`Cancel this ${cfg.copy.own.toLowerCase()}?`}
        message="Open negotiations are closed and counterparties are notified. This cannot be undone."
        confirmLabel="Cancel listing"
        busy={busy === 'cancel'}
        onClose={() => setCancelOpen(false)}
        onConfirm={(reason) => void run('cancel', reason)}
      />
    </ImportScreen>
  );
}

function MatchesPanel({
  mode,
  listing,
  matches,
  onDismiss,
}: {
  mode: ImportMode;
  listing: ImportListing;
  matches: ImportMatch[];
  onDismiss: (matchId: string) => Promise<void>;
}) {
  const cfg = IMPORT_MODES[mode];
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  if (listing.status === 'DRAFT') {
    return (
      <EmptyBlock title="No matches yet" message="Matches are calculated after you publish." />
    );
  }
  if (!matches.length) {
    return (
      <EmptyBlock
        title={`No matching ${cfg.copy.marketPlural.toLowerCase()} yet`}
        message="Matches are recalculated whenever new listings are published."
      />
    );
  }
  return (
    <>
      <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
        Scores come from fixed, Admin-configured criteria weights. Prices are compared only when
        currency, Incoterm and basis location are identical.
      </Typography>
      {matches.map((m) => (
        <Card key={m.id} className={cn(m.status === 'STALE' && 'opacity-60')}>
          <View className="flex-row items-start justify-between gap-sm">
            <View className="flex-1">
              <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
                {m.listing.referenceNumber} · {m.listing.counterpartyRef}
              </Typography>
              <Typography variant="roleTitle" className="mt-xs text-[15px]" numberOfLines={1}>
                {listingTitle(m.listing)}
              </Typography>
              <Typography variant="roleDescription" className="mt-xs">
                {formatQty(m.listing.product.quantity, m.listing.product.quantityUnit)} ·{' '}
                {formatPrice(
                  m.listing.commercial.price,
                  m.listing.commercial.currencyCode,
                  m.listing.commercial.priceUnit,
                )}{' '}
                {m.listing.commercial.incoterm?.code ?? ''}
              </Typography>
            </View>
            <View className="items-end">
              <Typography
                variant="headingLeft"
                className={cn(
                  'text-[22px]',
                  m.matchScore >= 80
                    ? 'text-brand-success'
                    : m.matchScore >= 60
                      ? 'text-[#B45309]'
                      : 'text-brand-body',
                )}
              >
                {m.matchScore.toFixed(0)}%
              </Typography>
              <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
                {importLabel(m.status)}
              </Typography>
            </View>
          </View>
          <View className="mt-sm flex-row flex-wrap gap-xs">
            {m.matchedCriteria.map((c) => (
              <View key={c} className="rounded-lg bg-brand-success-light px-sm py-xs">
                <Typography variant="roleDescription" className="text-[11px] text-brand-success">
                  ✓ {importLabel(c)}
                </Typography>
              </View>
            ))}
            {m.unmatchedCriteria.map((c) => (
              <View key={c} className="rounded-lg bg-[#F1F5F9] px-sm py-xs">
                <Typography variant="roleDescription" className="text-[11px] text-[#475569]">
                  ✗ {importLabel(c)}
                </Typography>
              </View>
            ))}
          </View>
          {expanded === m.id ? (
            <View className="mt-sm gap-xs rounded-xl bg-brand-surface p-md">
              {m.evidence.map((e) => (
                <Typography key={e.criterion} variant="roleDescription" className="text-[12px]">
                  {e.matched ? '✓' : '✗'} {importLabel(e.criterion)} — {e.reason} (weight{' '}
                  {e.weight.toFixed(1)})
                </Typography>
              ))}
            </View>
          ) : null}
          <View className="mt-md flex-row flex-wrap gap-md">
            <Pressable
              onPress={() =>
                pushImport(router, cfg.routes.marketListing, { id: m.listing.id, from: listing.id })
              }
            >
              <Typography variant="link" className="font-semibold">
                View & respond
              </Typography>
            </Pressable>
            <Pressable onPress={() => setExpanded(expanded === m.id ? null : m.id)}>
              <Typography variant="link">
                {expanded === m.id ? 'Hide scoring' : 'Why this score'}
              </Typography>
            </Pressable>
            {m.status === 'SUGGESTED' ? (
              <Pressable onPress={() => void onDismiss(m.id)}>
                <Typography variant="link" className="text-brand-muted">
                  Dismiss
                </Typography>
              </Pressable>
            ) : null}
          </View>
        </Card>
      ))}
    </>
  );
}

// Counterparty (market) detail ------------------------------------------------------

export function ImportMarketListingScreen({ mode }: { mode: ImportMode }) {
  const cfg = IMPORT_MODES[mode];
  const router = useRouter();
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const [offerOpen, setOfferOpen] = useState(false);
  const state = useImportLoader(async () => {
    const [listing, master] = await Promise.all([
      fetchListing(cfg.marketSide, id),
      fetchImportMaster(),
    ]);
    return { listing, master };
  }, [cfg.marketSide, id]);

  const l = state.data?.listing;
  const open = Boolean(l && OPEN_STATUSES.includes(l.status) && !l.validity.isExpired);
  const existing = l?.myNegotiation;
  const notFound = state.errorCode === 'IMPORT_NOT_FOUND';

  return (
    <ImportScreen
      title={l?.referenceNumber ?? cfg.copy.market}
      refreshing={state.refreshing}
      onRefresh={state.refresh}
      footer={
        l ? (
          existing && existing.status === 'OPEN' ? (
            <PrimaryButton
              label={`Open negotiation ${existing.referenceNumber}`}
              onPress={() => pushImport(router, cfg.routes.negotiation, { id: existing.id })}
            />
          ) : open ? (
            <PrimaryButton label="Make an offer" onPress={() => setOfferOpen(true)} />
          ) : null
        ) : null
      }
    >
      {state.loading && !state.data ? (
        <LoadingBlock />
      ) : state.error || !l ? (
        <ErrorBlock
          message={
            notFound
              ? `This ${cfg.copy.market.toLowerCase()} is no longer available.`
              : (state.error ?? 'Listing not found.')
          }
          onRetry={notFound ? undefined : () => void state.reload()}
        />
      ) : (
        <>
          <ListingHeader listing={l} />
          {existing && existing.status !== 'OPEN' ? (
            <Notice tone="neutral">
              Your previous negotiation {existing.referenceNumber} is{' '}
              {importLabel(existing.status).toLowerCase()}.
            </Notice>
          ) : null}
          <Card title={cfg.copy.counterparty}>
            <Typography variant="roleTitle" className="text-[14px]">
              {l.counterpartyRef}
            </Typography>
            <Typography variant="roleDescription" className="mt-xs">
              Verified counterparty. The company name is shared once both sides confirm a deal.
            </Typography>
          </Card>
          <ListingDetails listing={l} />
          {existing ? <DocumentsCard listingId={l.id} canManage={false} /> : null}
        </>
      )}
      {l && state.data ? (
        <TermsSheet
          visible={offerOpen}
          onClose={() => setOfferOpen(false)}
          title={`Make an offer on ${l.referenceNumber ?? ''}`}
          description={`The ${cfg.copy.counterparty.toLowerCase()} can accept, reject or counter. Offers expire automatically if not answered.`}
          submitLabel="Send offer"
          inspectionTypes={state.data.master.enums.inspectionTypes}
          fixed={{
            currencyCode: l.commercial.currencyCode,
            priceUnit: l.commercial.priceUnit,
            quantityUnit: l.product.quantityUnit,
            incoterm: l.commercial.incoterm?.code ?? null,
            priceBasis: l.commercial.priceBasisPort
              ? portLabel(l.commercial.priceBasisPort)
              : l.commercial.priceBasisLocation,
          }}
          defaults={{
            price: l.commercial.price,
            quantity: l.product.quantity,
            paymentTermId: l.commercial.paymentTermId,
            esd: l.shipping.esd,
            lsd: l.shipping.lsd,
            inspectionType: l.quality.inspectionType,
          }}
          onSubmit={async (terms, key) => {
            const result = await openNegotiation(
              {
                ...terms,
                listingId: l.id,
                counterListingId: from,
                price: terms.price ?? '',
                quantity: terms.quantity ?? '',
              },
              key,
            );
            Toast.show({ type: 'success', text1: `Offer sent · ${result.referenceNumber}` });
            router.replace({
              pathname: cfg.routes.negotiation,
              params: { id: result.id },
            } as unknown as Href);
          }}
        />
      ) : null}
    </ImportScreen>
  );
}
