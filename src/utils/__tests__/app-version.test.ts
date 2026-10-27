import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatAppVersionLabel } from '../app-version-label';

describe('formatAppVersionLabel', () => {
  it('shows version and build code from the binary', () => {
    assert.equal(
      formatAppVersionLabel({ version: '3.1.1', build: '3112' }),
      'Version 3.1.1 (3112)',
    );
  });

  it('omits the build when it is missing or identical to the version', () => {
    assert.equal(formatAppVersionLabel({ version: '3.1.1', build: null }), 'Version 3.1.1');
    assert.equal(formatAppVersionLabel({ version: '3.1.1', build: '3.1.1' }), 'Version 3.1.1');
  });

  it('never prints a hardcoded placeholder version', () => {
    const label = formatAppVersionLabel({ version: null, build: null });
    assert.equal(label, 'Version unknown');
    assert.ok(!label.includes('1.0.0'));
    assert.ok(!label.includes('rc'));
  });
});
