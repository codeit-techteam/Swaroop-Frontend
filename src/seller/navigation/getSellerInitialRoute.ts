import type { Href } from 'expo-router';

import { ROUTES } from '@/navigation/routes';
import {
  areSellerDocumentsReady,
  isSellerCompanyFilled,
  isSellerOnboardingComplete,
} from '@/seller/mock/mockSellerService';
import type { SellerSnapshot } from '@/seller/types';

export const getSellerInitialRoute = (snapshot: SellerSnapshot): Href => {
  if (!snapshot.sellerLoggedIn) {
    return ROUTES.SELLER.LOGIN as Href;
  }

  if (isSellerOnboardingComplete(snapshot)) {
    return ROUTES.SELLER.DASHBOARD as Href;
  }

  if (!isSellerCompanyFilled(snapshot)) {
    return ROUTES.SELLER.COMPANY as Href;
  }

  if (!areSellerDocumentsReady(snapshot)) {
    return ROUTES.SELLER.VERIFICATION as Href;
  }

  if (!snapshot.verificationSubmitted) {
    return ROUTES.SELLER.REVIEW as Href;
  }

  return ROUTES.SELLER.VERIFICATION_SUBMITTED as Href;
};
