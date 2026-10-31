export type TierInputErrors = {
  minQty?: string;
  maxQty?: string;
  discount?: string;
  price?: string;
};

export const sanitizeDecimal = (value: string, maxDecimals = 2): string => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const [whole = '', ...rest] = cleaned.split('.');
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join('').slice(0, maxDecimals)}`;
};

/** A bulk slab must start above 0 MT, never overlap itself and have a positive price. */
export const validateTierInput = (input: {
  minQty: string;
  maxQty: string;
  discount: string;
  price: string;
}): TierInputErrors => {
  const errors: TierInputErrors = {};
  const min = Number(input.minQty);
  if (!input.minQty.trim() || !Number.isFinite(min) || min <= 0) {
    errors.minQty = 'Minimum quantity must be greater than 0.';
  }
  if (input.maxQty.trim()) {
    const max = Number(input.maxQty);
    if (!Number.isFinite(max) || max <= 0) {
      errors.maxQty = 'Maximum quantity must be greater than 0.';
    } else if (!errors.minQty && max < min) {
      errors.maxQty = 'Maximum quantity must be at least the minimum.';
    }
  }
  const discount = Number(input.discount || '0');
  if (!Number.isFinite(discount) || discount < 0 || discount >= 100) {
    errors.discount = 'Discount must be between 0 and 99.99%.';
  }
  const price = Number(input.price);
  if (!input.price.trim() || !Number.isFinite(price) || price <= 0) {
    errors.price = 'Price must be greater than 0.';
  }
  return errors;
};
