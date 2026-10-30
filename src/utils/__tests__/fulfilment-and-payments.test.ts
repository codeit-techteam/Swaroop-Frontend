import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mapBackendPaymentOptions } from '../map-backend-payment-options.ts';
import {
  deliveryEstimateCopy,
  dispatchWindowCopy,
  hasDestinationPincode,
} from '../../types/fulfilment.ts';
import {
  CREDIT_LOAD_ERROR,
  GUEST_CREDIT_ACCESS,
  guestCreditAccess,
  shouldRenderCreditInfo,
} from '../../types/payment-eligibility.ts';

describe('deliveryEstimateCopy', () => {
  it('uses seller delivery terms when present', () => {
    const copy = deliveryEstimateCopy({
      fulfilment: {
        warehouse: { label: 'Bhiwandi', city: 'Bhiwandi', state: 'Maharashtra' },
        origin: 'India',
        dispatchWindow: { label: '24 Hours', source: 'OFFER_METADATA' },
        deliveryEstimate: { label: '4–6 Business Days', source: 'SELLER_TERMS' },
        destinationAware: false,
        hsnCode: null,
      },
      destinationPincode: null,
    });
    assert.equal(copy.status, 'ready');
    assert.equal(copy.label, '4–6 Business Days');
  });

  it('asks for a pincode instead of inventing a timeline', () => {
    const copy = deliveryEstimateCopy({
      fulfilment: {
        warehouse: { label: 'Bhiwandi', city: 'Bhiwandi', state: null },
        origin: 'India',
        dispatchWindow: null,
        deliveryEstimate: null,
        destinationAware: false,
        hsnCode: null,
      },
      destinationPincode: null,
    });
    assert.equal(copy.status, 'need_pincode');
    assert.equal(copy.label, 'Enter delivery pincode for an estimate.');
    assert.equal(dispatchWindowCopy(null), 'Dispatch time unavailable');
  });

  it('shows unavailable when a pincode is present but the backend has no ETA', () => {
    const copy = deliveryEstimateCopy({
      fulfilment: {
        warehouse: null,
        origin: null,
        dispatchWindow: null,
        deliveryEstimate: null,
        destinationAware: false,
        hsnCode: null,
      },
      destinationPincode: '400001',
    });
    assert.equal(copy.status, 'unavailable');
    assert.equal(copy.label, 'Delivery estimate unavailable');
    assert.equal(hasDestinationPincode('400001'), true);
    assert.equal(hasDestinationPincode('12'), false);
  });
});

describe('mapBackendPaymentOptions', () => {
  it('keeps locked credit tenures visible so buyers can Request Credit', () => {
    const mapped = mapBackendPaymentOptions([
      {
        paymentOption: 'ADVANCE',
        title: 'Advance',
        description: 'Pay against PI',
        benefitLabel: 'Save 5% with advance payment',
        eligible: true,
        discountBps: 500,
      },
      {
        paymentOption: 'CREDIT_15',
        title: 'Credit 15 Days',
        description: 'Credit',
        benefitLabel: 'Request Credit to unlock',
        eligible: false,
        discountBps: 0,
      },
    ]);
    assert.deepEqual(
      mapped.map((row) => row.id),
      ['advance', 'credit_15'],
    );
    assert.equal(mapped[0]?.discountRate, 0.05);
    assert.equal(mapped[1]?.eligible, false);
    assert.equal(GUEST_CREDIT_ACCESS.cta?.type, 'REQUEST_CREDIT');
    assert.equal(GUEST_CREDIT_ACCESS.title, 'Business Credit Available');
    assert.equal(
      mapBackendPaymentOptions([
        { paymentOption: 'CREDIT_15', title: '', description: '', eligible: true, discountBps: 0 },
      ]).length,
      0,
    );
  });
});

describe('shouldRenderCreditInfo', () => {
  it('does not render a blank placeholder when product credit is unsupported', () => {
    assert.equal(
      shouldRenderCreditInfo({
        ...GUEST_CREDIT_ACCESS,
        productSupported: false,
        title: '',
        message: '',
        cta: null,
      }),
      false,
    );
    assert.equal(shouldRenderCreditInfo(GUEST_CREDIT_ACCESS), true);
    assert.equal(
      guestCreditAccess({ supported: false, tenureDays: [] }).productSupported,
      false,
    );
    assert.equal(
      shouldRenderCreditInfo(guestCreditAccess({ supported: false, tenureDays: [] })),
      false,
    );
    assert.equal(CREDIT_LOAD_ERROR.reason, 'CREDIT_STATUS_UNAVAILABLE');
    assert.equal(CREDIT_LOAD_ERROR.canApply, false);
  });
});
