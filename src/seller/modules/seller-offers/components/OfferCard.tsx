import { memo, useMemo } from 'react';

import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Typography } from '@/components';
import { CopyIcon, EditIcon, LocationPinIcon, TrashIcon } from '@/icons';
import { OfferAnalyticsCard } from '@/seller/modules/seller-offers/components/OfferAnalyticsCard';
import { InventoryProgressCard } from '@/seller/modules/seller-offers/components/InventoryProgressCard';
import { OfferStatusBadge } from '@/seller/modules/seller-offers/components/OfferStatusBadge';
import { OfferTierList } from '@/seller/modules/seller-offers/components/OfferTierCard';
import type { OfferStatus, SellerOffer } from '@/seller/modules/seller-offers/types/offers';
import { brandColors } from '@/theme/colors';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

const ACCENT: Record<OfferStatus, string> = {
  draft: 'bg-brand-primary',
  pending_review: 'bg-[#F59E0B]',
  approved: 'bg-brand-success',
  active: 'bg-brand-success',
  paused: 'bg-[#F59E0B]',
  expired: 'bg-brand-error',
  rejected: 'bg-brand-error',
};

const formatKgPrice = (value: number): string =>
  `₹${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}`;

const formatExpiry = (value: string, status: OfferStatus): string => {
  const label = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value));

  return status === 'expired' ? `Expired ${label}` : `Expires ${label}`;
};

type OfferCardProps = {
  offer: SellerOffer;
  onEdit?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
};

