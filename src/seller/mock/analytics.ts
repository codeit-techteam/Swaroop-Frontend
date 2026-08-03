import type { SellerAnalyticsSnapshot } from '@/seller/types/analytics';

export const SELLER_ANALYTICS_SEED: SellerAnalyticsSnapshot = {
  revenue: {
    today: '₹24.5L',
    monthly: '₹3.8Cr',
    filters: {
      '7d': [18.2, 19.5, 21.0, 20.4, 22.8, 23.6, 24.5],
      '30d': [12, 14, 13, 16, 18, 17, 19, 21, 20, 22, 24, 23, 25, 26, 24, 27, 28, 26, 29, 30, 28, 31, 32, 30, 33, 34, 32, 35, 36, 38],
      '3m': [2.1, 2.4, 2.8, 3.0, 3.2, 3.5, 3.8, 3.6, 3.9, 4.1, 3.8, 4.2],
      '1y': [1.8, 2.0, 2.2, 2.5, 2.8, 3.0, 3.2, 3.5, 3.8, 4.0, 4.2, 4.5],
    },
  },
  orders: {
    completed: 124,
    breakdown: [
      { id: 'pending', label: 'Pending', count: 18, percentage: 12 },
      { id: 'accepted', label: 'Accepted', count: 32, percentage: 22 },
      { id: 'dispatch', label: 'Dispatch', count: 24, percentage: 16 },
      { id: 'delivered', label: 'Delivered', count: 124, percentage: 84 },
      { id: 'cancelled', label: 'Cancelled', count: 6, percentage: 4 },
    ],
  },
  products: {
    active: 42,
    topSelling: [
      {
        id: 'prod-hdpe',
        name: 'HDPE PE100',
        orders: 48,
        revenue: '₹1.2Cr',
        growthPercent: 12.4,
      },
      {
        id: 'prod-pp',
        name: 'PP H110MA',
        orders: 36,
        revenue: '₹86L',
        growthPercent: 8.2,
      },
    ],
  },
  inventory: {
    value: '₹5.2Cr',
    offersLive: 18,
    conversionRate: '5.4%',
    customerRating: '98.4%',
  },
  settlement: {
    pending: '₹42.5L',
    released: '₹2.8Cr',
    tds: '₹8.4L',
    platformFees: '₹12.6L',
    netEarnings: '₹2.6Cr',
  },
  warehouses: [
    {
      id: 'wh-hazira',
      name: 'Hazira',
      availableStock: '1,240 MT',
      reserved: '180 MT',
      capacityPercent: 72,
    },
    {
      id: 'wh-jamnagar',
      name: 'Jamnagar',
      availableStock: '860 MT',
      reserved: '95 MT',
      capacityPercent: 58,
    },
  ],
  shipments: {
    live: 14,
    delayed: 3,
    delivered: 87,
    averageEta: '18h 30m',
    averageTransitTime: '22h 15m',
  },
  activities: [
    {
      id: 'act-1',
      title: 'Offer Created',
      subtitle: 'HDPE PE100 bulk offer submitted',
      timestamp: 'Today, 09:15 AM',
      type: 'offer',
    },
    {
      id: 'act-2',
      title: 'Inventory Updated',
      subtitle: 'Hazira warehouse stock adjusted +120 MT',
      timestamp: 'Today, 08:40 AM',
      type: 'inventory',
    },
    {
      id: 'act-3',
      title: 'New Order',
      subtitle: 'Order #ORD-9012 received from Nayara Energy',
      timestamp: 'Yesterday, 06:20 PM',
      type: 'order',
    },
    {
      id: 'act-4',
      title: 'Dispatch Started',
      subtitle: 'Vehicle GJ-06-BX-4582 departed JNPT',
      timestamp: 'Yesterday, 04:10 PM',
      type: 'dispatch',
    },
    {
      id: 'act-5',
      title: 'Settlement Released',
      subtitle: '₹18.4L credited for settlement batch #ST-442',
      timestamp: 'Oct 23, 02:30 PM',
      type: 'settlement',
    },
  ],
};
