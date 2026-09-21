import { memo, useId, useMemo, type ReactNode } from 'react';

import { Pressable, View } from 'react-native';

import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { AppLogo, Typography } from '@/components';
import {
  BarChartIcon,
  BellIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  CurrencyIcon,
  OrdersTabIcon,
  SearchIcon,
  StoreIcon,
  TruckIcon,
  WalletIcon,
} from '@/icons';
import type { SellerShipment, SellerShipmentStatus, SellerStat } from '@/seller/types';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

const pressableStyle =
  (shadow?: object) =>
  ({ pressed }: { pressed: boolean }) => [
    shadow,
    {
      opacity: pressed ? 0.92 : 1,
      transform: [{ scale: pressed ? 0.985 : 1 }],
    },
  ];

export const SellerHomeHeader = memo(function SellerHomeHeader({
  sellerName,
  initials,
  unreadCount = 0,
  onNotificationPress,
}: {
  sellerName: string;
  initials: string;
  unreadCount?: number;
  onNotificationPress?: () => void;
}) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }).format(new Date()),
    [],
  );

  return (
    <View className="flex-row items-start justify-between">
      <View className="flex-1 pr-md">
        <AppLogo />
        <Typography variant="legal" className="mt-md text-left text-[12px] text-brand-body">
          {greeting}
        </Typography>
        <Typography
          variant="headingLeft"
          className="mt-xs text-[28px] leading-[34px]"
          numberOfLines={1}
        >
          {sellerName}
        </Typography>
        <Typography variant="badge" className="mt-xs text-[11px] text-brand-footer">
          {dateLabel}
        </Typography>
      </View>

      <View className="flex-row items-center gap-sm">
        <Pressable
          onPress={onNotificationPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={
            unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
          }
          className="relative h-11 w-11 items-center justify-center rounded-2xl border border-brand-border bg-brand-white"
          style={pressableStyle()}
        >
          <BellIcon size={iconSizes.lg} color={brandColors.heading} />
          {unreadCount > 0 ? (
            <View className="absolute -right-0.5 -top-0.5 min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-brand-error px-[4px]">
              <Typography variant="badge" className="text-[9px] text-brand-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Typography>
            </View>
          ) : null}
        </Pressable>

        <View
          className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-navy"
          accessibilityLabel={`${sellerName} account`}
        >
          <Typography variant="badge" className="text-[12px] text-brand-white">
            {(initials || 'PT').slice(0, 2).toUpperCase()}
          </Typography>
        </View>
      </View>
    </View>
  );
});

export const DashboardSearchButton = memo(function DashboardSearchButton({
  onPress,
}: {
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Search products, orders, and offers"
      className="mt-lg flex-row items-center rounded-2xl border border-brand-border bg-brand-white px-md py-[14px]"
      style={pressableStyle(elevation.sm)}
    >
      <View className="h-8 w-8 items-center justify-center rounded-xl bg-brand-primary-tint">
        <SearchIcon size={16} color={brandColors.primaryDark} />
      </View>
      <Typography variant="subheading" className="ml-sm flex-1 text-left text-brand-footer">
        Search products, orders, offers...
      </Typography>
      <ChevronRightIcon size={14} color={brandColors.footer} />
    </Pressable>
  );
});

const Sparkline = memo(function Sparkline({
  values,
  width = 118,
  height = 46,
  color = '#FFFFFF',
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const gradientId = useId().replace(/:/g, '');
  const { linePath, areaPath, lastPoint } = useMemo(() => {
    if (values.length < 2) {
      return { linePath: '', areaPath: '', lastPoint: null as { x: number; y: number } | null };
    }

    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const pad = 3;
    const stepX = (width - pad * 2) / (values.length - 1);
    const points = values.map((value, index) => ({
      x: pad + index * stepX,
      y: height - pad - ((value - min) / range) * (height - pad * 2),
    }));
    const line = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');
    const last = points[points.length - 1];
    return {
      linePath: line,
      areaPath: `${line} L ${last.x} ${height} L ${points[0].x} ${height} Z`,
      lastPoint: last,
    };
  }, [height, values, width]);

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.32" />
          <Stop offset="1" stopColor={color} stopOpacity="0.02" />
        </LinearGradient>
      </Defs>
      {areaPath ? <Path d={areaPath} fill={`url(#${gradientId})`} /> : null}
      {linePath ? (
        <Path d={linePath} stroke={color} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      ) : null}
      {lastPoint ? <Circle cx={lastPoint.x} cy={lastPoint.y} r={3.2} fill={color} /> : null}
    </Svg>
  );
});

