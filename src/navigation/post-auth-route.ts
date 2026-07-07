import type { Href } from 'expo-router';

import { ROUTES } from '@/navigation/routes';

type LoggedInRouteInput = {
  kycApproved: boolean;
  reviewSubmitted: boolean;
};

/** Where a logged-in user should land based on KYC progress. */
export const getLoggedInRoute = ({
  kycApproved,
  reviewSubmitted,
}: LoggedInRouteInput): Href => {
  if (kycApproved) {
    return ROUTES.CUSTOMER.HOME as Href;
  }

  if (reviewSubmitted) {
    return ROUTES.AUTH.APPLICATION_SUBMITTED as Href;
  }

  return ROUTES.AUTH.BUSINESS_INFORMATION as Href;
};
