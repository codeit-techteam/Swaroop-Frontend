import type { SearchResult, SearchSnapshot } from '@/seller/types/search';
import { ROUTES } from '@/navigation/routes';

export const DEFAULT_SEARCH_SNAPSHOT: SearchSnapshot = {
  recentSearches: ['HDPE', 'ORD-8829', 'PP H110MA'],
  popularSearches: ['Offers', 'Inventory', 'Dispatch'],
};

export const SEARCH_CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  products: 'Products',
  orders: 'Orders',
  offers: 'Offers',
  shipments: 'Shipments',
  inventory: 'Inventory',
  documents: 'Documents',
};

export const MOCK_SEARCH_INDEX: SearchResult[] = [
  {
    id: 'sr-1',
    type: 'product',
    title: 'HDPE H110MA',
    subtitle: 'Polymer · 450 MT available · Hazira',
    route: ROUTES.SELLER.PRODUCTS,
  },
  {
    id: 'sr-2',
    type: 'product',
    title: 'PP H110MA',
    subtitle: 'Polymer · 320 MT available · JNPT',
    route: ROUTES.SELLER.PRODUCTS,
  },
  {
    id: 'sr-3',
    type: 'order',
    title: 'ORD-8829',
    subtitle: 'Reliance Industries · 120 MT HDPE · Pending',
    route: ROUTES.SELLER.ORDERS,
  },
  {
    id: 'sr-4',
    type: 'order',
    title: 'ORD-8810',
    subtitle: 'Adani Enterprises · 80 MT PP · Credit Review',
    route: ROUTES.SELLER.ORDERS,
  },
  {
    id: 'sr-5',
    type: 'offer',
    title: 'OFF-HDPE-Q1-2026',
    subtitle: 'Active · 3 tiers · 500 MT committed',
    route: ROUTES.SELLER.OFFERS,
  },
  {
    id: 'sr-6',
    type: 'offer',
    title: 'OFF-PP-BULK-FEB',
    subtitle: 'Paused · 2 tiers · 200 MT',
    route: ROUTES.SELLER.OFFERS,
  },
  {
    id: 'sr-7',
    type: 'shipment',
    title: 'SHP-4421',
    subtitle: 'Hazira → Mumbai · In Transit · ETA 30 Jul',
    route: ROUTES.SELLER.SHIPMENTS,
  },
  {
    id: 'sr-8',
    type: 'shipment',
    title: 'SHP-4398',
    subtitle: 'JNPT → Pune · On Time · ETA 29 Jul',
    route: ROUTES.SELLER.SHIPMENTS,
  },
  {
    id: 'sr-9',
    type: 'inventory',
    title: 'HDPE H110MA Stock',
    subtitle: 'Hazira · 450 MT · Normal',
    route: ROUTES.SELLER.INVENTORY,
  },
  {
    id: 'sr-10',
    type: 'inventory',
    title: 'PP Raffia Grade',
    subtitle: 'Bhiwandi · 85 MT · Low Stock',
    route: ROUTES.SELLER.INVENTORY,
  },
  {
    id: 'sr-11',
    type: 'document',
    title: 'GST Certificate',
    subtitle: 'Verified · Uploaded 15 Jan 2026',
    route: ROUTES.SELLER.PROFILE_DOCUMENTS,
  },
  {
    id: 'sr-12',
    type: 'document',
    title: 'Invoice INV-2026-0142',
    subtitle: 'Verified · 2.4 MB',
    route: ROUTES.SELLER.PROFILE_DOCUMENTS,
  },
];
