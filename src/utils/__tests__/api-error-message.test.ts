import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import axios from 'axios';

import { getApiErrorMessage } from '../api-error-message.ts';

describe('getApiErrorMessage', () => {
  it('prefers backend string messages over axios defaults', () => {
    const error = new axios.AxiosError(
      'Request failed with status code 400',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as never,
        data: { message: 'Cannot pause offer in status DRAFT' },
      },
    );
    assert.equal(getApiErrorMessage(error), 'Cannot pause offer in status DRAFT');
  });

  it('joins Nest validation message arrays', () => {
    const error = new axios.AxiosError(
      'Request failed with status code 400',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as never,
        data: { message: ['Validation failed (uuid is expected)'] },
      },
    );
    assert.equal(getApiErrorMessage(error), 'Validation failed (uuid is expected)');
  });
});