export const RevenueHeroCard = memo(function RevenueHeroCard({
  revenueToday,
  revenueDelta,
  monthlyRevenue,
  sparklineValues,
  onPress,
}: {
  revenueToday: string;
  revenueDelta: string;
  monthlyRevenue: string;
  sparklineValues: number[];
  onPress: () => void;
}) {
  const isPositive = revenueDelta.trim().startsWith('+');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Today's revenue ${revenueToday}, ${revenueDelta} versus yesterday`}
      className="mt-lg overflow-hidden rounded-[28px] bg-brand-navy px-lg py-lg"
      style={pressableStyle(elevation.md)}
    >
      <View className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10" />
      <View className="absolute -bottom-10 right-16 h-24 w-24 rounded-full bg-white/5" />

      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-sm">
          <Typography variant="caption" className="text-left text-[11px] text-brand-white/70">
            Today&apos;s Revenue
          </Typography>
          <Typography
            variant="headingLeft"
            className="mt-sm text-[36px] leading-[42px] text-brand-white"
          >
            {revenueToday}
          </Typography>
          <View
            className={cn(
              'mt-sm self-start rounded-full px-sm py-xs',
              isPositive ? 'bg-brand-success-light' : 'bg-brand-error-light',
            )}
          >
            <Typography
              variant="badge"
              className={cn('text-[10px]', isPositive ? 'text-brand-success' : 'text-brand-error')}
            >
              {revenueDelta} vs yesterday
            </Typography>
          </View>
        </View>
        <Sparkline values={sparklineValues} />
      </View>

      <View className="mt-lg flex-row items-center justify-between border-t border-white/10 pt-md">
        <View>
          <Typography variant="legal" className="text-left text-[11px] text-brand-white/60">
            This month
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[15px] text-brand-white">
            {monthlyRevenue}
          </Typography>
        </View>
        <View className="flex-row items-center rounded-full bg-white/10 px-md py-sm">
          <Typography variant="badge" className="text-[11px] text-brand-white">
            View analytics
          </Typography>
          <ChevronRightIcon size={14} color={brandColors.white} />
        </View>
      </View>
    </Pressable>
  );
});

const QUICK_ACTIONS: {
  id: string;
  label: string;
  icon: ReactNode;
}[] = [
  {
    id: 'add',
    label: 'Add Product',
    icon: <StoreIcon size={18} color={brandColors.primaryDark} />,
  },
  {
    id: 'stock',
    label: 'Update Stock',
    icon: <ClipboardCheckIcon size={18} color={brandColors.primaryDark} />,
  },
  {
    id: 'offers',
    label: 'My Offers',
    icon: <CurrencyIcon size={18} color={brandColors.primaryDark} />,
  },
  {
    id: 'dispatch',
    label: 'Dispatch',
    icon: <TruckIcon size={18} color={brandColors.primaryDark} />,
  },
];

export const DashboardQuickActions = memo(function DashboardQuickActions({
  onPress,
}: {
  onPress: (id: 'add' | 'stock' | 'offers' | 'dispatch') => void;
}) {
  return (
    <View className="mt-lg">
      <Typography variant="roleTitle" className="mb-sm text-[15px]">
        Quick actions
      </Typography>
      <View className="flex-row gap-sm">
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.id}
            onPress={() => onPress(action.id as 'add' | 'stock' | 'offers' | 'dispatch')}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            className="min-h-[92px] flex-1 items-center rounded-2xl border border-brand-border bg-brand-white px-xs py-md"
            style={pressableStyle(elevation.sm)}
          >
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary-light">
              {action.icon}
            </View>
            <Typography
              variant="badge"
              className="mt-sm text-center text-[11px] leading-[14px] text-brand-heading"
            >
              {action.label}
            </Typography>
          </Pressable>
        ))}
      </View>
    </View>
  );
});

