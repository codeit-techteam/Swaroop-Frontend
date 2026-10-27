/**
 * B-04 notification copy sanitization.
 * Run: npx tsx --test src/utils/__tests__/notification-copy.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  formatNotificationDescription,
  looksLikeRawUploadName,
  resolveNotificationCategoryHint,
  sanitizeNotificationReference,
} from '../notification-copy.ts';

describe('looksLikeRawUploadName', () => {
  it('flags camera / WhatsApp / UUID upload names', () => {
    assert.equal(
      looksLikeRawUploadName('WhatsApp Image 2026-09-09 at 4.30.22 PM.jpeg'),
      true,
    );
    assert.equal(looksLikeRawUploadName('qr_sumit.png'), true);
    assert.equal(
      looksLikeRawUploadName('413a638a-9c41-41a6-b05a-338de2f89d3a'),
      true,
    );
    assert.equal(looksLikeRawUploadName('GST Certificate'), false);
  });
});

describe('resolveNotificationCategoryHint', () => {
  it('maps KYC metadata and titles to documents (not orders)', () => {
    assert.equal(
      resolveNotificationCategoryHint({ type: 'KYC_APPROVED' }, 'KYC approved', 'CUSTOMER'),
      'documents',
    );
    assert.equal(
      resolveNotificationCategoryHint({}, 'KYC approved', 'CUSTOMER'),
      'documents',
    );
  });
});

describe('formatNotificationDescription', () => {
  it('rewrites document bodies that embed raw filenames', () => {
    assert.equal(
      formatNotificationDescription(
        'Document approved',
        'Your document WhatsApp Image 2026-09-09 at 4.30.22 PM.jpeg was verified.',
        { documentCategory: 'GST', slotLabel: 'GST Certificate' },
      ),
      'Your GST Certificate was verified.',
    );
    assert.equal(
      formatNotificationDescription(
        'Document approved',
        'Your document qr_sumit.png was verified.',
        {},
      ),
      'Your document was verified.',
    );
  });

  it('rewrites PetroTrade brand leftovers and keeps KYC copy', () => {
    assert.equal(
      formatNotificationDescription(
        'KYC approved',
        'Your business KYC has been verified. You now have full access to PetroTrade.',
        { type: 'KYC_APPROVED' },
      ),
      'Your business KYC has been verified. You now have full access to PolyStoreX.',
    );
  });
});

describe('sanitizeNotificationReference', () => {
  it('drops UUIDs so they never render under the title', () => {
    assert.equal(
      sanitizeNotificationReference('413a638a-9c41-41a6-b05a-338de2f89d3a'),
      undefined,
    );
    assert.equal(sanitizeNotificationReference('INV-402'), 'INV-402');
  });
});
