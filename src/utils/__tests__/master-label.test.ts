/**
 * Grade Master category labels (S-14).
 * Run: npx tsx --test src/utils/__tests__/master-label.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  formatCategoryDisplayName,
  humanizeMasterLabel,
  isInternalMasterCode,
} from '../master-label.ts';

describe('formatCategoryDisplayName (S-14)', () => {
  it('humanizes snake_case codes like BUTYL_GLYCOL', () => {
    assert.equal(formatCategoryDisplayName('BUTYL_GLYCOL'), 'Butyl Glycol');
    assert.equal(formatCategoryDisplayName(null, 'BUTYL_GLYCOL'), 'Butyl Glycol');
    assert.equal(humanizeMasterLabel('BASE_OIL'), 'Base Oil');
    assert.equal(humanizeMasterLabel('HR_PIB'), 'HR PIB');
  });

  it('leaves clean names and acronyms unchanged', () => {
    assert.equal(formatCategoryDisplayName('Base Oil'), 'Base Oil');
    assert.equal(formatCategoryDisplayName('ABS'), 'ABS');
    assert.equal(formatCategoryDisplayName('ACETONE'), 'ACETONE');
    assert.equal(formatCategoryDisplayName('BOPP'), 'BOPP');
  });

  it('detects internal master codes', () => {
    assert.equal(isInternalMasterCode('BUTYL_GLYCOL'), true);
    assert.equal(isInternalMasterCode('ABS'), false);
    assert.equal(isInternalMasterCode('Base Oil'), false);
  });
});
