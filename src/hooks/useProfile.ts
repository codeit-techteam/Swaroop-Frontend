import { useCallback, useMemo } from 'react';

import { getComplianceValidTillLabel } from '@/constants/profile';
import { toCompanyProfile } from '@/services/company-profile';
import {
  updateCustomerBusinessProfile,
  verificationAccepted,
  type CustomerKycOverview,
} from '@/services/customer-kyc';
import { selectSavedAddresses, useAddressStore } from '@/store/address-store';
import { selectKycApproved, selectMobileNumber, useAuthStore } from '@/store/auth-store';
import { useCustomerKycOverviewStore } from '@/store/customer-kyc-overview-store';
import { selectMandatoryDocsReady, useKycStore } from '@/store/kyc-store';
import type {
  ComplianceStatus,
  KycVerificationStatus,
  MembershipTier,
  ProfileData,
  ProfileUpdatePayload,
  TradingStatus,
} from '@/types/profile';

const deriveBackendKycStatus = (overview: CustomerKycOverview): KycVerificationStatus => {
  if (overview.kycVerified) return 'verified';
  if (overview.status === 'SUBMITTED') return 'pending';
  return 'unverified';
};

const deriveDisplayName = (
  displayName: string | undefined,
  companyName: string,
  mobileNumber: string | null,
): string => {
  if (displayName?.trim()) {
    return displayName.trim();
  }

  if (companyName.trim()) {
    return companyName.trim();
  }

  return mobileNumber ? `+91 ${mobileNumber}` : 'PolyStoreX User';
};

const deriveKycStatus = (kycApproved: boolean, docsReady: boolean): KycVerificationStatus => {
  if (kycApproved) {
    return 'verified';
  }

  if (docsReady) {
    return 'pending';
  }

  return 'unverified';
};

const deriveMembership = (kycApproved: boolean): MembershipTier =>
  kycApproved ? 'Prime Member' : 'Standard Member';

const deriveTradingStatus = (kycApproved: boolean): TradingStatus =>
  kycApproved ? 'Active' : 'Inactive';

/** Prefer the backend KYC overview so admin approval matches the hero badge. */
const deriveEffectiveKycApproved = (
  overview: CustomerKycOverview | null,
  kycApproved: boolean,
): boolean => overview?.kycVerified ?? kycApproved;

const deriveDocumentsComplete = (
  overview: CustomerKycOverview | null,
  docsReady: boolean,
): boolean => {
  if (!overview) return docsReady;
  if (overview.kycVerified) return true;
  const documents = overview.checklist.find((item) => item.key === 'documents');
  if (documents) return documents.state === 'done';
  return overview.missingRequired.length === 0;
};

const deriveIdentityFlags = (
  overview: CustomerKycOverview | null,
  identityVerified: { pan: boolean; gst: boolean },
): { gstVerified: boolean; panVerified: boolean } => {
  if (!overview) {
    return { gstVerified: identityVerified.gst, panVerified: identityVerified.pan };
  }

  return {
    gstVerified: overview.kycVerified || verificationAccepted(overview.verifications.gst),
    panVerified: overview.kycVerified || verificationAccepted(overview.verifications.pan),
  };
};

const buildComplianceStatus = (params: {
  kycApproved: boolean;
  gstVerified: boolean;
  panVerified: boolean;
  documentsComplete: boolean;
}): ComplianceStatus => {
  const { kycApproved, gstVerified, panVerified, documentsComplete } = params;

  let summary: string;
  // Admin-approved KYC is fully compliant — never keep asking to "Complete KYC".
  if (kycApproved) {
    summary = 'All mandatory documents are verified and strictly compliant with regulations.';
  } else if (documentsComplete || gstVerified || panVerified) {
    summary = 'Verification is in progress. Finish any pending KYC steps to unlock full access.';
  } else {
    summary = 'Complete KYC verification to unlock full enterprise compliance status.';
  }

  return {
    kycVerified: kycApproved,
    gstVerified,
    panVerified,
    documentsComplete: kycApproved ? true : documentsComplete,
    validTillLabel: getComplianceValidTillLabel(),
    summary,
  };
};

