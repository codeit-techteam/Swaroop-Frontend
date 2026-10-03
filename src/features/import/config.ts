import type {
  ImportParty,
  ImportShipmentMode,
  ImportShipmentStatus,
  ImportSide,
} from '@/features/import/types';

/**
 * The customer panel trades the BUY side (publishes RFQs, browses sell offers);
 * the seller panel trades the SELL side. The backend enforces the same rule
 * from the authenticated session, so this only drives copy and navigation.
 */
export type ImportMode = 'customer' | 'seller';

type ImportModeConfig = {
  ownSide: ImportSide;
  marketSide: ImportSide;
  ownParty: ImportParty;
  sessionRole: 'customer' | 'seller';
  copy: {
    own: string;
    ownPlural: string;
    market: string;
    marketPlural: string;
    price: string;
    quantity: string;
    counterparty: string;
  };
  routes: {
    hub: string;
    mine: string;
    form: string;
    listing: string;
    market: string;
    marketListing: string;
    negotiations: string;
    negotiation: string;
    deals: string;
    deal: string;
  };
};

const routesFor = (base: string): ImportModeConfig['routes'] => ({
  hub: base,
  mine: `${base}/mine`,
  form: `${base}/form`,
  listing: `${base}/listing`,
  market: `${base}/market`,
  marketListing: `${base}/market-listing`,
  negotiations: `${base}/negotiations`,
  negotiation: `${base}/negotiation`,
  deals: `${base}/deals`,
  deal: `${base}/deal`,
});

export const IMPORT_MODES: Record<ImportMode, ImportModeConfig> = {
  customer: {
    ownSide: 'BUY',
    marketSide: 'SELL',
    ownParty: 'BUYER',
    sessionRole: 'customer',
    copy: {
      own: 'Buy request',
      ownPlural: 'Buy requests',
      market: 'Sell offer',
      marketPlural: 'Sell offers',
      price: 'Target price',
      quantity: 'Required quantity',
      counterparty: 'Seller',
    },
    routes: routesFor('/(customer)/import'),
  },
  seller: {
    ownSide: 'SELL',
    marketSide: 'BUY',
    ownParty: 'SELLER',
    sessionRole: 'seller',
    copy: {
      own: 'Sell offer',
      ownPlural: 'Sell offers',
      market: 'Buy request',
      marketPlural: 'Buy requests',
      price: 'Offer price',
      quantity: 'Available quantity',
      counterparty: 'Buyer',
    },
    routes: routesFor('/(seller)/import-trading'),
  },
};

const SHIPMENT_EVENT_KEYS = ['IMPORT_SHIPMENT_CREATED', 'IMPORT_SHIPMENT_STATUS_CHANGED'];

/**
 * Deep link for a backend Import notification. Listing notices (match found,
 * near expiry, expired, Admin status change) always go to the listing owner,
 * so they open the user's own listing. Shipment notices open their deal.
 */
export function importNotificationTarget(
  mode: ImportMode,
  entityType?: string | null,
  entityId?: string | null,
  metadata?: Record<string, unknown> | null,
): { route: string; label: string } | null {
  const { routes, copy } = IMPORT_MODES[mode];
  const eventKey = typeof metadata?.eventKey === 'string' ? metadata.eventKey : null;
  if (entityType === 'IMPORT_SHIPMENT' || (eventKey && SHIPMENT_EVENT_KEYS.includes(eventKey))) {
    const dealId =
      typeof metadata?.dealId === 'string' && metadata.dealId
        ? metadata.dealId
        : entityType === 'IMPORT_DEAL'
          ? entityId
          : null;
    if (!dealId) return null;
    return {
      route: `${routes.deal}?id=${encodeURIComponent(dealId)}`,
      label: mode === 'customer' ? 'Track shipment' : 'View shipment',
    };
  }
  if (!entityId) return null;
  const id = encodeURIComponent(entityId);
  switch (entityType) {
    case 'IMPORT_DEAL':
      return { route: `${routes.deal}?id=${id}`, label: 'Open deal' };
    case 'IMPORT_NEGOTIATION':
      return { route: `${routes.negotiation}?id=${id}`, label: 'Open negotiation' };
    case 'IMPORT_LISTING':
      return { route: `${routes.listing}?id=${id}`, label: `Open ${copy.own.toLowerCase()}` };
    default:
      return null;
  }
}

/** Fallback when the master-data bundle predates `enums.shipmentModes`. */
export const SHIPMENT_MODES: ImportShipmentMode[] = ['SEA', 'AIR', 'ROAD', 'RAIL', 'MULTIMODAL'];

/**
 * Buyer-facing tracking steps after "Order confirmed". A step is done once the
 * shipment has reached any of its statuses (from the status or event history).
 */
export const SHIPMENT_TIMELINE: { label: string; statuses: ImportShipmentStatus[] }[] = [
  { label: 'Shipment booked', statuses: ['BOOKED'] },
  { label: 'Shipped / picked up', statuses: ['SHIPPED'] },
  { label: 'In transit', statuses: ['IN_TRANSIT'] },
  { label: 'Arrived / customs', statuses: ['ARRIVED', 'CUSTOMS_CLEARANCE'] },
  { label: 'Out for delivery', statuses: ['OUT_FOR_DELIVERY'] },
  { label: 'Delivered', statuses: ['DELIVERED'] },
];

/** API path segment for a listing side. */
export const sidePath = (side: ImportSide): string =>
  side === 'BUY' ? '/import/buy' : '/import/sell';
