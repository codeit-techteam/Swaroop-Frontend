export type OfferDetailTimelineStep = {
  id: string;
  title: string;
  subtitle: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
};

export type OfferDetailPerformance = {
  views: number;
  quotes: number;
  orders: number;
  conversion: number;
  revenue: string;
};
