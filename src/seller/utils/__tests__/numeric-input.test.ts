import {
  positiveOrEmpty,
  sanitizeDecimalInput,
  sanitizeIntegerInput,
} from '@/seller/utils/numeric-input';

describe('sanitizeIntegerInput', () => {
  it('strips leading zeros when typing over a default zero', () => {
    expect(sanitizeIntegerInput('010')).toBe('10');
    expect(sanitizeIntegerInput('0')).toBe('0');
    expect(sanitizeIntegerInput('')).toBe('');
    expect(sanitizeIntegerInput('12a3')).toBe('123');
  });
});

describe('sanitizeDecimalInput', () => {
  it('keeps a single decimal and strips leading zeros', () => {
    expect(sanitizeDecimalInput('010.5')).toBe('10.5');
    expect(sanitizeDecimalInput('0.5')).toBe('0.5');
    expect(sanitizeDecimalInput('.5')).toBe('0.5');
  });
});

describe('positiveOrEmpty', () => {
  it('returns empty for zero or invalid catalog defaults', () => {
    expect(positiveOrEmpty(0)).toBe('');
    expect(positiveOrEmpty('0')).toBe('');
    expect(positiveOrEmpty(25)).toBe('25');
  });
});
