import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveCustomerBannerAction } from '../cms-banner-resolve';

const MARKET = '/(customer)/(tabs)/market';
const GRADES = '/(customer)/grades';
const PR_CREATE = '/(customer)/purchase-requests/create';
const PRODUCT = '/(customer)/product/[id]';

describe('resolveCustomerBannerAction (B-02)', () => {
  it('OPEN_PURCHASE_REQUEST without target opens create-PR entry, not market/grades', () => {
    const target = resolveCustomerBannerAction({ action: 'OPEN_PURCHASE_REQUEST' });
    assert.ok(target);
    assert.equal(target.type, 'route');
    if (target.type === 'route') {
      assert.equal(target.href, PR_CREATE);
      assert.notEqual(target.href, MARKET);
      assert.notEqual(target.href, GRADES);
    }
  });

  it('OPEN_PURCHASE_REQUEST with targetId opens product details in RFQ mode', () => {
    const target = resolveCustomerBannerAction({
      action: 'OPEN_PURCHASE_REQUEST',
      targetId: 'prod-123',
    });
    assert.ok(target);
    assert.equal(target.type, 'route');
    if (target.type === 'route') {
      assert.deepEqual(target.href, {
        pathname: PRODUCT,
        params: { id: 'prod-123', rfq: '1' },
      });
    }
  });

  it('OPEN_MARKETPLACE still opens the market tab', () => {
    const target = resolveCustomerBannerAction({ action: 'OPEN_MARKETPLACE' });
    assert.ok(target);
    assert.equal(target.type, 'route');
    if (target.type === 'route') {
      assert.equal(target.href, MARKET);
    }
  });

  it('purchase-request targetRoute opens create-PR entry, not grade catalogue', () => {
    const target = resolveCustomerBannerAction({
      action: 'NO_ACTION',
      targetRoute: '/purchase-requests/create',
    });
    assert.ok(target);
    assert.equal(target.type, 'route');
    if (target.type === 'route') {
      assert.equal(target.href, PR_CREATE);
    }
  });
});
