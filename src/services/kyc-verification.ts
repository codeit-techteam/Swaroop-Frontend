import { getKycVerificationDelayMs } from '@/config/development';
import { getKYC } from '@/services/storage';

/** True once the simulated (or real) verification window has elapsed since submission. */
export const isVerificationPeriodComplete = (submittedAt: number | null | undefined): boolean => {
  if (!submittedAt) {
    return false;
  }

  const delayMs = getKycVerificationDelayMs();
  if (delayMs <= 0) {
    return false;
  }

  return Date.now() - submittedAt >= delayMs;
};

export const getVerificationRemainingMs = (submittedAt: number | null | undefined): number => {
  if (!submittedAt) {
    return getKycVerificationDelayMs();
  }

  const delayMs = getKycVerificationDelayMs();
  if (delayMs <= 0) {
    return 0;
  }

  return Math.max(0, delayMs - (Date.now() - submittedAt));
};

/** Whether the user has submitted KYC and is still waiting for approval. */
export const isAwaitingKycVerification = (): boolean => {
  const kyc = getKYC();
  return kyc.reviewSubmitted && !kyc.kycApproved;
};

/** Whether pending verification has finished and the user can access the home screen. */
export const canAccessHomeAfterSubmission = (): boolean => {
  const kyc = getKYC();
  if (kyc.kycApproved) {
    return true;
  }

  return isVerificationPeriodComplete(kyc.submittedAt);
};
