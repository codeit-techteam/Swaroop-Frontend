import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isFcmRegistrationToken, isLegacyExpoPushToken } from '../fcm-token.ts';

describe('FCM device tokens', () => {
  it('accepts a native FCM token and rejects an Expo push token', () => {
    assert.equal(isFcmRegistrationToken(`${'a'.repeat(20)}:${'b'.repeat(40)}`), true);
    assert.equal(isFcmRegistrationToken('ExponentPushToken[abc]'), false);
    assert.equal(isLegacyExpoPushToken('ExponentPushToken[abc]'), true);
    assert.equal(isFcmRegistrationToken('short'), false);
  });
});
