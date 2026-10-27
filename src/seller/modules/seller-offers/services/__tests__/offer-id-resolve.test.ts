import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isOfferBackendId, resolveOfferBackendId } from '../offer-id.ts';

const sampleOffer = {
  id: 'e6c39658-8a4b-45d4-bd28-693625e37b21',
  offerId: 'OFFER-CAT-PC-CL-210',
};

describe('resolveOfferBackendId', () => {
  it('accepts backend UUIDs directly', () => {
    assert.equal(isOfferBackendId(sampleOffer.id), true);
    assert.equal(resolveOfferBackendId(sampleOffer.id, [sampleOffer]), sampleOffer.id);
  });

  it('resolves display reference numbers to the UUID', () => {
    assert.equal(
      resolveOfferBackendId('OFFER-CAT-PC-CL-210', [sampleOffer]),
      sampleOffer.id,
    );
  });

  it('rejects unknown non-UUID identifiers', () => {
    assert.throws(
      () => resolveOfferBackendId('OFFER-2026-557562', [sampleOffer]),
      /missing a valid server id/i,
    );
  });
});
