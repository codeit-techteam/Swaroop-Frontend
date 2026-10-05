import { useCallback, useMemo } from 'react';

import {
  DEFAULT_BANK_ACCOUNTS,
  DEFAULT_TAX_DOCUMENTS,
  getComplianceValidTillLabel,
} from '@/constants/profile';
import { selectSavedAddresses, useAddressStore } from '@/store/address-store';
import { selectKycApproved, selectMobileNumber, useAuthStore } from '@/store/auth-store';
import { selectBusinessInfo, selectMandatoryDocsReady, useKycStore } from '@/store/kyc-store';
import type {
  ComplianceStatus,
  KycVerificationStatus,
  MembershipTier,
  ProfileData,
  ProfileUpdatePayload,
  TradingStatus,
} from '@/types/profile';

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

  return mobileNumber ? `+91 ${mobileNumber}` : 'PetroTrade User';
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

const buildComplianceStatus = (params: {
  kycApproved: boolean;
  gstVerified: boolean;
  panVerified: boolean;
  documentsComplete: boolean;
}): ComplianceStatus => {
  const { kycApproved, gstVerified, panVerified, documentsComplete } = params;

  return {
    kycVerified: kycApproved,
    gstVerified,
    panVerified,
    documentsComplete,
    validTillLabel: getComplianceValidTillLabel(),
    summary:
      kycApproved && documentsComplete
        ? 'All mandatory documents are verified and strictly compliant with regulations.'
        : 'Complete KYC verification to unlock full enterprise compliance status.',
  };
};

export const useProfile = () => {
  const mobileNumber = useAuthStore(selectMobileNumber);
  const kycApproved = useAuthStore(selectKycApproved);
  const identityVerified = useAuthStore((state) => state.identityVerified);
  const userProfile = useAuthStore((state) => state.userProfile);
  const updateUserProfile = useAuthStore((state) => state.updateUserProfile);
  const savedDeliveryAddresses = useAddressStore(selectSavedAddresses);

  const businessInfo = useKycStore(selectBusinessInfo);
  const docsReady = useKycStore(selectMandatoryDocsReady);
  const updateBusinessInfo = useKycStore((state) => state.updateBusinessInfo);

  const profile = useMemo<ProfileData>(() => {
    const companyName = businessInfo.businessEntityName;
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

    const bankAccounts = DEFAULT_BANK_ACCOUNTS.map((account) => ({
      ...account,
      accountHolder: companyName || account.accountHolder,
    }));

    return {
      displayName: deriveDisplayName(userProfile?.displayName, companyName, mobileNumber),
      companyName,
      companyType: businessInfo.companyType,
      profilePhotoUri: userProfile?.profilePhotoUri ?? null,
      companyLogoUri: userProfile?.companyLogoUri ?? null,
      email: businessInfo.businessEmail,
      phone: businessInfo.mobileNumber || mobileNumber || '',
      gstNumber: businessInfo.gstNumber,
      panNumber: businessInfo.panNumber,
      businessAddress: businessInfo.businessAddress,
      state: businessInfo.state,
      city: businessInfo.city,
      pincode: businessInfo.pincode,
      natureOfBusiness: businessInfo.natureOfBusiness,
      establishedYear: userProfile?.establishedYear ?? '',
      kycStatus: deriveKycStatus(kycApproved, docsReady),
      membership: deriveMembership(kycApproved),
      tradingStatus: deriveTradingStatus(kycApproved),
      compliance: buildComplianceStatus({
        kycApproved,
        gstVerified: identityVerified.gst,
        panVerified: identityVerified.pan,
        documentsComplete: docsReady,
      }),
      savedAddresses,
      bankAccounts,
      taxDocuments: DEFAULT_TAX_DOCUMENTS,
    };
  }, [
    businessInfo,
    docsReady,
    identityVerified,
    kycApproved,
    mobileNumber,
    savedDeliveryAddresses,
    userProfile,
  ]);

  const updateProfile = useCallback(
    (patch: ProfileUpdatePayload) => {
      const userPatch: Parameters<typeof updateUserProfile>[0] = {};

      if (patch.displayName !== undefined) {
        userPatch.displayName = patch.displayName;
      }

      if (patch.profilePhotoUri !== undefined) {
        userPatch.profilePhotoUri = patch.profilePhotoUri;
      }

      if (patch.companyLogoUri !== undefined) {
        userPatch.companyLogoUri = patch.companyLogoUri;
      }

      if (patch.phone !== undefined) {
        userPatch.mobileNumber = patch.phone;
      }

      if (Object.keys(userPatch).length > 0) {
        updateUserProfile(userPatch);
      }

      const businessPatch: Partial<typeof businessInfo> = {};

      if (patch.email !== undefined) {
        businessPatch.businessEmail = patch.email;
      }

      if (patch.phone !== undefined) {
        businessPatch.mobileNumber = patch.phone;
      }

      if (patch.businessAddress !== undefined) {
        businessPatch.businessAddress = patch.businessAddress;
      }

      if (patch.natureOfBusiness !== undefined) {
        businessPatch.natureOfBusiness = patch.natureOfBusiness;
      }

      if (Object.keys(businessPatch).length > 0) {
        updateBusinessInfo(businessPatch);
      }
    },
    [updateBusinessInfo, updateUserProfile],
  );

  return {
    profile,
    updateProfile,
  };
};
