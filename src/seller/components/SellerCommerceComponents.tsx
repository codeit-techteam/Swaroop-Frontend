import { memo, useMemo, type ReactNode } from 'react';

import { Pressable, TextInput, View } from 'react-native';

import { Typography } from '@/components';
import {
  AlertCircleIcon,
  BellIcon,
  BriefcaseIcon,
  BuildingIcon,
  CheckCircleIcon,
  ClipboardCheckIcon,
  CurrencyIcon,
  EditIcon,
  HomeTabIcon,
  MoreVerticalIcon,
  OrdersTabIcon,
  ProfileIcon,
  StoreIcon,
  TrashIcon,
  TruckIcon,
  WalletIcon,
} from '@/icons';
import type { SellerBottomNavTarget } from '@/seller/navigation/useSellerBottomNavigation';
import type {
  SellerPaymentPricing,
  SellerPricingTier,
  SellerProduct,
  SellerShipment,
  SellerShipmentStatus,
  SellerStat,
  SellerTechnicalSpecs,
} from '@/seller/types';
import { formatSellerSellingPrice, getSellerSellingPrice } from '@/seller/utils/pricing';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type SellerDashboardHeaderProps = {
  sellerName: string;
  onNotificationPress?: () => void;
};

export const SellerDashboardHeader = memo(function SellerDashboardHeader({
  sellerName,
  onNotificationPress,
}: SellerDashboardHeaderProps) {
  return (
    <View className="rounded-[28px] bg-brand-white px-lg py-lg">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-sm">
          <View className="rounded-xl bg-brand-primary-light px-sm py-sm">
            <BuildingIcon size={16} color={brandColors.primaryDark} />
          </View>
          <Typography variant="logo" className="text-[18px] text-brand-heading">
            PetroTrade
          </Typography>
        </View>
        <Pressable className="rounded-full p-sm" onPress={onNotificationPress}>
          <BellIcon />
        </Pressable>
      </View>

      <Typography variant="legal" className="mt-lg text-left text-brand-body">
        Welcome back, {sellerName}
      </Typography>
      <Typography variant="headingLeft" className="mt-xs text-[32px]">
        Dashboard
      </Typography>
    </View>
  );
});

type QuickActionCardProps = {
  label: string;
  icon: 'add' | 'stock' | 'offers' | 'dispatch';
  onPress: () => void;
};

const QuickActionIcon = ({ icon }: { icon: QuickActionCardProps['icon'] }) => {
  switch (icon) {
    case 'add':
      return <StoreIcon size={16} color={brandColors.primaryDark} />;
    case 'stock':
      return <ClipboardCheckIcon size={16} color={brandColors.primaryDark} />;
    case 'offers':
      return <CurrencyIcon size={16} color={brandColors.primaryDark} />;
    case 'dispatch':
      return <TruckIcon size={16} color={brandColors.primaryDark} />;
  }
};

export const QuickActionCard = memo(function QuickActionCard({
  label,
  icon,
  onPress,
}: QuickActionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="min-h-[96px] flex-1 rounded-2xl border border-brand-border bg-brand-white px-md py-lg"
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View className="h-11 w-11 items-center justify-center rounded-xl bg-brand-primary-light">
        <QuickActionIcon icon={icon} />
      </View>
      <Typography variant="roleTitle" className="mt-md text-[14px]">
        {label}
      </Typography>
    </Pressable>
  );
});

export const StatsCard = memo(function StatsCard({ stat }: { stat: SellerStat }) {
  return (
    <View className="min-h-[84px] flex-1 rounded-2xl border border-brand-border bg-brand-white px-md py-md">
      <Typography variant="legal" className="text-left text-brand-body">
        {stat.label}
      </Typography>
      <Typography variant="headingLeft" className="mt-sm text-[30px]">
        {stat.value}
      </Typography>
    </View>
  );
});

