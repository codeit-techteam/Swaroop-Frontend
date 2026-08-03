import {
  buildDefaultProductDetail,
  SELLER_PRODUCT_DETAILS_SEED,
} from '@/seller/mock/products';
import type { SellerProductDetail } from '@/seller/types/productDetail';

export const getProductDetail = (productId: string): SellerProductDetail =>
  SELLER_PRODUCT_DETAILS_SEED[productId] ?? buildDefaultProductDetail(productId);

export const simulateProductDocumentDownload = async (fileName: string): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return `${fileName} downloaded successfully.`;
};
