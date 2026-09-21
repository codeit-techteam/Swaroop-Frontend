import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { type Href, useRouter } from 'expo-router';

import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';

import {
  DEFAULT_ORDER_FILTERS,
  type OrderFilterState,
} from '@/components/orders/OrderFilterSheet';
import {
  deriveOrderDisplayStatus,
  getOrderTabCategory,
  isWithinDateFilter,
} from '@/constants/orderStatus';
import { isCreditPaymentFlow } from '@/constants/creditWorkflow';
import { getScreenRouteForOrder, getTrackRouteForOrder } from '@/constants/orderWorkflow';
import { ROUTES } from '@/navigation/routes';
import {
  selectOrderHydrated,
  selectOrders,
  useOrderStore,
} from '@/store/order-store';
import type { Order, OrderTabCategory } from '@/types/order';

type UseOrdersResult = {
  regularOrders: Order[];
  masterShipmentOrder: Order | null;
  selectedTab: OrderTabCategory;
  filters: OrderFilterState;
  emptyStateTitle: string;
  showBrowseMarketplace: boolean;
  isHydrated: boolean;
  setSelectedTab: (tab: OrderTabCategory) => void;
  filterSheetRef: React.RefObject<BottomSheetModal | null>;
  handleOpenFilters: () => void;
  handleApplyFilters: () => void;
  handleResetFilters: () => void;
  handleFiltersChange: (filters: OrderFilterState) => void;
  handleTrackOrder: (order: Order) => void;
  handleViewDetails: (order: Order) => void;
  handlePayNow: (order: Order) => void;
  handleExpandMasterShipment: (order: Order) => void;
  handleProfilePress: () => void;
  handleLocationPress: () => void;
  handleBrowseMarketplace: () => void;
};

const EMPTY_STATE_COPY: Record<OrderTabCategory, { title: string; showBrowse: boolean }> = {
  active: { title: 'No orders yet', showBrowse: true },
  completed: { title: 'No Completed Orders', showBrowse: false },
  cancelled: { title: 'No Cancelled Orders', showBrowse: false },
};

export const useOrders = (): UseOrdersResult => {
  const router = useRouter();
  const filterSheetRef = useRef<BottomSheetModal>(null);

  const orders = useOrderStore(selectOrders);
  const isHydrated = useOrderStore(selectOrderHydrated);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);
  const setSelectedOrderId = useOrderStore((state) => state.setSelectedOrderId);
  const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);

  const [selectedTab, setSelectedTab] = useState<OrderTabCategory>('active');
  const [filters, setFilters] = useState<OrderFilterState>(DEFAULT_ORDER_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<OrderFilterState>(DEFAULT_ORDER_FILTERS);

  useEffect(() => {
    if (!isHydrated) {
      hydrateOrder();
    }
  }, [hydrateOrder, isHydrated]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const tabCategory = getOrderTabCategory(order);
      if (tabCategory !== selectedTab) {
        return false;
      }

      if (appliedFilters.status) {
        const displayStatus = deriveOrderDisplayStatus(order);
        if (displayStatus !== appliedFilters.status) {
          return false;
        }
      }

      if (appliedFilters.product && order.productCategory !== appliedFilters.product) {
        return false;
      }

      if (appliedFilters.date && !isWithinDateFilter(order.createdAt, appliedFilters.date)) {
        return false;
      }

      return true;
    });
  }, [appliedFilters, orders, selectedTab]);

  const masterShipmentOrder = useMemo(() => {
    return (
      orders.find(
        (order) => order.isMasterShipment && getOrderTabCategory(order) === selectedTab,
      ) ?? null
    );
  }, [orders, selectedTab]);

  const regularOrders = useMemo(() => {
    return filteredOrders.filter((order) => !order.isMasterShipment);
  }, [filteredOrders]);

  const handleOpenFilters = useCallback(() => {
    filterSheetRef.current?.present();
  }, []);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(filters);
    filterSheetRef.current?.dismiss();
  }, [filters]);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_ORDER_FILTERS);
    setAppliedFilters(DEFAULT_ORDER_FILTERS);
    filterSheetRef.current?.dismiss();
  }, []);

  const handleFiltersChange = useCallback((nextFilters: OrderFilterState) => {
    setFilters(nextFilters);
  }, []);

  const handleTrackOrder = useCallback(
    (order: Order) => {
      setSelectedOrderId(order.id);
      router.push(getTrackRouteForOrder(order));
    },
    [router, setSelectedOrderId],
  );

  const handleViewDetails = useCallback(
    (order: Order) => {
      setSelectedOrderId(order.id);
      router.push(getScreenRouteForOrder(order));
    },
    [router, setSelectedOrderId],
  );

  const handlePayNow = useCallback(
    (order: Order) => {
      setSelectedOrderId(order.id);
      setCurrentOrder(order);
      if (isCreditPaymentFlow(order)) {
        router.push(getScreenRouteForOrder(order));
        return;
      }
      router.push(ROUTES.CUSTOMER.PAYMENT_REMINDER as Href);
    },
    [router, setCurrentOrder, setSelectedOrderId],
  );

  const handleExpandMasterShipment = useCallback((order: Order) => {
    Toast.show({
      type: 'info',
      text1: 'Master Shipment',
      text2: `Expanded view for ${order.productName} will be available after backend integration.`,
      visibilityTime: 2500,
    });
  }, []);

  const handleProfilePress = useCallback(() => {
    router.push(ROUTES.CUSTOMER.PROFILE as Href);
  }, [router]);

  const handleLocationPress = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Delivery Location',
      text2: 'Update your delivery location from the Home screen.',
      visibilityTime: 2000,
    });
  }, []);

  const handleBrowseMarketplace = useCallback(() => {
    router.push(ROUTES.CUSTOMER.MARKET as Href);
  }, [router]);

  const emptyCopy = EMPTY_STATE_COPY[selectedTab];

  return {
    regularOrders,
    masterShipmentOrder,
    selectedTab,
    filters,
    emptyStateTitle: emptyCopy.title,
    showBrowseMarketplace: emptyCopy.showBrowse,
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
    handleProfilePress,
    handleLocationPress,
    handleBrowseMarketplace,
  };
};