export const ShipmentCard = memo(function ShipmentCard({
  shipment,
  onPress,
}: {
  shipment: SellerShipment;
  onPress: () => void;
}) {
  const statusClass: Record<SellerShipmentStatus, string> = {
    'On Time': 'text-brand-success',
    'In Transit': 'text-[#D97706]',
    Delayed: 'text-brand-error',
  };

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-2xl border border-brand-border bg-brand-white px-md py-md"
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <View className="mr-md h-12 w-12 items-center justify-center rounded-xl bg-brand-surface">
        <TruckIcon size={18} color={brandColors.primaryDark} />
      </View>
      <View className="flex-1">
        <Typography variant="badge" className="text-[11px] text-brand-heading">
          {shipment.shipmentId}
        </Typography>
        <Typography variant="roleDescription" className="mt-xs">
          {shipment.route}
        </Typography>
        <Typography variant="legal" className="mt-xs text-left">
          ETA {shipment.eta}
        </Typography>
      </View>
      <Typography variant="badge" className={cn('text-[11px]', statusClass[shipment.status])}>
        {shipment.status}
      </Typography>
    </Pressable>
  );
});

export const PricingCard = memo(function PricingCard({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View className="rounded-2xl border border-brand-border bg-brand-white px-md py-md">
      <Typography variant="roleDescription">{label}</Typography>
      <View className="mt-sm flex-row items-center rounded-xl border border-brand-border bg-brand-surface px-md py-sm">
        <Typography variant="roleTitle" className="mr-sm">
          ₹
        </Typography>
        <View className="flex-1">
          <ScrollValueInput value={value} onChange={onChange} />
        </View>
        <Typography variant="roleDescription">/MT</Typography>
      </View>
    </View>
  );
});

const ScrollValueInput = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      keyboardType="numeric"
      className="py-xs text-right font-bold text-[24px] text-brand-heading"
      placeholder="0"
      placeholderTextColor={brandColors.footer}
    />
  );
};

