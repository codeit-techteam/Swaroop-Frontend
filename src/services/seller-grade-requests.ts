import { createGradeRequestApi } from '@/services/grade-requests';

export {
  GradeRequestError,
  newIdempotencyKey,
  toGradeRequestError,
  type PickedGradeRequestFile,
} from '@/services/grade-requests';

/** Seller grade-request client — same envelope and view model, base `/seller/grade-requests`. */
export const sellerGradeRequestApi = createGradeRequestApi('seller');

export const fetchSellerGradeRequestPrefill = sellerGradeRequestApi.fetchPrefill;
export const createSellerGradeRequest = sellerGradeRequestApi.create;
export const fetchSellerGradeRequests = sellerGradeRequestApi.fetchList;
export const fetchSellerGradeRequest = sellerGradeRequestApi.fetchOne;
export const respondToSellerGradeRequest = sellerGradeRequestApi.respond;
export const cancelSellerGradeRequest = sellerGradeRequestApi.cancel;
export const uploadSellerGradeRequestDocument = sellerGradeRequestApi.uploadDocument;
export const fetchSellerGradeRequestDocumentUrl = sellerGradeRequestApi.fetchDocumentUrl;
