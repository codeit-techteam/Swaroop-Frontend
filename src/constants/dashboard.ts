import type { DeliveryLocation, LowestLandedCost, QuickSummaryItem } from '@/types/home';

export const DELIVERY_LOCATIONS: DeliveryLocation[] = [
  {
    id: 'loc-mumbai',
    city: 'Mumbai',
    state: 'MH',
    pincode: '400001',
    label: 'Mumbai, MH 400001',
  },
  {
    id: 'loc-delhi',
    city: 'Delhi',
    state: 'DL',
    pincode: '110001',
    label: 'Delhi, DL 110001',
  },
  {
    id: 'loc-ahmedabad',
    city: 'Ahmedabad',
    state: 'GJ',
    pincode: '380001',
    label: 'Ahmedabad, GJ 380001',
  },
  {
    id: 'loc-chennai',
    city: 'Chennai',
    state: 'TN',
    pincode: '600001',
    label: 'Chennai, TN 600001',
  },
  {
    id: 'loc-pune',
    city: 'Pune',
    state: 'MH',
    pincode: '411001',
    label: 'Pune, MH 411001',
  },
  {
    id: 'loc-surat',
    city: 'Surat',
    state: 'GJ',
    pincode: '395001',
    label: 'Surat, GJ 395001',
  },
];

export const DEFAULT_DELIVERY_LOCATION = DELIVERY_LOCATIONS[0];

export const QUICK_SUMMARY_ITEMS: QuickSummaryItem[] = [
  {
    id: 'summary-active-orders',
    type: 'orders',
    label: 'ACTIVE ORDERS',
    value: '2',
    subtitle: 'Transit',
    valueTone: 'primary',
  },
  {
    id: 'summary-due-invoices',
    type: 'invoices',
    label: 'DUE INVOICES',
    value: '₹14.2L',
    subtitle: '',
    valueTone: 'danger',
  },
];

export const LOWEST_LANDED_COST: LowestLandedCost = {
  badge: 'PRIORITY ROUTE FOUND',
  title: 'Lowest Landed Cost',
  description:
    'Direct logistics optimized for 10MT Polypropylene from Mundra Port to your delivery region.',
  estimatedTotal: '₹9.84L',
  totalSavings: '₹12.4K',
  ctaLabel: 'Review & Place Order',
};

export const HOME_SEARCH_PLACEHOLDER = 'Search Polymers (PP, HDPE, PVC...)';

export const TAB_BAR_HEIGHT = 64;
