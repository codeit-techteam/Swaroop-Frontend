import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  fetchSellerShipment,
  fetchSellerShipments,
  type SellerShipmentRecord,
} from '@/services/seller-shipments';
import type {
  ActiveShipment,
  ShipmentAnalytics,
  ShipmentDashboardPreview,
  ShipmentFilterTab,
  ShipmentLiveStatus,
} from '@/seller/types/shipments';

const mapStatus = (status: string): { live: ShipmentLiveStatus; filter: ShipmentFilterTab } => {
  const key = status.toUpperCase();
  if (key.includes('DELIVER')) {
    return { live: 'STABLE', filter: 'delivered' };
  }
  if (key.includes('DELAY') || key.includes('EXCEPTION')) {
    return { live: 'DELAYED', filter: 'delayed' };
  }
  return { live: 'LIVE', filter: 'in_transit' };
};

const mapShipment = (item: SellerShipmentRecord): ActiveShipment => {
  const mapped = mapStatus(item.status);
  const etaDate = new Date(item.eta);
  const etaLabel = Number.isNaN(etaDate.getTime())
    ? item.eta
    : etaDate.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });

  return {
    id: item.id,
    orderId: item.purchaseOrderReference || item.orderId,
    buyer: item.buyerLabel,
    vehicle: item.vehicleNumber,
    driver: '—',
    destination: item.destination,
    warehouse: item.origin,
    status: mapped.live,
    filterStatus: mapped.filter,
    eta: item.eta,
    etaLabel,
    progress: mapped.filter === 'delivered' ? 100 : mapped.filter === 'delayed' ? 55 : 70,
    dispatchDate: item.createdAt,
    route: item.route || `${item.origin} → ${item.destination}`,
    timeline: [
      {
        id: `${item.id}-created`,
        label: 'Shipment created',
        timestamp: item.createdAt,
        status: 'completed',
      },
      {
        id: `${item.id}-current`,
        label: mapped.filter === 'delivered' ? 'Delivered' : 'In transit',
        timestamp: item.updatedAt,
        status: mapped.filter === 'delivered' ? 'completed' : 'current',
      },
    ],
    documents: [],
    driverPhone: '',
  };
};

const buildAnalytics = (shipments: ActiveShipment[]): ShipmentAnalytics => {
  const active = shipments.filter((s) => s.filterStatus === 'in_transit').length;
  const delayed = shipments.filter((s) => s.filterStatus === 'delayed').length;
  return {
    totalActive: String(active),
    onSchedule: String(Math.max(0, active - delayed)),
    criticalEta: String(delayed),
    averageSpeed: '—',
  };
};

const buildPreviews = (shipments: ActiveShipment[]): ShipmentDashboardPreview[] =>
  shipments.slice(0, 4).map((shipment) => ({
    id: shipment.id,
    shipmentId: shipment.orderId,
    route: shipment.route,
    status:
      shipment.filterStatus === 'delayed'
        ? 'Delayed'
        : shipment.filterStatus === 'delivered'
          ? 'On Time'
          : 'In Transit',
    eta: shipment.etaLabel,
  }));

export function useSellerShipments(selectedTab: ShipmentFilterTab = 'in_transit') {
  const [shipments, setShipments] = useState<ActiveShipment[]>([]);
  const [analytics, setAnalytics] = useState<ShipmentAnalytics>({
    totalActive: '0',
    onSchedule: '0',
    criticalEta: '0',
    averageSpeed: '—',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    const rows = await fetchSellerShipments();
    const mapped = rows.map(mapShipment);
    setShipments(mapped);
    setAnalytics(buildAnalytics(mapped));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void load()
      .catch(() => {
        if (!cancelled) {
          setShipments([]);
          setAnalytics({
            totalActive: '0',
            onSchedule: '0',
            criticalEta: '0',
            averageSpeed: '—',
          });
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const filteredShipments = useMemo(
    () => shipments.filter((shipment) => shipment.filterStatus === selectedTab),
    [selectedTab, shipments],
  );

  const dashboardPreviews = useMemo(() => buildPreviews(shipments), [shipments]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await load();
    } finally {
      setIsRefreshing(false);
    }
  }, [load]);

  const getShipmentById = useCallback(
    (shipmentId: string) => {
      const local = shipments.find(
        (shipment) => shipment.id === shipmentId || shipment.orderId === shipmentId,
      );
      return local;
    },
    [shipments],
  );

  const loadShipmentById = useCallback(async (shipmentId: string) => {
    const remote = await fetchSellerShipment(shipmentId);
    return mapShipment(remote);
  }, []);

  return {
    shipments,
    filteredShipments,
    analytics,
    dashboardPreviews,
    isLoading,
    isRefreshing,
    refresh,
    getShipmentById,
    loadShipmentById,
  };
}

export type UseSellerShipmentsReturn = ReturnType<typeof useSellerShipments>;
