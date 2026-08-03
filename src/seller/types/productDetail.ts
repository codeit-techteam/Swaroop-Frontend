export type ProductDocument = {
  id: string;
  title: string;
  fileName: string;
  type: 'coa' | 'tds' | 'quality';
};

export type ProductOfferStatus = {
  isLive: boolean;
  remainingQuantity: string;
  views: number;
  orders: number;
};

export type SellerProductDetail = {
  productId: string;
  reservedQty: string;
  packaging: string;
  applications: string[];
  documents: ProductDocument[];
  offerStatus: ProductOfferStatus;
};
