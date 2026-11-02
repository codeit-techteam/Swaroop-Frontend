import { apiClient } from '@/api/client';

type Envelope<T> = {
  success: boolean;
  data: T;
};

export type SellerGradeTdsItem = {
  id: string;
  type: string;
  title: string;
  fileName?: string | null;
  mimeType?: string | null;
  manufacturer?: string | null;
  format?: string;
  available?: boolean;
  verificationStatus?: string;
  source?: string;
};

export type SellerGradeTdsResponse = {
  grade: {
    id: string;
    code: string;
    name: string;
    gradeNo?: string | null;
    manufacturer?: string | null;
  };
  product?: {
    id: string;
    code?: string | null;
    name: string;
    manufacturer?: string | null;
  } | null;
  available: boolean;
  message?: string | null;
  items: SellerGradeTdsItem[];
};

/** Verified platform grade-library TDS for a seller product (read-only). */
export async function fetchSellerProductGradeTds(
  productId: string,
): Promise<SellerGradeTdsResponse> {
  const payload = await apiClient.get<Envelope<SellerGradeTdsResponse>>(
    `/seller/products/${productId}/documents/grade-tds`,
  );
  return (
    payload.data.data ?? {
      grade: { id: '', code: '', name: '' },
      available: false,
      items: [],
    }
  );
}
