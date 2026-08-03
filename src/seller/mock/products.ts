import type { SellerProductDetail } from '@/seller/types/productDetail';

export const SELLER_PRODUCT_DETAILS_SEED: Record<string, SellerProductDetail> = {
  'seller-product-demo-1': {
    productId: 'seller-product-demo-1',
    reservedQty: '45',
    packaging: '25 kg bags / bulk jumbo bags',
    applications: ['Pipe Extrusion', 'Blow Molding', 'Injection Molding'],
    documents: [
      { id: 'coa', title: 'COA', fileName: 'COA-HDPE-PE100.pdf', type: 'coa' },
      { id: 'tds', title: 'TDS', fileName: 'TDS-HDPE-PE100.pdf', type: 'tds' },
    ],
    offerStatus: {
      isLive: true,
      remainingQuantity: '455 MT',
      views: 1240,
      orders: 48,
    },
  },
};

export const buildDefaultProductDetail = (productId: string): SellerProductDetail => ({
  productId,
  reservedQty: '0',
  packaging: '25 kg bags',
  applications: ['Industrial Applications'],
  documents: [
    { id: 'coa', title: 'COA', fileName: 'COA-sample.pdf', type: 'coa' },
    { id: 'tds', title: 'TDS', fileName: 'TDS-sample.pdf', type: 'tds' },
  ],
  offerStatus: {
    isLive: false,
    remainingQuantity: '0 MT',
    views: 0,
    orders: 0,
  },
});
