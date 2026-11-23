/**
 * Run: npx tsx --test src/navigation/__tests__/post-auth-route.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getLoggedInRoute } from '../post-auth-route';
import { buildNotificationsHref, resolvePostAuthHref } from '../return-to';

describe('getLoggedInRoute', () => {
  it('sends approved KYC users to home', () => {
    assert.equal(
      getLoggedInRoute({ kycApproved: true, reviewSubmitted: false }),
      '/(customer)/(tabs)/home',
    );
  });

  it('sends submitted-but-unapproved users to application status', () => {
    assert.equal(
      getLoggedInRoute({ kycApproved: false, reviewSubmitted: true }),
      '/(auth)/application-submitted',
    );
  });

  it('does not restart Business Information when KYC status is unknown', () => {
    assert.equal(
      getLoggedInRoute({
        kycApproved: false,
        reviewSubmitted: false,
        kycStatusUnknown: true,
      }),
      '/(auth)/application-submitted',
    );
  });

  it('starts incomplete new users on Business Information', () => {
    assert.equal(
      getLoggedInRoute({ kycApproved: false, reviewSubmitted: false }),
      '/(auth)/business-information',
    );
  });
});

describe('resolvePostAuthHref', () => {
  it('honours safe returnTo only when KYC is approved', () => {
    assert.equal(
      resolvePostAuthHref({
        returnTo: '/(customer)/notifications',
        kycApproved: true,
        reviewSubmitted: false,
      }),
      '/(customer)/notifications',
    );
    assert.equal(
      resolvePostAuthHref({
        returnTo: '/(customer)/notifications',
        kycApproved: false,
        reviewSubmitted: false,
      }),
      '/(auth)/business-information',
    );
  });
});

describe('buildNotificationsHref', () => {
  it('sends logged-out users straight to login with returnTo', () => {
    const href = buildNotificationsHref(false) as {
      pathname?: string;
      params?: { returnTo?: string };
    };
    assert.equal(href.pathname, '/(auth)/customer-login');
    assert.equal(href.params?.returnTo, '/(customer)/notifications');
  });

  it('sends logged-in users to notifications', () => {
    assert.equal(buildNotificationsHref(true), '/(customer)/notifications');
  });
});
