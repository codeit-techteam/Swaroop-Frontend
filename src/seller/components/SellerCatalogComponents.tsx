import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import type { SellerMaterialFamily } from '@/constants/materials-taxonomy';
import type { SellerProduct, SellerProductStatus } from '@/seller/types';
import { formatCatalogKgPrice, formatCatalogPrice } from '@/seller/utils/catalog';
import { formatSellerSellingPrice } from '@/seller/utils/pricing';
import { elevation } from '@/theme/shadows';
import type { MarketProduct } from '@/types/market';
import { cn } from '@/utils/cn';

export const SellerMaterialTile = memo(function SellerMaterialTile({
  family,
  listedCount = 0,
  onPress,
}: {
  family: SellerMaterialFamily;
  listedCount?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${family.code}, ${family.gradeCount} grades`}
      className="min-h-[108px] flex-1 rounded-2xl border border-brand-border bg-brand-white px-md py-lg"
      style={({ pressed }) => [
        elevation.sm,
        { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
      ]}
    >
      <Typography
        variant="headingLeft"
        className="text-center text-[15px] leading-[20px] tracking-[0.4px] text-brand-heading"
        numberOfLines={2}
      >
        {family.code}
      </Typography>
      <Typography variant="legal" className="mt-sm text-center text-[11px] text-brand-body">
        {family.gradeCount} grade{family.gradeCount === 1 ? '' : 's'}
      </Typography>
      {listedCount > 0 ? (
        <View className="mt-sm self-center rounded-full bg-brand-success-light px-sm py-xs">
          <Typography variant="badge" className="text-[10px] text-brand-success">
            {listedCount} listed
          </Typography>
        </View>
      ) : (
        <Typography variant="legal" className="mt-sm text-center text-[10px] text-brand-footer">
          from {formatCatalogKgPrice(family.startingPrice)}/kg
        </Typography>
      )}
    </Pressable>
  );
});

export const SellerCatalogGradeRow = memo(function SellerCatalogGradeRow({
  product,
  listing,
  onPress,
}: {
  product: MarketProduct;
  listing?: SellerProduct;
  onPress: () => void;
}) {
  const listed = Boolean(listing);
  const status = listing?.status;
  const mfi = product.technicalSpecs?.mfi?.replace(' g/10 min', '');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={product.name}
      className="flex-row items-center rounded-2xl border border-brand-border bg-brand-white px-md py-md"
      style={({ pressed }) => [elevation.sm, { opacity: pressed ? 0.94 : 1 }]}
    >
      <View className="flex-1 pr-md">
        <View className="flex-row items-center">
          <View className="rounded-md bg-brand-primary-light px-sm py-xs">
            <Typography variant="badge" className="text-[10px] tracking-[0.6px] text-brand-primary-dark">
              {product.grade}
            </Typography>
          </View>
          {listed ? (
            <View
              className={cn(
                'ml-sm rounded-full px-sm py-xs',
                status === 'published'
                  ? 'bg-brand-success-light'
                  : status === 'draft'
                    ? 'bg-brand-primary-light'
                    : 'bg-brand-error-light',
              )}
            >
              <Typography
                variant="badge"
                className={cn(
                  'text-[10px]',
                  status === 'published'
                    ? 'text-brand-success'
                    : status === 'draft'
                      ? 'text-brand-primary-dark'
                      : 'text-brand-error',
                )}
              >
                {status === 'published' ? 'Listed' : status === 'draft' ? 'Draft' : 'Inactive'}
              </Typography>
            </View>
          ) : null}
        </View>
        <Typography
          variant="roleTitle"
          className="mt-sm text-[15px] leading-[20px] text-brand-heading"
          numberOfLines={1}
        >
          {product.name}
        </Typography>
        <Typography variant="legal" className="mt-xs text-left text-[11px] text-brand-body">
          {[product.gradeCode, mfi ? `${mfi} MFI` : null, product.subCategory].filter(Boolean).join(' · ')}
        </Typography>
      </View>
      <View className="items-end">
        <Typography variant="headingLeft" className="text-[18px] leading-[22px] text-brand-navy">
          {formatCatalogKgPrice(product.price)}
        </Typography>
        <Typography variant="legal" className="mt-xs text-right text-[10px] text-brand-footer">
          /kg · {formatCatalogPrice(product.price)}/MT
        </Typography>
        <View className="mt-sm rounded-full bg-brand-navy px-md py-xs">
          <Typography variant="badge" className="text-[10px] text-brand-white">
            {listed ? 'Manage' : 'List'}
          </Typography>
        </View>
      </View>
    </Pressable>
  );
});

const listingStatusTone: Record<SellerProductStatus, { chip: string; text: string; label: string }> = {
  published: { chip: 'bg-brand-success-light', text: 'text-brand-success', label: 'Published' },
  draft: { chip: 'bg-brand-primary-light', text: 'text-brand-primary-dark', label: 'Draft' },
  inactive: { chip: 'bg-brand-error-light', text: 'text-brand-error', label: 'Inactive' },
};

export const SellerListingCard = memo(function SellerListingCard({
  product,
  onPress,
  onEdit,
  onDeactivate,
  onDelete,
}: {
  product: SellerProduct;
  onPress: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}) {
  const tone = listingStatusTone[product.status];
  const priceLabel = formatSellerSellingPrice(product.pricing, product.form.unit || 'MT');

  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl border border-brand-border bg-brand-white p-md"
      style={elevation.sm}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-md">
          <Typography variant="roleTitle" className="text-[16px] leading-[22px]" numberOfLines={2}>
            {product.form.name}
          </Typography>
          <Typography variant="legal" className="mt-xs text-left text-[11px] text-brand-body">
            {product.form.grade} · {product.form.category}
            {product.form.brand ? ` · ${product.form.brand}` : ''}
          </Typography>
        </View>
        <View className={cn('rounded-full px-sm py-xs', tone.chip)}>
          <Typography variant="badge" className={cn('text-[10px]', tone.text)}>
            {tone.label}
          </Typography>
        </View>
      </View>

      <View className="mt-md flex-row">
        <View className="flex-1">
          <Typography variant="fieldLabel">Stock</Typography>
          <Typography variant="roleTitle" className="mt-xs text-[15px]">
            {product.form.availableQty || '0'} {product.form.unit || 'MT'}
          </Typography>
        </View>
        <View className="flex-1">
          <Typography variant="fieldLabel">MOQ</Typography>
          <Typography variant="roleTitle" className="mt-xs text-[15px]">
            {product.form.moq || '—'} {product.form.unit || 'MT'}
          </Typography>
        </View>
        <View className="flex-1">
          <Typography variant="fieldLabel">Price</Typography>
          <Typography variant="roleTitle" className="mt-xs text-[15px] text-brand-navy">
            {priceLabel}
          </Typography>
        </View>
      </View>

      <View className="mt-md flex-row gap-sm">
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          className="flex-1 items-center rounded-xl bg-brand-primary-light py-sm"
        >
          <Typography variant="badge" className="text-[11px] text-brand-primary-dark">
            Edit
          </Typography>
        </Pressable>
        {product.status !== 'inactive' ? (
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onDeactivate();
            }}
            className="flex-1 items-center rounded-xl bg-brand-surface py-sm"
          >
            <Typography variant="badge" className="text-[11px] text-brand-body">
              Deactivate
            </Typography>
          </Pressable>
        ) : null}
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="flex-1 items-center rounded-xl bg-brand-error-light py-sm"
        >
          <Typography variant="badge" className="text-[11px] text-brand-error">
            Delete
          </Typography>
        </Pressable>
      </View>
    </Pressable>
  );
});

export const SellerCatalogSelectedBanner = memo(function SellerCatalogSelectedBanner({
  product,
  onChange,
}: {
  product: MarketProduct;
  onChange?: () => void;
}) {
  const mfi = product.technicalSpecs?.mfi?.replace(' g/10 min', '');

  return (
    <View className="overflow-hidden rounded-3xl bg-brand-navy p-lg" style={elevation.sm}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-md">
          <Typography variant="badge" className="text-[10px] text-brand-primary-light">
            Marketplace grade
          </Typography>
          <Typography variant="headingLeft" className="mt-xs text-[20px] leading-[26px] text-brand-white">
            {product.name}
          </Typography>
          <Typography variant="legal" className="mt-sm text-left text-[11px] text-brand-primary-light">
            {[product.gradeCode, product.materialType, product.subCategory, mfi ? `${mfi} MFI` : null]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
        </View>
        {onChange ? (
          <Pressable onPress={onChange} className="rounded-full bg-white/15 px-md py-sm">
            <Typography variant="badge" className="text-[11px] text-brand-white">
              Change
            </Typography>
          </Pressable>
        ) : null}
      </View>
      <View className="mt-lg flex-row">
        <View className="flex-1 rounded-2xl bg-white/10 px-md py-sm">
          <Typography variant="legal" className="text-left text-[10px] text-brand-primary-light">
            Indicative
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-white">
            {formatCatalogKgPrice(product.price)}/kg
          </Typography>
        </View>
        <View className="ml-sm flex-1 rounded-2xl bg-white/10 px-md py-sm">
          <Typography variant="legal" className="text-left text-[10px] text-brand-primary-light">
            Buyer MOQ
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-white">
            {product.moq} MT
          </Typography>
        </View>
      </View>
    </View>
  );
});
