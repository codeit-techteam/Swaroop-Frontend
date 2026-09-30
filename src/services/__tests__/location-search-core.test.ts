/**
 * Shared location-search contract helpers.
 * Run: npx tsx --test src/services/__tests__/location-search-core.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { AxiosError, AxiosHeaders, CanceledError } from 'axios';

import {
  createSessionToken,
  formatDistance,
  isAbortError,
  isLocationServiceDown,
  LocationServiceError,
  toLocationError,
} from '../location-search-core.ts';

const SESSION_TOKEN = /^[A-Za-z0-9_-]{8,36}$/;

function axiosErrorWith(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, null, {
    status,
    statusText: '',
    headers: {},
    config,
    data,
  });
}

describe('createSessionToken', () => {
  it('produces tokens accepted by the backend validator', () => {
    const tokens = new Set(Array.from({ length: 50 }, () => createSessionToken()));
    assert.equal(tokens.size, 50);
    for (const token of tokens) assert.match(token, SESSION_TOKEN);
  });
});

describe('formatDistance', () => {
  it('formats metres and kilometres', () => {
    assert.equal(formatDistance(3), '1 m');
    assert.equal(formatDistance(347), '350 m');
    assert.equal(formatDistance(1250), '1.3 km');
    assert.equal(formatDistance(23_400), '23 km');
  });

  it('returns an empty label for missing values', () => {
    assert.equal(formatDistance(null), '');
    assert.equal(formatDistance(undefined), '');
    assert.equal(formatDistance(Number.NaN), '');
  });
});

describe('toLocationError', () => {
  it('keeps known backend error codes and messages', () => {
    const error = toLocationError(
      axiosErrorWith(503, { code: 'GOOGLE_API_UNAVAILABLE', message: 'Try later.' }),
      'AUTOCOMPLETE_FAILED',
    );
    assert.equal(error.code, 'GOOGLE_API_UNAVAILABLE');
    assert.equal(error.message, 'Try later.');
    assert.equal(isLocationServiceDown(error), true);
  });

  it('never surfaces unknown upstream details', () => {
    const error = toLocationError(
      axiosErrorWith(500, { code: 'REQUEST_DENIED', message: 'API key invalid: AIza…' }),
      'GEOCODING_FAILED',
    );
    assert.equal(error.code, 'GEOCODING_FAILED');
    assert.doesNotMatch(error.message, /AIza/);
  });

  it('maps HTTP 429 to the rate-limit code', () => {
    assert.equal(
      toLocationError(axiosErrorWith(429, {}), 'AUTOCOMPLETE_FAILED').code,
      'LOCATION_RATE_LIMITED',
    );
  });

  it('maps missing responses to NETWORK_ERROR', () => {
    const offline = new AxiosError('Network Error', 'ERR_NETWORK');
    assert.equal(toLocationError(offline, 'AUTOCOMPLETE_FAILED').code, 'NETWORK_ERROR');
  });

  it('passes through existing LocationServiceErrors', () => {
    const original = new LocationServiceError('PLACE_NOT_FOUND');
    assert.equal(toLocationError(original, 'AUTOCOMPLETE_FAILED'), original);
    assert.equal(isLocationServiceDown(original), false);
  });
});

describe('isAbortError', () => {
  it('recognises cancelled requests', () => {
    assert.equal(isAbortError(new CanceledError()), true);
    const abort = new Error('aborted');
    abort.name = 'AbortError';
    assert.equal(isAbortError(abort), true);
    assert.equal(isAbortError(new Error('boom')), false);
  });
});
