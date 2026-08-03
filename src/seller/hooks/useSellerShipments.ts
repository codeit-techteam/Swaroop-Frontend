import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  filterShipmentsByTab,
  getActiveShipments,
  getDashboardShipmentPreviews,
  getShipmentAnalytics,
  getShipmentById,
  refreshSellerShipments,
} from '@/seller/services/sellerMockService';
import type {
  ActiveShipment,
  ShipmentAnalytics,
  ShipmentDashboardPreview,
  ShipmentFilterTab,
} from '@/seller/types/shipments';

export function useSellerShipments(selectedTab: ShipmentFilterTab = 'in_transit') {
  const [shipments, setShipments] = useState<ActiveShipment[]>(getActiveShipments);
  const [analytics] = useState<ShipmentAnalytics>(getShipmentAnalytics);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const filteredShipments = useMemo(
    () => filterShipmentsByTab(shipments, selectedTab),
    [selectedTab, shipments],
  );

  const dashboardPreviews = useMemo<ShipmentDashboardPreview[]>(
    () => getDashboardShipmentPreviews(),
    [shipments],
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    const nextShipments = await refreshSellerShipments();
    setShipments(nextShipments);
    setIsRefreshing(false);
  }, []);

  return {
    shipments,
    filteredShipments,
    analytics,
    dashboardPreviews,
    isLoading,
    isRefreshing,
    refresh,
    getShipmentById: (shipmentId: string) => getShipmentById(shipmentId),
  };
}

export type UseSellerShipmentsReturn = ReturnType<typeof useSellerShipments>;
