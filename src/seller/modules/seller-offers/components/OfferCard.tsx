import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Typography } from '@/components';
import { CopyIcon, EditIcon, TrashIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import {
  OfferAnalyticsCard,
} from '@/seller/modules/seller-offers/components/OfferAnalyticsCard';
import { OfferStatusBadge } from '@/seller/modules/seller-offers/components/OfferStatusBadge';
import { InventoryProgressCard } from '@/seller/modules/seller-offers/components/InventoryProgressCard';
import { OfferTierList } from '@/seller/modules/seller-offers/components/OfferTierCard';
import type { SellerOffer } from '@/seller/modules/seller-offers/types/offers';

const PauseIcon = () => (
  <View className="flex-row gap-[2px]">
    <View className="h-3.5 w-1 rounded-sm bg-brand-heading" />
    <View className="h-3.5 w-1 rounded-sm bg-brand-heading" />
  </View>
);

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

  return (
    <Pressable
      onPress={onPress}
      className="mb-md overflow-hidden rounded-2xl border border-brand-border bg-brand-white"
      style={({ pressed }) => ({ opacity: pressed && onPress ? 0.96 : 1 })}
    >
      <View className="px-md pb-sm pt-md">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-md">
            <View className="flex-row flex-wrap items-center gap-sm">
              <Typography variant="badge" className="text-[11px] text-brand-body">
                {offer.category}
              </Typography>
              <OfferStatusBadge status={offer.status} />
            </View>
            <Typography variant="headingLeft" className="mt-sm text-[20px] text-brand-navy">
              {offer.product}
            </Typography>
            <Typography variant="legal" className="mt-xs text-left text-brand-body">
              OFFER-ID: {offer.offerId}
            </Typography>
          </View>
          <View className="items-end">
            <Typography variant="headingLeft" className="text-[22px] text-brand-navy">
              ₹{offer.basePrice}/kg
            </Typography>
            <Typography variant="legal" className="mt-xs text-brand-body">
              MOQ: {offer.moq} MT
            </Typography>
          </View>
        </View>
      </View>

      <OfferAnalyticsCard analytics={offer.analytics} />
      {offer.tiers.length > 0 ? <OfferTierList tiers={offer.tiers} highlightLast /> : null}
      <InventoryProgressCard
        allocatedStock={offer.allocatedStock}
        reservedStock={offer.reservedStock}
        remainingStock={offer.remainingStock}
      />

      <View className="flex-row items-center gap-sm border-t border-brand-border px-md py-md">
        {isPaused ? (
          <Pressable
            onPress={onResume}
            className="flex-1 items-center rounded-xl bg-brand-navy py-md"
          >
            <Typography variant="roleTitle" className="text-brand-white">
              Resume Trading
            </Typography>
          </Pressable>
        ) : (
          <>
            <OfferActionButton label="Edit" icon="edit" onPress={onEdit} />
            {isActive ? (
              <OfferActionButton label="Pause" icon="pause" onPress={onPause} />
            ) : null}
            <OfferActionButton label="Duplicate" icon="duplicate" onPress={onDuplicate} />
            <Pressable
              onPress={onDelete}
              className="h-11 w-11 items-center justify-center rounded-xl border border-brand-error-light bg-brand-error-light"
            >
              <TrashIcon size={16} color={brandColors.error} />
            </Pressable>
          </>
        )}
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
    className="flex-1 flex-row items-center justify-center gap-xs rounded-xl border border-brand-border bg-brand-white py-md"
  >
    {icon === 'edit' ? <EditIcon size={14} color={brandColors.heading} /> : null}
    {icon === 'pause' ? <PauseIcon /> : null}
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
    year: 'numeric',
  }).format(new Date(offer.expiresAt));

  return (
    <View className="mb-sm rounded-2xl border border-brand-border bg-brand-white p-md">
      <View className="flex-row items-start justify-between">
        <Typography variant="roleTitle" className="flex-1 pr-md text-brand-heading">
          {offer.product}
        </Typography>
        <View className="items-end">
          <Typography variant="roleTitle">₹{offer.basePrice}/kg</Typography>
          <Typography variant="legal" className="text-brand-body">
            MOQ: {offer.moq} MT
          </Typography>
        </View>
      </View>

      <View className="mt-sm flex-row flex-wrap gap-sm">
        {offer.tiers.length > 0 ? (
          <View className="rounded-full bg-brand-primary-light px-sm py-xs">
            <Typography variant="badge" className="text-[10px] text-brand-primary">
              BULK PRICING AVAILABLE
            </Typography>
          </View>
        ) : null}
        <OfferStatusBadge status={offer.status} compact />
      </View>

      <View className="mt-md flex-row gap-md">
        <View className="flex-1">
          <Typography variant="legal" className="text-left text-brand-body">
            Availability
          </Typography>
          <Typography variant="roleDescription">{offer.remainingStock} MT</Typography>
        </View>
        <View className="flex-1">
          <Typography variant="legal" className="text-left text-brand-body">
            {offer.status === 'paused' ? 'Inventory Status' : 'Last Price Change'}
          </Typography>
          <Typography
            variant="roleDescription"
            className={offer.remainingStock < 200 ? 'text-brand-error' : undefined}
          >
            {offer.status === 'paused'
              ? 'Low Stock'
              : new Intl.DateTimeFormat('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }).format(new Date(offer.updatedAt))}
          </Typography>
        </View>
      </View>

      <View className="mt-md flex-row items-center justify-between">
        <Typography variant="legal" className="text-brand-body">
          Expires: {expiry}
        </Typography>
        {offer.status === 'paused' ? (
          <Pressable onPress={onResume} className="rounded-lg bg-brand-navy px-md py-sm">
            <Typography variant="badge" className="text-brand-white">
              Resume Trading
            </Typography>
          </Pressable>
        ) : (
          <View className="flex-row gap-sm">
            <IconButton icon="create-outline" onPress={onEdit} />
            <IconButton icon="pause" onPress={onPause} />
            <IconButton icon="copy-outline" onPress={onDuplicate} />
            <IconButton icon="trash-outline" onPress={onDelete} danger />
          </View>
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
    className="h-9 w-9 items-center justify-center rounded-lg border border-brand-border"
  >
    <Ionicons
      name={icon}
      size={16}
      color={danger ? brandColors.error : brandColors.heading}
    />
  </Pressable>
);