export const TierCard = memo(function TierCard({
  index,
  tier,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  index: number;
  tier: SellerPricingTier;
  onChange: (patch: Partial<SellerPricingTier>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const tierTitle = `Tier ${index + 1}`;
  const rangeLabel = `${tier.minQty || '0'}-${tier.maxQty || '+'} MT`;
  return (
    <View
      className={cn(
        'rounded-2xl border px-md py-md',
        index === 2 ? 'border-transparent bg-brand-navy' : 'border-brand-border bg-brand-white',
      )}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Typography
            variant="roleTitle"
            className={cn(index === 2 && 'text-brand-white')}
          >{`${tierTitle}: ${rangeLabel}`}</Typography>
          <Typography
            variant="headingLeft"
            className={cn('mt-xs text-[22px]', index === 2 ? 'text-brand-white' : 'text-brand-primary')}
          >
            ₹{tier.price || '--'}/MT
          </Typography>
        </View>

        <View className="items-end gap-xs">
          <View
            className={cn(
              'rounded-xl px-sm py-xs',
              index === 0
                ? 'bg-brand-surface'
                : index === 1
                  ? 'bg-brand-primary'
                  : 'bg-brand-success',
            )}
          >
            <Typography variant="roleDescription" className={cn(index !== 0 && 'text-brand-white')}>
              {tier.discountLabel || 'Label'}
            </Typography>
          </View>
          <View className="flex-row gap-xs">
            <Pressable onPress={onMoveUp} className="rounded-lg bg-brand-surface px-sm py-xs">
              <Typography variant="legal">Up</Typography>
            </Pressable>
            <Pressable onPress={onMoveDown} className="rounded-lg bg-brand-surface px-sm py-xs">
              <Typography variant="legal">Down</Typography>
            </Pressable>
            <Pressable onPress={onDelete} className="rounded-lg bg-brand-error-light px-sm py-xs">
              <TrashIcon size={14} color={brandColors.error} />
            </Pressable>
          </View>
        </View>
      </View>

      <View className="mt-md flex-row gap-sm">
        {[
          { label: 'Min Qty', value: tier.minQty, key: 'minQty' },
          { label: 'Max Qty', value: tier.maxQty, key: 'maxQty' },
          { label: 'Price', value: tier.price, key: 'price' },
        ].map((field) => (
          <View key={field.key} className="flex-1">
            <Typography
              variant="fieldLabel"
              className={cn(index === 2 ? 'text-brand-white/80' : 'text-brand-label')}
            >
              {field.label}
            </Typography>
            <View
              className={cn(
                'mt-xs rounded-xl border px-sm',
                index === 2 ? 'border-brand-white/15 bg-brand-white/10' : 'border-brand-border bg-brand-surface',
              )}
            >
              <TextInput
                value={field.value}
                onChangeText={(next: string) => onChange({ [field.key]: next })}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={index === 2 ? '#D6E0EA' : brandColors.footer}
                className={cn(
                  'py-sm font-semibold text-[14px]',
                  index === 2 ? 'text-brand-white' : 'text-brand-heading',
                )}
              />
            </View>
          </View>
        ))}
      </View>

      <View className="mt-md">
        <Typography
          variant="fieldLabel"
          className={cn(index === 2 ? 'text-brand-white/80' : 'text-brand-label')}
        >
          Discount Label
        </Typography>
        <View
          className={cn(
            'mt-xs rounded-xl border px-sm',
            index === 2 ? 'border-brand-white/15 bg-brand-white/10' : 'border-brand-border bg-brand-surface',
          )}
        >
          <TextInput
            value={tier.discountLabel}
            onChangeText={(next: string) => onChange({ discountLabel: next })}
            placeholder="Save ₹3/MT"
            placeholderTextColor={index === 2 ? '#D6E0EA' : brandColors.footer}
            className={cn(
              'py-sm font-semibold text-[14px]',
              index === 2 ? 'text-brand-white' : 'text-brand-heading',
            )}
          />
        </View>
      </View>
    </View>
  );
});

export const BuyerPreviewCard = memo(function BuyerPreviewCard({
  product,
  pricing,
  technicalSpecs,
  tiers,
}: {
  product: SellerProduct['form'];
  pricing: SellerPaymentPricing;
  technicalSpecs: SellerTechnicalSpecs;
  tiers: SellerPricingTier[];
}) {
  const bestPrice = useMemo(() => {
    const tierPrices = tiers
      .map((tier) => Number(tier.price))
      .filter((value) => Number.isFinite(value) && value > 0);
    const sellingPrice = getSellerSellingPrice(pricing);
    const lowest = [...tierPrices, sellingPrice]
      .filter((value) => value > 0)
      .sort((a, b) => a - b)[0];
    return lowest ? `₹${lowest.toLocaleString('en-IN')}/MT` : '₹--/MT';
  }, [pricing, tiers]);

  return (
    <View className="rounded-[28px] border border-dashed border-brand-primary bg-brand-white p-md">
      <Typography variant="caption" className="text-[12px] text-brand-body">
        Buyer Preview
      </Typography>
      <View className="mt-md overflow-hidden rounded-2xl border border-brand-border bg-brand-white">
        <View className="bg-brand-navy px-md py-lg">
          <Typography variant="badge" className="text-[11px] tracking-[1px] text-brand-primary-light">
            {(product.category || 'GRADE').toUpperCase()}
          </Typography>
          <Typography variant="headingLeft" className="mt-xs text-[22px] text-brand-white">
            {product.grade || product.name || 'Select a grade'}
          </Typography>
          <Typography variant="legal" className="mt-xs text-left text-brand-primary-light">
            Same SKU buyers see in the customer app
          </Typography>
        </View>

        <View className="flex-row items-start justify-between px-md py-md">
          <View className="flex-1 pr-md">
            <Typography variant="headingLeft" className="text-[22px]">
              {product.name || 'Marketplace grade'}
            </Typography>
            <Typography variant="roleDescription" className="mt-xs">
              {(product.brand || 'Your brand') +
                ' • ' +
                (product.origin || 'India') +
                ' • ' +
                (product.moq || '—') +
                ' MT MOQ'}
            </Typography>
          </View>
          <View className="items-end">
            <Typography variant="headingLeft" className="text-[26px] text-brand-heading">
              {bestPrice}
            </Typography>
            <Typography variant="badge" className="mt-xs text-brand-success">
              Landed Price
            </Typography>
          </View>
        </View>

        <View className="flex-row border-t border-brand-border">
          <View className="flex-1 px-md py-md">
            <Typography variant="fieldLabel">MFI</Typography>
            <Typography variant="headingLeft" className="mt-xs text-[18px]">
              {technicalSpecs.mfi || '--'}
            </Typography>
          </View>
          <View className="flex-1 border-l border-brand-border px-md py-md">
            <Typography variant="fieldLabel">Density</Typography>
            <Typography variant="headingLeft" className="mt-xs text-[18px]">
              {technicalSpecs.density || '--'}
            </Typography>
          </View>
        </View>
      </View>
    </View>
  );
});

export const SpecificationCard = memo(function SpecificationCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="rounded-2xl border border-brand-border bg-brand-white p-lg">
      <Typography variant="caption" className="text-left text-brand-heading">
        {title}
      </Typography>
      <View className="mt-md">{children}</View>
    </View>
  );
});

