export type CheckoutShippingAddress = {
  id: string;
  warehouseName: string;
  line1: string;
  line2: string;
  state: string;
  pincode: string;
  zoneLabel: string;
  /** Short city label used in freight row, e.g. "Jamnagar" */
  cityShort: string;
  freightAmount: number;
  etaLabel: string;
};

export type CheckoutOrderSummary = {
  baseSubtotal: number;
  freight: number;
  freightLabel: string;
  gst: number;
  platformFee: number;
  insuranceIncluded: boolean;
  totalPayable: number;
  totalQuantityMt: number;
};

export type CheckoutProductLine = {
  id: string;
  title: string;
  subtitle: string;
  quantityMt: number;
  packaging: string;
};
