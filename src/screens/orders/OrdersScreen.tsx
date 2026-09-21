import { memo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  OrderCard,
  OrderFilterSheet,
  OrderTabs,
  OrdersAppHeader,
  ShipmentSummaryCard,
} from '@/components/orders';
import { PrimaryButton, Typography } from '@/components/ui';
import { OrdersListSkeleton } from '@/components/ui/skeleton';
import { TAB_BAR_HEIGHT } from '@/constants/dashboard';
import { useOrders } from '@/hooks/useOrders';
import { FilterIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

export const OrdersScreen = memo(function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const {
    regularOrders,
    masterShipmentOrder,
    selectedTab,
    filters,
    emptyStateTitle,
    showBrowseMarketplace,
    isHydrated,
    setSelectedTab,
    filterSheetRef,
    handleOpenFilters,
    handleApplyFilters,
    handleResetFilters,
    handleFiltersChange,
    handleTrackOrder,
    handleViewDetails,
    handlePayNow,
    handleExpandMasterShipment,
    handleSearchPress,
    handleProfilePress,
    handleLocationPress,
    handleBrowseMarketplace,
  } = useOrders();

  const hasOrders = regularOrders.length > 0 || masterShipmentOrder !== null;

  return (
    <View className="flex-1 bg-brand-background">
      <OrdersAppHeader
        onLocationPress={handleLocationPress}
        onSearchPress={handleSearchPress}
        onProfilePress={handleProfilePress}
      />

      {!isHydrated ? (
        <OrdersListSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 24,
          }}
        >
          <Typography variant="headingLeft" className="text-[26px] text-brand-heading">
            Orders
          </Typography>
          <Typography variant="subheadingLeft" className="mt-xs text-[14px] text-brand-body">
            Manage your material procurement and logistics.
          </Typography>

          <Pressable
            onPress={handleOpenFilters}
            accessibilityRole="button"
            accessibilityLabel="Filter orders"
            className="mt-lg flex-row items-center gap-sm self-start rounded-full border border-brand-border bg-brand-white px-lg py-sm"
          >
            <FilterIcon size={iconSizes.sm} color={brandColors.body} />
            <Typography variant="roleTitle" className="text-[14px] text-brand-body">
              Filter
            </Typography>
          </Pressable>

          <OrderTabs selectedTab={selectedTab} onTabChange={setSelectedTab} className="mt-lg" />

          {hasOrders ? (
            <View className="mt-lg gap-lg">
              {regularOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onTrackOrder={handleTrackOrder}
                  onViewDetails={handleViewDetails}
                  onPayNow={handlePayNow}
                />
              ))}

              {masterShipmentOrder ? (
                <ShipmentSummaryCard
                  order={masterShipmentOrder}
                  onExpand={handleExpandMasterShipment}
                />
              ) : null}
            </View>
          ) : (
            <View className="mt-2xl items-center rounded-2xl border border-brand-border bg-brand-white px-lg py-2xl">
              <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
                {emptyStateTitle}
              </Typography>
              {showBrowseMarketplace ? (
                <>
                  <Typography variant="roleDescription" className="mt-sm text-center text-[13px] text-brand-body">
                    Your purchase requests and confirmed orders will appear here.
                  </Typography>
                  <PrimaryButton
                    label="Browse Marketplace"
                    onPress={handleBrowseMarketplace}
                    className="mt-lg"
                  />
                </>
              ) : null}
            </View>
          )}
        </ScrollView>
      )}

      <OrderFilterSheet
        ref={filterSheetRef}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </View>
  );
});
