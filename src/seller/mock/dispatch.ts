export type DispatchDetailPhoto = {
  id: string;
  label: string;
  uri: string;
};

export type DispatchDetailTimelineStep = {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
};

export type DispatchDetailExtension = {
  orderId: string;
  transportCompany: string;
  checklist: {
    invoice: boolean;
    lr: boolean;
    ewayBill: boolean;
    loadingSlip: boolean;
    sealVerification: boolean;
  };
  loadingPhotos: DispatchDetailPhoto[];
  timeline: DispatchDetailTimelineStep[];
};

export const DISPATCH_DETAIL_EXTENSIONS: Record<string, DispatchDetailExtension> = {
  'PT-ORD-8850': {
    orderId: 'PT-ORD-8850',
    transportCompany: 'Gujarat Freight Logistics Pvt Ltd',
    checklist: {
      invoice: true,
      lr: true,
      ewayBill: true,
      loadingSlip: true,
      sealVerification: true,
    },
    loadingPhotos: [
      {
        id: 'front',
        label: 'Truck Front',
        uri: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'rear',
        label: 'Truck Rear',
        uri: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'seal',
        label: 'Seal',
        uri: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'loading',
        label: 'Loading',
        uri: 'https://images.unsplash.com/photo-1586528116493-48b7e9d4d8c4?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'weight',
        label: 'Weight Slip',
        uri: 'https://images.unsplash.com/photo-1554224311-beee415c201f?auto=format&fit=crop&w=400&q=80',
      },
    ],
    timeline: [
      { id: 'assigned', label: 'Vehicle Assigned', status: 'completed', timestamp: 'Oct 24, 07:30 AM' },
      { id: 'loading-start', label: 'Loading Started', status: 'completed', timestamp: 'Oct 24, 09:00 AM' },
      { id: 'loading-complete', label: 'Loading Complete', status: 'completed', timestamp: 'Oct 24, 10:30 AM' },
      { id: 'dispatch-start', label: 'Dispatch Started', status: 'completed', timestamp: 'Oct 24, 11:15 AM' },
      { id: 'out-for-delivery', label: 'Out For Delivery', status: 'current', timestamp: 'Oct 24, 02:00 PM' },
    ],
  },
};

export const buildDefaultDispatchDetail = (orderId: string): DispatchDetailExtension => ({
  orderId,
  transportCompany: 'PetroTrade Logistics Partner',
  checklist: {
    invoice: false,
    lr: false,
    ewayBill: false,
    loadingSlip: false,
    sealVerification: false,
  },
  loadingPhotos: [],
  timeline: [
    { id: 'assigned', label: 'Vehicle Assigned', status: 'pending' },
    { id: 'loading-start', label: 'Loading Started', status: 'pending' },
    { id: 'loading-complete', label: 'Loading Complete', status: 'pending' },
    { id: 'dispatch-start', label: 'Dispatch Started', status: 'pending' },
    { id: 'out-for-delivery', label: 'Out For Delivery', status: 'pending' },
  ],
});
