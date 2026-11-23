import type { Href } from 'expo-router';

import { ROUTES } from '@/navigation/routes';

type LoggedInRouteInput = {
  kycApproved: boolean;
  reviewSubmitted: boolean;
  /**
   * When true, KYC refresh failed after login. Prefer a soft landing that can
   * recover (application status) over restarting the full Business Information wizard.
   */
  kycStatusUnknown?: boolean;
};

/** Where a logged-in user should land based on KYC progress. */
export const getLoggedInRoute = ({
  kycApproved,
  reviewSubmitted,
  kycStatusUnknown = false,
}: LoggedInRouteInput): Href => {
  if (kycApproved) {
    return ROUTES.CUSTOMER.HOME as Href;
  }

  if (reviewSubmitted) {
    return ROUTES.AUTH.APPLICATION_SUBMITTED as Href;
  }

  // Failed refresh after logout wiped the local cache — do not force a blank KYC form.
  // Application Submitted polls the backend and offers Dashboard once verified.
  if (kycStatusUnknown) {
    return ROUTES.AUTH.APPLICATION_SUBMITTED as Href;
  }

  return ROUTES.AUTH.BUSINESS_INFORMATION as Href;
};