export const OfferCard = memo(function OfferCard({
  offer,
  onEdit,
  onPause,
  onResume,
  onDuplicate,
  onDelete,
  onPress,
}: OfferCardProps) {
  const isPaused = offer.status === 'paused';
  const isActive = offer.status === 'active';
  const isDraft = offer.status === 'draft';
  const isExpired = offer.status === 'expired';
  const lowStock = offer.allocatedStock > 0 && offer.remainingStock / offer.allocatedStock <= 0.28;

  const expiryLabel = useMemo(
    () => formatExpiry(offer.expiresAt, offer.status),
    [offer.expiresAt, offer.status],
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${offer.product}, ${formatKgPrice(offer.basePrice)} per kg`}
      className="mb-md overflow-hidden rounded-[24px] border border-brand-border bg-brand-white"
      style={({ pressed }) => [
        elevation.sm,
        { opacity: pressed && onPress ? 0.97 : 1, transform: [{ scale: pressed && onPress ? 0.995 : 1 }] },
      ]}
    >
      <View className={cn('absolute bottom-0 left-0 top-0 w-1', ACCENT[offer.status])} />

      <View className="px-md pb-sm pt-md">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-md">
            <View className="flex-row flex-wrap items-center gap-xs">
              <View className="rounded-md bg-brand-primary-light px-sm py-xs">
                <Typography variant="badge" className="text-[10px] tracking-[0.6px] text-brand-primary-dark">
                  {offer.category}
                </Typography>
              </View>
              <OfferStatusBadge status={offer.status} compact />
              {lowStock && isActive ? (
                <View className="rounded-full bg-brand-error-light px-sm py-xs">
                  <Typography variant="badge" className="text-[10px] text-brand-error">
                    LOW STOCK
                  </Typography>
                </View>
              ) : null}
            </View>
            <Typography
              variant="headingLeft"
              className="mt-sm text-[18px] leading-[24px] text-brand-heading"
              numberOfLines={2}
            >
              {offer.product}
            </Typography>
            <View className="mt-xs flex-row flex-wrap items-center gap-xs">
              <Typography variant="legal" className="text-left text-[11px] text-brand-body">
                {offer.offerId}
              </Typography>
              <Typography variant="legal" className="text-[11px] text-brand-footer">
                ·
              </Typography>
              <LocationPinIcon size={11} color={brandColors.footer} />
              <Typography variant="legal" className="text-left text-[11px] text-brand-body" numberOfLines={1}>
                {offer.warehouse}
              </Typography>
            </View>
          </View>

          <View className="items-end rounded-2xl bg-brand-primary-tint px-md py-sm">
            <Typography variant="headingLeft" className="text-[20px] leading-[24px] text-brand-navy">
              {formatKgPrice(offer.basePrice)}
            </Typography>
            <Typography variant="legal" className="mt-[2px] text-right text-[10px] text-brand-body">
              /kg · MOQ {offer.moq} MT
            </Typography>
          </View>
        </View>
      </View>

      {isDraft ? (
        <View className="mx-md mb-md rounded-2xl bg-brand-primary-tint px-md py-sm">
          <Typography variant="legal" className="text-left text-[12px] text-brand-primary-dark">
            Draft saved. Finish pricing and submit to go live on the marketplace.
          </Typography>
        </View>
      ) : (
        <View className="px-md pb-md">
          <OfferAnalyticsCard analytics={offer.analytics} compact />
        </View>
      )}

      {offer.tiers.length > 0 ? (
        <View className="px-md pb-md">
          <Typography variant="badge" className="mb-xs text-[10px] tracking-[0.8px] text-brand-body">
            BULK TIERS
          </Typography>
          <OfferTierList tiers={offer.tiers} highlightLast compact />
        </View>
      ) : null}

      <View className="px-md pb-md">
        <InventoryProgressCard
          allocatedStock={offer.allocatedStock}
          reservedStock={offer.reservedStock}
          remainingStock={offer.remainingStock}
          compact
        />
        <Typography variant="legal" className="mt-xs text-left text-[11px] text-brand-footer">
          {expiryLabel}
        </Typography>
      </View>

      <View className="flex-row items-center gap-sm border-t border-brand-border px-md py-md">
        {isPaused ? (
          <Pressable
            onPress={onResume}
            className="flex-1 items-center rounded-2xl bg-brand-navy py-[12px]"
            style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
          >
            <Typography variant="roleTitle" className="text-[14px] text-brand-white">
              Resume trading
            </Typography>
          </Pressable>
        ) : isDraft ? (
          <Pressable
            onPress={onEdit}
            className="flex-1 items-center rounded-2xl bg-brand-navy py-[12px]"
            style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
          >
            <Typography variant="roleTitle" className="text-[14px] text-brand-white">
              Continue editing
            </Typography>
          </Pressable>
        ) : isExpired ? (
          <Pressable
            onPress={onDuplicate}
            className="flex-1 items-center rounded-2xl bg-brand-navy py-[12px]"
            style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
          >
            <Typography variant="roleTitle" className="text-[14px] text-brand-white">
              Renew offer
            </Typography>
          </Pressable>
        ) : (
          <>
            <OfferActionButton label="Edit" icon="edit" onPress={onEdit} />
            {isActive ? <OfferActionButton label="Pause" icon="pause" onPress={onPause} /> : null}
            <OfferActionButton label="Duplicate" icon="duplicate" onPress={onDuplicate} />
          </>
        )}
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Delete offer"
          className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-error-light"
          style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
        >
          <TrashIcon size={16} color={brandColors.error} />
        </Pressable>
      </View>
    </Pressable>
  );
});

const OfferActionButton = ({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: 'edit' | 'pause' | 'duplicate';
  onPress?: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className="h-11 flex-1 flex-row items-center justify-center gap-xs rounded-2xl border border-brand-border bg-brand-white"
    style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
  >
    {icon === 'edit' ? <EditIcon size={14} color={brandColors.heading} /> : null}
    {icon === 'pause' ? (
      <View className="flex-row gap-[2px]">
        <View className="h-3 w-1 rounded-sm bg-brand-heading" />
        <View className="h-3 w-1 rounded-sm bg-brand-heading" />
      </View>
    ) : null}
    {icon === 'duplicate' ? <CopyIcon size={14} color={brandColors.heading} /> : null}
    <Typography variant="badge" className="text-[11px] text-brand-heading">
      {label}
    </Typography>
  </Pressable>
);

export const ActiveOfferCompactCard = memo(function ActiveOfferCompactCard({
  offer,
  onEdit,
  onPause,
  onDuplicate,
  onDelete,
  onResume,
}: OfferCardProps) {
  const expiry = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(offer.expiresAt));

  return (
    <View
      className="mb-sm overflow-hidden rounded-[20px] border border-brand-border bg-brand-white p-md"
      style={elevation.sm}
    >
      <View className={cn('absolute bottom-0 left-0 top-0 w-1', ACCENT[offer.status])} />
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-md">
          <Typography variant="roleTitle" className="text-[15px] leading-[20px] text-brand-heading" numberOfLines={2}>
            {offer.product}
          </Typography>
          <Typography variant="legal" className="mt-xs text-left text-[11px] text-brand-body">
            {offer.offerId} · {offer.warehouse}
          </Typography>
        </View>
        <View className="items-end">
          <Typography variant="roleTitle" className="text-brand-navy">
            {formatKgPrice(offer.basePrice)}/kg
          </Typography>
          <Typography variant="legal" className="text-[10px] text-brand-body">
            MOQ {offer.moq} MT
          </Typography>
        </View>
      </View>

      <View className="mt-sm flex-row flex-wrap items-center gap-xs">
        {offer.tiers.length > 0 ? (
          <View className="rounded-full bg-brand-primary-light px-sm py-xs">
            <Typography variant="badge" className="text-[10px] text-brand-primary-dark">
              Bulk pricing
            </Typography>
          </View>
        ) : null}
        <OfferStatusBadge status={offer.status} compact />
      </View>

      <View className="mt-md flex-row gap-md">
        <View className="flex-1">
          <Typography variant="legal" className="text-left text-[10px] text-brand-body">
            Availability
          </Typography>
          <Typography variant="roleDescription">{offer.remainingStock} MT</Typography>
        </View>
        <View className="flex-1">
          <Typography variant="legal" className="text-left text-[10px] text-brand-body">
            {offer.status === 'paused' ? 'Inventory' : 'Expires'}
          </Typography>
          <Typography
            variant="roleDescription"
            className={offer.remainingStock < 200 ? 'text-brand-error' : undefined}
          >
            {offer.status === 'paused' ? 'Low stock' : expiry}
          </Typography>
        </View>
      </View>

      <View className="mt-md flex-row items-center justify-end gap-sm">
        {offer.status === 'paused' ? (
          <Pressable onPress={onResume} className="rounded-xl bg-brand-navy px-md py-sm">
            <Typography variant="badge" className="text-brand-white">
              Resume
            </Typography>
          </Pressable>
        ) : (
          <>
            <IconButton icon="create-outline" onPress={onEdit} />
            <IconButton icon="pause" onPress={onPause} />
            <IconButton icon="copy-outline" onPress={onDuplicate} />
            <IconButton icon="trash-outline" onPress={onDelete} danger />
          </>
        )}
      </View>
    </View>
  );
});

const IconButton = ({
  icon,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  danger?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    className="h-9 w-9 items-center justify-center rounded-xl border border-brand-border"
  >
    <Ionicons name={icon} size={16} color={danger ? brandColors.error : brandColors.heading} />
  </Pressable>
);
