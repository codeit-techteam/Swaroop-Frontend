export const UTR_MIN_LENGTH = 12;

export const UTR_MAX_LENGTH = 16;

const UTR_PATTERN = /^[A-Z0-9]+$/;

export const normalizeUtr = (value: string): string => value.replace(/\s+/g, '').toUpperCase();

export const isValidUtr = (value: string): boolean => {
  const normalized = normalizeUtr(value);
  if (normalized.length < UTR_MIN_LENGTH || normalized.length > UTR_MAX_LENGTH) {
    return false;
  }
  return UTR_PATTERN.test(normalized);
};

export const getUtrValidationError = (value: string): string | undefined => {
  const normalized = normalizeUtr(value);
  if (!normalized) {
    return 'Transaction / UTR number is required';
  }
  if (normalized.length < UTR_MIN_LENGTH || normalized.length > UTR_MAX_LENGTH) {
    return `UTR must be ${UTR_MIN_LENGTH} to ${UTR_MAX_LENGTH} characters`;
  }
  if (!UTR_PATTERN.test(normalized)) {
    return 'UTR can only contain letters and numbers';
  }
  return undefined;
};

export const generateOrderId = (): string => {
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `PT-ORD-${suffix}`;
};

export const formatReceiptSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
