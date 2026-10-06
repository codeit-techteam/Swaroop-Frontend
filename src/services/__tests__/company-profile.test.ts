/**
 * Company profile comes only from the backend KYC overview.
 * Run: npx tsx --test src/services/__tests__/company-profile.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { toCompanyProfile } from '../company-profile.ts';
import type { CustomerKycOverview } from '../customer-kyc.ts';

const overview = (patch: Partial<CustomerKycOverview> = {}): CustomerKycOverview => ({
  status: 'APPROVED',
  kycVerified: true,
  submittedAt: '2026-10-01T10:00:00.000Z',
  reviewedAt: '2026-10-02T10:00:00.000Z',
  reviewNotes: null,
  rejectedReason: null,
  changeRequest: null,
  locked: true,
  canSubmit: false,
  missingRequired: [],
  verifications: {
    pan: null,
    gst: {
      id: 'v-gst',
      type: 'GST',
      status: 'VERIFIED',
      method: 'PROVIDER',
      identifierMasked: '27AAP******1ZV',
      provider: 'surepass',
      details: {
        legalName: 'Sharma Polymers Private Limited',
        constitution: 'Private Limited Company',
        address: '12 MIDC Road, Andheri East, Mumbai',
        state: 'Maharashtra',
        pincode: '400093',
        registrationDate: '2019-04-01',
      },
      failureCode: null,
      message: 'Verified',
      verifiedAt: '2026-10-01T09:00:00.000Z',
      createdAt: '2026-10-01T09:00:00.000Z',
    },
  },
  checklist: [],
  organization: {
    name: 'Sharma Polymers',
    legalName: 'Sharma Polymers Private Limited',
    gstin: '27AAPFU0939F1ZV',
    pan: 'AAPFU0939F',
    businessType: 'Private Limited',
    constitutionType: null,
    natureOfBusiness: 'Polymer Distribution',
    email: 'ops@sharma.example',
    phone: null,
  },
  slots: [
    {
      slot: 'pan',
      name: 'PAN Card',
      required: true,
      changeRequested: false,
      document: {
        id: 'doc-pan',
        slot: 'pan',
        fileName: 'pan.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: '1024',
        status: 'VERIFIED',
        r2Confirmed: true,
        rejectionReason: null,
        uploadedAt: '2026-10-01T08:00:00.000Z',
      },
    },
    {
      slot: 'gst',
      name: 'GST Certificate',
      required: true,
      changeRequested: false,
      document: null,
    },
  ],
  ...patch,
});

describe('toCompanyProfile', () => {
  it('maps the backend organization and verified GST record', () => {
    const profile = toCompanyProfile(overview(), '9876543210');

    assert.equal(profile.companyName, 'Sharma Polymers Private Limited');
    assert.equal(profile.companyType, 'Private Limited');
    assert.equal(profile.gstNumber, '27AAPFU0939F1ZV');
    assert.equal(profile.panNumber, 'AAPFU0939F');
    assert.equal(profile.businessAddress, '12 MIDC Road, Andheri East, Mumbai');
    assert.equal(profile.state, 'Maharashtra');
    assert.equal(profile.pincode, '400093');
    assert.equal(profile.natureOfBusiness, 'Polymer Distribution');
    assert.equal(profile.email, 'ops@sharma.example');
    assert.equal(profile.phone, '9876543210');
    assert.equal(profile.gstRegisteredOn, '01 Apr 2019');
  });

  it('lists only documents stored on the backend', () => {
    const { taxDocuments } = toCompanyProfile(overview(), null);
    assert.deepEqual(taxDocuments, [
      {
        id: 'pan',
        title: 'PAN Card',
        subtitle: 'pan.pdf',
        available: true,
        documentId: 'doc-pan',
      },
    ]);
  });

  it('returns empty fields before the backend responds instead of any local data', () => {
    const profile = toCompanyProfile(null, null);
    assert.equal(profile.companyName, '');
    assert.equal(profile.gstNumber, '');
    assert.equal(profile.panNumber, '');
    assert.deepEqual(profile.taxDocuments, []);
  });

  it('keeps a non-ISO registration date as the provider returned it', () => {
    const base = overview();
    const gst = base.verifications.gst!;
    const profile = toCompanyProfile(
      overview({
        verifications: {
          pan: null,
          gst: { ...gst, details: { ...gst.details, registrationDate: '01/04/2019' } },
        },
      }),
      null,
    );
    assert.equal(profile.gstRegisteredOn, '01/04/2019');
  });
});
