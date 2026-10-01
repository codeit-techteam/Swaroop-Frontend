import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { Card, KeyValues, StatusPill } from '@/features/import/components';
import {
  formatDate,
  formatDateTime,
  formatPrice,
  formatQty,
  formatRemaining,
  importLabel,
  listingTitle,
  portLabel,
} from '@/features/import/format';
import type { ImportListing } from '@/features/import/types';

export function ListingHeader({ listing: l }: { listing: ImportListing }) {
  const c = l.commercial;
  return (
    <Card>
      <View className="flex-row items-start justify-between gap-sm">
        <View className="flex-1">
          <Typography variant="roleDescription" className="text-brand-muted">
            {l.referenceNumber ?? 'Draft'}
            {l.viewerRole === 'COUNTERPARTY' ? ` · ${l.counterpartyRef}` : ''}
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[17px]">
            {listingTitle(l)}
          </Typography>
        </View>
        <StatusPill status={l.status} />
      </View>
      <Typography variant="headingLeft" className="mt-md text-[20px] text-brand-navy">
        {formatPrice(c.price, c.currencyCode, c.priceUnit)}
      </Typography>
      <Typography variant="roleDescription" className="mt-xs">
        {c.incoterm?.code ?? '—'}{' '}
        {c.priceBasisPort ? portLabel(c.priceBasisPort) : (c.priceBasisLocation ?? '')} ·{' '}
        {formatQty(l.product.quantity, l.product.quantityUnit)}
      </Typography>
      <Typography variant="roleDescription" className="mt-xs text-brand-muted">
        {l.shipping.pol?.code ?? '—'} → {l.shipping.pod?.code ?? '—'} · Ships{' '}
        {formatDate(l.shipping.esd)} – {formatDate(l.shipping.lsd)}
      </Typography>
      {l.status !== 'DRAFT' ? (
        <Typography variant="roleDescription" className="mt-xs text-brand-muted">
          {formatRemaining(l.validity.secondsRemaining)}
          {l.validity.validUntil ? ` · valid until ${formatDateTime(l.validity.validUntil)}` : ''}
        </Typography>
      ) : null}
    </Card>
  );
}

