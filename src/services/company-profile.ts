import dayjs from 'dayjs';

import type { CustomerKycOverview } from '@/services/customer-kyc';
import type { TaxDocument } from '@/types/profile';

export type CompanyProfileFields = {
  companyName: string;
  companyType: string;
  email: string;
  phone: string;
  gstNumber: string;
  panNumber: string;
  businessAddress: string;
  state: string;
  pincode: string;
  natureOfBusiness: string;
  gstRegisteredOn: string;
  taxDocuments: TaxDocument[];
};

const formatRegistrationDate = (value: string | null | undefined): string => {
  if (!value) return '';
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? dayjs(value).format('DD MMM YYYY') : value;
};

/**
 * Company profile shown in the app, taken only from the backend KYC overview
 * (organization + verified GST record). Without an overview every field is empty;
 * nothing falls back to on-device drafts.
 */
export function toCompanyProfile(
  overview: CustomerKycOverview | null,
  signInPhone: string | null,
): CompanyProfileFields {
  const organization = overview?.organization;
  const gst = overview?.verifications.gst?.details;

  return {
    companyName: organization?.legalName ?? organization?.name ?? gst?.legalName ?? '',
    companyType:
      organization?.businessType ?? organization?.constitutionType ?? gst?.constitution ?? '',
    email: organization?.email ?? '',
    phone: organization?.phone ?? signInPhone ?? '',
    gstNumber: organization?.gstin ?? '',
    panNumber: organization?.pan ?? '',
    businessAddress: gst?.address ?? '',
    state: gst?.state ?? '',
    pincode: gst?.pincode ?? '',
    natureOfBusiness: organization?.natureOfBusiness ?? '',
    gstRegisteredOn: formatRegistrationDate(gst?.registrationDate),
    taxDocuments: (overview?.slots ?? []).flatMap((slot) =>
      slot.document?.r2Confirmed
        ? [
            {
              id: slot.slot,
              title: slot.name,
              subtitle: slot.document.fileName,
              available: true,
              documentId: slot.document.id,
            },
          ]
        : [],
    ),
  };
}
