import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  EMPTY_GRADE_REQUEST_FORM,
  decimalOnly,
  digitsOnly,
  normalizeIndianMobile,
  todayIso,
  validateGradeRequestForm,
  type GradeRequestFormValues,
} from '../grade-request-validation';

const NOW = new Date('2026-10-31T10:00:00');

const valid = (over: Partial<GradeRequestFormValues> = {}): GradeRequestFormValues => ({
  ...EMPTY_GRADE_REQUEST_FORM,
  gradeName: 'F4811',
  materialCategory: 'White Masterbatch',
  quantity: '25',
  deliveryLocation: 'Mundra, Gujarat',
  contactName: 'Asha Rao',
  contactPhone: '9876543210',
  ...over,
});

describe('validateGradeRequestForm', () => {
  it('accepts the minimal valid form', () => {
    assert.deepEqual(validateGradeRequestForm(valid(), NOW), {});
  });

  it('flags every missing required field', () => {
    const errors = validateGradeRequestForm(EMPTY_GRADE_REQUEST_FORM, NOW);
    assert.deepEqual(Object.keys(errors).sort(), [
      'contactName',
      'contactPhone',
      'deliveryLocation',
      'gradeName',
      'materialCategory',
      'quantity',
    ]);
  });

  it('rejects zero, negative and non-numeric quantities', () => {
    for (const q of ['0', '-5', 'abc', '', '.', '1000001']) {
      assert.ok(validateGradeRequestForm(valid({ quantity: q }), NOW).quantity, q);
    }
    assert.equal(validateGradeRequestForm(valid({ quantity: '0.5' }), NOW).quantity, undefined);
  });

  it('rejects past dates but allows today', () => {
    assert.ok(validateGradeRequestForm(valid({ requiredByDate: '2026-10-30' }), NOW).requiredByDate);
    assert.equal(
      validateGradeRequestForm(valid({ requiredByDate: '2026-10-31' }), NOW).requiredByDate,
      undefined,
    );
    assert.ok(validateGradeRequestForm(valid({ requiredByDate: '31/10/2026' }), NOW).requiredByDate);
  });

  it('validates pincode, phone and email', () => {
    assert.ok(validateGradeRequestForm(valid({ deliveryPincode: '12345' }), NOW).deliveryPincode);
    assert.ok(validateGradeRequestForm(valid({ deliveryPincode: '012345' }), NOW).deliveryPincode);
    assert.equal(validateGradeRequestForm(valid({ deliveryPincode: '370421' }), NOW).deliveryPincode, undefined);
    assert.ok(validateGradeRequestForm(valid({ contactPhone: '1234567890' }), NOW).contactPhone);
    assert.ok(validateGradeRequestForm(valid({ contactEmail: 'nope' }), NOW).contactEmail);
  });
});

describe('input helpers', () => {
  it('digitsOnly strips letters and caps length', () => {
    assert.equal(digitsOnly('98a76-54321 0999', 10), '9876543210');
  });
  it('decimalOnly keeps a single decimal point', () => {
    assert.equal(decimalOnly('1.2.3a'), '1.23');
    assert.equal(decimalOnly('abc'), '');
  });
  it('normalizeIndianMobile accepts +91 and spaces', () => {
    assert.equal(normalizeIndianMobile('+91 98765 43210'), '9876543210');
    assert.equal(normalizeIndianMobile('5876543210'), null);
  });
  it('todayIso is zero padded local date', () => {
    assert.equal(todayIso(new Date('2026-01-05T10:00:00')), '2026-01-05');
  });
});