export function ListingDetails({ listing: l }: { listing: ImportListing }) {
  const p = l.product;
  const c = l.commercial;
  const s = l.shipping;
  const q = l.quality;
  return (
    <>
      <Card title="Product">
        <KeyValues
          rows={[
            ['Product', p.category?.name],
            ['Grade', p.grade?.name ?? p.customGradeName],
            ['Brand', p.brand?.name],
            ['Origin', p.originCountry?.name],
            ['Quantity', formatQty(p.quantity, p.quantityUnit)],
            ['Packaging', p.packaging?.name],
            ['Application', p.application],
            ['HS code', p.hsCode],
            ['CAS number', p.casNumber],
            ...(l.buyTerms
              ? ([
                  [
                    'Acceptable quantity',
                    l.buyTerms.acceptableQuantityMin || l.buyTerms.acceptableQuantityMax
                      ? `${formatQty(l.buyTerms.acceptableQuantityMin, p.quantityUnit)} – ${formatQty(
                          l.buyTerms.acceptableQuantityMax,
                          p.quantityUnit,
                        )}`
                      : null,
                  ],
                  ['Required delivery', formatDate(l.buyTerms.requiredDeliveryDate)],
                ] as [string, string | null][])
              : []),
            ...(l.sellTerms
              ? ([
                  ['MOQ', formatQty(l.sellTerms.moq, p.quantityUnit)],
                  ['Maximum per buyer', formatQty(l.sellTerms.maximumQuantity, p.quantityUnit)],
                  ['Stock type', importLabel(l.sellTerms.readyStockType)],
                ] as [string, string | null][])
              : []),
          ]}
        />
        {l.buyTerms?.specialRequirements ? (
          <Typography variant="roleDescription" className="mt-md">
            {l.buyTerms.specialRequirements}
          </Typography>
        ) : null}
      </Card>
      <Card title="Commercial">
        <KeyValues
          rows={[
            ['Price', formatPrice(c.price, c.currencyCode, c.priceUnit)],
            ['Price type', importLabel(c.priceType)],
            ['Incoterm', c.incoterm ? `${c.incoterm.code} — ${c.incoterm.name}` : null],
            ['Price basis', c.priceBasisPort ? portLabel(c.priceBasisPort) : c.priceBasisLocation],
            ['Payment terms', c.paymentTerm?.displayName ?? c.paymentTerm?.name],
            ...(c.currencyCode === 'INR'
              ? ([['GST', importLabel(c.gstTreatment)]] as [string, string][])
              : []),
          ]}
        />
      </Card>
      <Card title="Shipping">
        <KeyValues
          rows={[
            ['Port of loading', portLabel(s.pol)],
            ['Port of discharge', portLabel(s.pod)],
            ['Shipment window', `${formatDate(s.esd)} – ${formatDate(s.lsd)}`],
            [
              'Transit time',
              s.transitMinDays !== null || s.transitMaxDays !== null
                ? `${s.transitMinDays ?? '—'}–${s.transitMaxDays ?? '—'} days`
                : null,
            ],
            [
              'Estimated arrival',
              s.estimatedEta
                ? `${formatDate(s.estimatedEta.from)} – ${formatDate(s.estimatedEta.to)}`
                : null,
            ],
            ['Partial shipment', importLabel(s.partialShipment)],
            ['Transshipment', importLabel(s.transshipment)],
            ['Shipment type', importLabel(s.shipmentType)],
            [
              'Container',
              s.containerSize
                ? `${importLabel(s.containerSize)} × ${s.containerCount ?? '—'}`
                : null,
            ],
          ]}
        />
        <Typography variant="roleDescription" className="mt-sm text-[12px] text-brand-muted">
          Arrival is an estimate from the shipment window and transit days, not a carrier schedule.
        </Typography>
      </Card>
      <Card title="Quality & documents">
        <KeyValues rows={[['Inspection', importLabel(q.inspectionType)]]} />
        {q.specification ? (
          <Typography variant="roleDescription" className="mt-md">
            {q.specification}
          </Typography>
        ) : null}
        {q.documentRequirements.length ? (
          <View className="mt-md flex-row flex-wrap gap-xs">
            {q.documentRequirements.map((d) => (
              <View key={d.id} className="rounded-lg bg-brand-surface px-sm py-xs">
                <Typography variant="roleDescription" className="text-[12px]">
                  {d.name}
                </Typography>
              </View>
            ))}
          </View>
        ) : null}
        {l.remarks ? (
          <Typography variant="roleDescription" className="mt-md text-brand-muted">
            {l.remarks}
          </Typography>
        ) : null}
      </Card>
    </>
  );
}

/** Compact row for listing lists. */
export function ListingRow({
  listing: l,
  onPress,
}: {
  listing: ImportListing;
  onPress: () => void;
}) {
  const c = l.commercial;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="rounded-2xl border border-brand-border bg-brand-white p-lg active:opacity-80"
    >
      <View className="flex-row items-start justify-between gap-sm">
        <View className="flex-1">
          <Typography variant="roleDescription" className="text-[12px] text-brand-muted">
            {l.referenceNumber ?? 'Draft'}
            {l.viewerRole === 'COUNTERPARTY' ? ` · ${l.counterpartyRef}` : ''}
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[15px]" numberOfLines={1}>
            {listingTitle(l)}
          </Typography>
        </View>
        <StatusPill status={l.status} />
      </View>
      <Typography variant="roleDescription" className="mt-sm font-semibold text-brand-heading">
        {formatPrice(c.price, c.currencyCode, c.priceUnit)} {c.incoterm?.code ?? ''}
      </Typography>
      <Typography variant="roleDescription" className="mt-xs text-brand-muted">
        {formatQty(l.product.quantity, l.product.quantityUnit)} · {l.shipping.pol?.code ?? '—'} →{' '}
        {l.shipping.pod?.code ?? '—'} · {formatDate(l.shipping.esd)}
      </Typography>
      {l.status !== 'DRAFT' && l.validity.validUntil ? (
        <Typography variant="roleDescription" className="mt-xs text-[12px] text-brand-muted">
          {formatRemaining(l.validity.secondsRemaining)}
        </Typography>
      ) : null}
    </Pressable>
  );
}