const STAT_META: Record<string, { tint: string; color: string; icon: ReactNode; hint?: string }> = {
  'new-orders': {
    tint: 'bg-brand-primary-light',
    color: brandColors.primaryDark,
    icon: <OrdersTabIcon size={16} color={brandColors.primaryDark} />,
    hint: 'Review',
  },
  'pending-accept': {
    tint: 'bg-[#FEF3E8]',
    color: '#B45309',
    icon: <ClipboardCheckIcon size={16} color="#B45309" />,
    hint: 'Action',
  },
  'active-offers': {
    tint: 'bg-brand-success-light',
    color: brandColors.success,
    icon: <CurrencyIcon size={16} color={brandColors.success} />,
  },
  dispatched: {
    tint: 'bg-brand-primary-tint',
    color: brandColors.navy,
    icon: <TruckIcon size={16} color={brandColors.navy} />,
  },
};

export const AttentionStatsGrid = memo(function AttentionStatsGrid({
  stats,
  onPress,
}: {
  stats: SellerStat[];
  onPress: (statId: string) => void;
}) {
  const rows = [stats.slice(0, 2), stats.slice(2, 4)];

  return (
    <View className="mt-lg">
      <Typography variant="roleTitle" className="mb-sm text-[15px]">
        Today&apos;s activity
      </Typography>
      <View className="gap-sm">
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row gap-sm">
            {row.map((stat) => {
              const meta = STAT_META[stat.id] ?? STAT_META['new-orders'];
              return (
                <Pressable
                  key={stat.id}
                  onPress={() => onPress(stat.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${stat.label} ${stat.value}`}
                  className="min-h-[96px] flex-1 rounded-2xl border border-brand-border bg-brand-white px-md py-md"
                  style={pressableStyle(elevation.sm)}
                >
                  <View className="flex-row items-center justify-between">
                    <View
                      className={cn('h-8 w-8 items-center justify-center rounded-xl', meta.tint)}
                    >
                      {meta.icon}
                    </View>
                    {meta.hint && stat.value > 0 ? (
                      <View className={cn('rounded-full px-sm py-xs', meta.tint)}>
                        <Typography
                          variant="badge"
                          className="text-[9px]"
                          style={{ color: meta.color }}
                        >
                          {meta.hint}
                        </Typography>
                      </View>
                    ) : null}
                  </View>
                  <Typography variant="headingLeft" className="mt-sm text-[28px] leading-[32px]">
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="legal"
                    className="mt-xs text-left text-[11px] text-brand-body"
                  >
                    {stat.label}
                  </Typography>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
});

export const SettlementSummaryCard = memo(function SettlementSummaryCard({
  pendingAmount,
  nextReleaseLabel,
  releasedToday,
  onPress,
}: {
  pendingAmount: string;
  nextReleaseLabel: string;
  releasedToday: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Pending settlement ${pendingAmount}, next release ${nextReleaseLabel}`}
      className="mt-lg rounded-[24px] border border-brand-border bg-brand-white px-lg py-lg"
      style={pressableStyle(elevation.sm)}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-sm">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary-light">
            <WalletIcon size={18} color={brandColors.navy} />
          </View>
          <View>
            <Typography variant="caption" className="text-left text-[11px]">
              Settlement
            </Typography>
            <Typography variant="legal" className="text-left text-brand-body">
              Pending payout
            </Typography>
          </View>
        </View>
        <View className="flex-row items-center">
          <Typography variant="link" className="mr-xs text-[12px]">
            Details
          </Typography>
          <ChevronRightIcon size={14} color={brandColors.link} />
        </View>
      </View>

      <Typography variant="headingLeft" className="mt-md text-[30px] text-brand-heading">
        {pendingAmount}
      </Typography>

      <View className="mt-md flex-row gap-sm">
        <View className="flex-1 rounded-2xl bg-brand-surface px-md py-sm">
          <Typography variant="legal" className="text-left text-[10px] uppercase tracking-wide">
            Next release
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[13px]">
            {nextReleaseLabel}
          </Typography>
        </View>
        <View className="flex-1 rounded-2xl bg-brand-surface px-md py-sm">
          <Typography variant="legal" className="text-left text-[10px] uppercase tracking-wide">
            Released today
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[13px]">
            {releasedToday}
          </Typography>
        </View>
      </View>
    </Pressable>
  );
});

export const AnalyticsPreviewCard = memo(function AnalyticsPreviewCard({
  completedOrders,
  inventoryValue,
  liveShipments,
  onPress,
}: {
  completedOrders: number;
  inventoryValue: string;
  liveShipments: number;
  onPress: () => void;
}) {
  const items = [
    { label: 'Orders done', value: String(completedOrders) },
    { label: 'Inventory', value: inventoryValue },
    { label: 'Live loads', value: String(liveShipments) },
  ];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open analytics dashboard"
      className="mt-lg rounded-[24px] border border-brand-border bg-brand-white px-lg py-lg"
      style={pressableStyle(elevation.sm)}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-sm">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary-light">
            <BarChartIcon size={18} color={brandColors.primaryDark} />
          </View>
          <View>
            <Typography variant="caption" className="text-left text-[11px]">
              Insights
            </Typography>
            <Typography variant="roleTitle" className="text-[16px]">
              Business snapshot
            </Typography>
          </View>
        </View>
        <View className="flex-row items-center rounded-full bg-brand-primary-tint px-md py-sm">
          <Typography variant="badge" className="text-[11px] text-brand-primary-dark">
            Open
          </Typography>
          <ChevronRightIcon size={14} color={brandColors.primaryDark} />
        </View>
      </View>

      <View className="mt-md flex-row gap-sm">
        {items.map((item) => (
          <View key={item.label} className="flex-1 rounded-2xl bg-brand-surface px-sm py-sm">
            <Typography variant="legal" className="text-center text-[10px] uppercase">
              {item.label}
            </Typography>
            <Typography variant="roleTitle" className="mt-xs text-center text-[15px]">
              {item.value}
            </Typography>
          </View>
        ))}
      </View>
    </Pressable>
  );
});

const SHIPMENT_STATUS: Record<
  SellerShipmentStatus,
  { container: string; text: string; dot: string }
> = {
  'On Time': {
    container: 'bg-brand-success-light',
    text: 'text-brand-success',
    dot: 'bg-brand-success',
  },
  'In Transit': {
    container: 'bg-[#FEF3E8]',
    text: 'text-[#B45309]',
    dot: 'bg-[#D97706]',
  },
  Delayed: {
    container: 'bg-brand-error-light',
    text: 'text-brand-error',
    dot: 'bg-brand-error',
  },
};

export const DashboardShipmentCard = memo(function DashboardShipmentCard({
  shipment,
  onPress,
}: {
  shipment: SellerShipment;
  onPress: () => void;
}) {
  const status = SHIPMENT_STATUS[shipment.status];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${shipment.shipmentId}, ${shipment.route}, ${shipment.status}`}
      className="flex-row items-center rounded-2xl border border-brand-border bg-brand-white px-md py-md"
      style={pressableStyle(elevation.sm)}
    >
      <View className="mr-md h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary-tint">
        <TruckIcon size={18} color={brandColors.navy} />
      </View>
      <View className="flex-1">
        <Typography variant="badge" className="text-[11px] text-brand-heading">
          {shipment.shipmentId}
        </Typography>
        <Typography variant="roleTitle" className="mt-xs text-[14px]">
          {shipment.route}
        </Typography>
        <Typography variant="legal" className="mt-xs text-left text-brand-body">
          ETA {shipment.eta}
        </Typography>
      </View>
      <View
        className={cn(
          'ml-sm shrink-0 flex-row items-center rounded-full px-sm py-xs',
          status.container,
        )}
      >
        <View className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', status.dot)} />
        <Typography variant="badge" className={cn('text-[10px]', status.text)}>
          {shipment.status}
        </Typography>
      </View>
    </Pressable>
  );
});

export const OverdueBanner = memo(function OverdueBanner({
  overdueCount,
  pendingSettlement,
  onPress,
}: {
  overdueCount: number;
  pendingSettlement: string;
  onPress: () => void;
}) {
  if (overdueCount <= 0) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${overdueCount} overdue settlements`}
      className="mt-lg flex-row items-center rounded-2xl border border-[#F5D0A9] bg-[#FFF7ED] px-md py-md"
      style={pressableStyle()}
    >
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#FED7AA]">
        <WalletIcon size={16} color="#B45309" />
      </View>
      <View className="ml-sm flex-1">
        <Typography variant="roleTitle" className="text-[13px] text-[#9A3412]">
          {overdueCount} overdue settlements
        </Typography>
        <Typography variant="legal" className="text-left text-[#B45309]">
          {pendingSettlement} awaiting PetroTrade payout
        </Typography>
      </View>
      <ChevronRightIcon size={14} color="#B45309" />
    </Pressable>
  );
});