export const useProfile = () => {
  const mobileNumber = useAuthStore(selectMobileNumber);
  const kycApproved = useAuthStore(selectKycApproved);
  const identityVerified = useAuthStore((state) => state.identityVerified);
  const userProfile = useAuthStore((state) => state.userProfile);
  const updateUserProfile = useAuthStore((state) => state.updateUserProfile);
  const savedDeliveryAddresses = useAddressStore(selectSavedAddresses);

  const overview = useCustomerKycOverviewStore((state) => state.overview);
  const setOverview = useCustomerKycOverviewStore((state) => state.setOverview);
  const docsReady = useKycStore(selectMandatoryDocsReady);

  const profile = useMemo<ProfileData>(() => {
    const company = toCompanyProfile(overview, mobileNumber);
    const effectiveKycApproved = deriveEffectiveKycApproved(overview, kycApproved);
    const documentsComplete = deriveDocumentsComplete(overview, docsReady);
    const { gstVerified, panVerified } = deriveIdentityFlags(overview, identityVerified);
    const savedAddresses: ProfileData['savedAddresses'] =
      savedDeliveryAddresses.length > 0
        ? savedDeliveryAddresses.map((address) => ({
            id: address.id,
            type:
              address.type === 'WAREHOUSE'
                ? 'warehouse'
                : address.type === 'OFFICE'
                  ? 'office'
                  : address.type === 'FACTORY'
                    ? 'factory'
                    : 'warehouse',
            label: address.label,
            addressLine: address.line1,
            city: address.city,
            state: address.state,
            pincode: address.postalCode,
            isPrimary: address.isDefault,
          }))
        : [];

    return {
      displayName: deriveDisplayName(userProfile?.displayName, company.companyName, mobileNumber),
      ...company,
      city: '',
      profilePhotoUri: userProfile?.profilePhotoUri ?? null,
      companyLogoUri: userProfile?.companyLogoUri ?? null,
      kycStatus: overview
        ? deriveBackendKycStatus(overview)
        : deriveKycStatus(effectiveKycApproved, docsReady),
      membership: deriveMembership(effectiveKycApproved),
      tradingStatus: deriveTradingStatus(effectiveKycApproved),
      compliance: buildComplianceStatus({
        kycApproved: effectiveKycApproved,
        gstVerified,
        panVerified,
        documentsComplete,
      }),
      companySource: overview ? 'backend' : 'none',
      savedAddresses,
      bankAccounts: [],
    };
  }, [
    overview,
    docsReady,
    identityVerified,
    kycApproved,
    mobileNumber,
    savedDeliveryAddresses,
    userProfile,
  ]);

  /**
   * Name, photo and logo are device preferences. Business email and nature of
   * business are saved to the backend organization, the single shared record.
   */
  const updateProfile = useCallback(
    async (patch: ProfileUpdatePayload) => {
      const userPatch: Parameters<typeof updateUserProfile>[0] = {};
      if (patch.displayName !== undefined) userPatch.displayName = patch.displayName;
      if (patch.profilePhotoUri !== undefined) userPatch.profilePhotoUri = patch.profilePhotoUri;
      if (patch.companyLogoUri !== undefined) userPatch.companyLogoUri = patch.companyLogoUri;

      const businessPatch: { businessEmail?: string; natureOfBusiness?: string } = {};
      if (patch.email !== undefined) businessPatch.businessEmail = patch.email;
      if (patch.natureOfBusiness !== undefined) {
        businessPatch.natureOfBusiness = patch.natureOfBusiness;
      }

      if (Object.keys(businessPatch).length > 0) {
        setOverview(await updateCustomerBusinessProfile(businessPatch));
      }
      if (Object.keys(userPatch).length > 0) {
        updateUserProfile(userPatch);
      }
    },
    [setOverview, updateUserProfile],
  );

  return {
    profile,
    updateProfile,
  };
};
