import type { OfferDetailTimelineStep } from '@/seller/types/offerDetail';

export const buildOfferDetailTimeline = (offerId: string): OfferDetailTimelineStep[] => [
  {
    id: `${offerId}-created`,
    title: 'Created',
    subtitle: 'Offer drafted and submitted for review',
    status: 'completed',
    timestamp: 'Oct 20, 10:00 AM',
  },
  {
    id: `${offerId}-reviewed`,
    title: 'Reviewed',
    subtitle: 'Compliance and pricing review completed',
    status: 'completed',
    timestamp: 'Oct 20, 04:30 PM',
  },
  {
    id: `${offerId}-live`,
    title: 'Live',
    subtitle: 'Offer published to marketplace buyers',
    status: 'completed',
    timestamp: 'Oct 21, 09:00 AM',
  },
  {
    id: `${offerId}-orders`,
    title: 'Orders Received',
    subtitle: 'Buyer orders linked to this offer',
    status: 'current',
    timestamp: 'Oct 24, 06:15 PM',
  },
];

export const calculateOfferRevenue = (orders: number, basePrice: number): string => {
  const avgQty = 25;
  const total = orders * avgQty * basePrice * 1000;
  if (total >= 10000000) {
    return `₹${(total / 10000000).toFixed(1)}Cr`;
  }
  if (total >= 100000) {
    return `₹${(total / 100000).toFixed(1)}L`;
  }
  return `₹${total.toLocaleString('en-IN')}`;
};
