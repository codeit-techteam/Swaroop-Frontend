import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  EMPTY_MOBILE_MESSAGE,
  indianMobileFieldError,
  isCompleteIndianMobile,
  sanitizeIndianMobileInput,
} from '../phone-input';

describe('sanitizeIndianMobileInput', () => {
  it('strips non-digits and caps at 10', () => {
    assert.equal(sanitizeIndianMobileInput('+91 98765-43210abc'), '9198765432');
    assert.equal(sanitizeIndianMobileInput('9'), '9');
  });
});

describe('indianMobileFieldError', () => {
  it('does not show an error after a single digit while typing', () => {
    assert.equal(
      indianMobileFieldError('9', { editing: true, touched: false, submitted: false }),
      undefined,
    );
    assert.equal(
      indianMobileFieldError('9', { editing: false, touched: false, submitted: false }),
      undefined,
    );
  });

  it('does not show an incomplete error on blur alone', () => {
    assert.equal(
      indianMobileFieldError('987', { editing: false, touched: true, submitted: false }),
      undefined,
    );
  });

  it('shows a clear empty-field message after GET OTP with no number (L-06)', () => {
    assert.equal(
      indianMobileFieldError('', { editing: false, submitted: true }),
      EMPTY_MOBILE_MESSAGE,
    );
    assert.equal(EMPTY_MOBILE_MESSAGE, 'Please enter your mobile number');
  });

  it('shows incomplete error only after submit', () => {
    assert.equal(
      indianMobileFieldError('987', { editing: false, submitted: true }),
      'Enter the full 10-digit mobile number.',
    );
  });

  it('shows format error once 10 digits are present', () => {
    assert.equal(
      indianMobileFieldError('5123456789', { editing: true }),
      'Enter a valid 10-digit Indian mobile number',
    );
  });

  it('accepts a complete Indian mobile', () => {
    assert.equal(indianMobileFieldError('9876543210'), undefined);
    assert.equal(isCompleteIndianMobile('9876543210'), true);
    assert.equal(isCompleteIndianMobile('9'), false);
  });
});