export const UploadCard = memo(function UploadCard({
  title,
  fileName,
  onPress,
}: {
  title: string;
  fileName?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-2xl bg-brand-surface px-md py-md"
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View className="mr-md h-11 w-11 items-center justify-center rounded-xl bg-brand-white">
        <BriefcaseIcon size={18} color={brandColors.primaryDark} />
      </View>
      <View className="flex-1">
        <Typography variant="roleTitle">{title}</Typography>
        {fileName ? (
          <Typography variant="legal" className="mt-xs text-left text-brand-success">
            {fileName}
          </Typography>
        ) : null}
      </View>
      <View className="rounded-xl bg-[#DDE8FF] px-md py-sm">
        <Typography variant="roleDescription" className="text-brand-primary-dark">
          Upload
        </Typography>
      </View>
    </Pressable>
  );
});

export const SuccessBanner = memo(function SuccessBanner({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View className="rounded-[28px] bg-brand-success-light px-lg py-lg">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-white">
        <CheckCircleIcon size={28} color={brandColors.success} />
      </View>
      <Typography variant="headingLeft" className="mt-md text-[24px]">
        {title}
      </Typography>
      <Typography variant="subheadingLeft" className="mt-sm">
        {subtitle}
      </Typography>
    </View>
  );
});

export const SellerProductCard = memo(function SellerProductCard({
  product,
  onPress,
  onEdit,
  onDuplicate,
  onDeactivate,
  onDelete,
}: {
  product: SellerProduct;
  onPress: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}) {
  const statusTone =
    product.status === 'published'
      ? 'text-brand-success'
      : product.status === 'inactive'
        ? 'text-brand-error'
        : 'text-brand-primary';

  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-3xl border border-brand-border bg-brand-white"
    >
      <View className="p-lg">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-md">
            <Typography variant="roleTitle" className="text-[18px]">
              {product.form.name}
            </Typography>
            <Typography variant="roleDescription" className="mt-xs">
              {product.form.grade} • Stock {product.form.availableQty} {product.form.unit || 'MT'}
            </Typography>
          </View>
          <MoreVerticalIcon size={18} color={brandColors.body} />
        </View>

        <View className="mt-md flex-row items-center justify-between">
          <View>
            <Typography variant="fieldLabel">MOQ</Typography>
            <Typography variant="roleTitle" className="mt-xs">
              {product.form.moq} {product.form.unit || 'MT'}
            </Typography>
          </View>
          <View>
            <Typography variant="fieldLabel">Price</Typography>
            <Typography variant="roleTitle" className="mt-xs text-brand-primary">
              {formatSellerSellingPrice(product.pricing, product.form.unit || 'MT')}
            </Typography>
          </View>
          <View>
            <Typography variant="fieldLabel">Status</Typography>
            <Typography variant="badge" className={cn('mt-xs text-[11px]', statusTone)}>
              {product.status}
            </Typography>
          </View>
        </View>

        <View className="mt-lg flex-row flex-wrap gap-sm">
          <ActionPill label="Edit" onPress={onEdit} icon={<EditIcon size={14} color={brandColors.primaryDark} />} />
          <ActionPill label="Duplicate" onPress={onDuplicate} icon={<StoreIcon size={14} color={brandColors.primaryDark} />} />
          {product.status !== 'inactive' ? (
            <ActionPill label="Deactivate" onPress={onDeactivate} icon={<AlertCircleIcon size={14} color={brandColors.primaryDark} />} />
          ) : null}
          <ActionPill label="Delete" onPress={onDelete} icon={<TrashIcon size={14} color={brandColors.error} />} danger />
        </View>
      </View>
    </Pressable>
  );
});

const ActionPill = ({
  label,
  onPress,
  icon,
  danger = false,
}: {
  label: string;
  onPress: () => void;
  icon: ReactNode;
  danger?: boolean;
}) => (
  <Pressable
    onPress={(event) => {
      event.stopPropagation();
      onPress();
    }}
    className={cn(
      'flex-row items-center gap-xs rounded-full px-md py-sm',
      danger ? 'bg-brand-error-light' : 'bg-brand-surface',
    )}
  >
    {icon}
    <Typography variant="legal" className={cn('text-left', danger && 'text-brand-error')}>
      {label}
    </Typography>
  </Pressable>
);

export const SellerBottomNavigation = memo(function SellerBottomNavigation({
  active,
  onNavigate,
}: {
  active: SellerBottomNavTarget;
  onNavigate: (target: SellerBottomNavTarget) => void;
}) {
  const items: {
    id: SellerBottomNavTarget;
    label: string;
    renderIcon: (color: string) => ReactNode;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      renderIcon: (color) => <HomeTabIcon size={iconSizes.md} color={color} />,
    },
    {
      id: 'orders',
      label: 'Orders',
      renderIcon: (color) => <OrdersTabIcon size={iconSizes.md} color={color} />,
    },
    {
      id: 'products',
      label: 'Products',
      renderIcon: (color) => <StoreIcon size={iconSizes.md} color={color} />,
    },
    {
      id: 'payouts',
      label: 'Payouts',
      renderIcon: (color) => <WalletIcon size={iconSizes.md} color={color} />,
    },
    {
      id: 'profile',
      label: 'Profile',
      renderIcon: (color) => <ProfileIcon size={iconSizes.md} color={color} />,
    },
  ];

  return (
    <View
      className="flex-row rounded-t-[28px] border-t border-brand-border bg-brand-white px-md pb-lg pt-md"
      style={elevation.sm}
    >
      {items.map((item) => {
        const selected = item.id === active;
        const color = selected ? brandColors.navy : brandColors.footer;
        return (
          <Pressable
            key={item.id}
            onPress={() => onNavigate(item.id)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected }}
            className="flex-1 items-center justify-center"
          >
            <View className={cn('rounded-full px-md py-xs', selected && 'bg-brand-primary-light')}>
              {item.renderIcon(color)}
            </View>
            <Typography
              variant="legal"
              className={cn(
                'mt-xs text-center',
                selected ? 'text-brand-navy' : 'text-brand-footer',
              )}
            >
              {item.label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
});

export const SectionHeader = memo(function SectionHeader({
  title,
  actionLabel,
  onActionPress,
}: {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Typography variant="headingLeft" className="text-[24px]">
        {title}
      </Typography>
      {actionLabel ? (
        <Pressable onPress={onActionPress}>
          <Typography variant="link">{actionLabel}</Typography>
        </Pressable>
      ) : null}
    </View>
  );
});
