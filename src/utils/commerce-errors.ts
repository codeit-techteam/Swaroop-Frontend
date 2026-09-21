export type CommerceErrorCopy = {
  code: string;
  title: string;
  message: string;
};

const COPY: Record<string, Omit<CommerceErrorCopy, 'code'>> = {
  PRODUCT_UNAVAILABLE: {
    title: 'Product unavailable',
    message: 'Product is currently unavailable.',
  },
  PRODUCT_NOT_AVAILABLE: {
    title: 'Product unavailable',
    message: 'Product is currently unavailable.',
  },
  OFFER_EXPIRED: {
    title: 'Offer unavailable',
    message: 'This offer is no longer available.',
  },
  OFFER_NOT_ACTIVE: {
    title: 'Offer unavailable',
    message: 'This offer is no longer available.',
  },
  OFFER_NOT_FOUND: {
    title: 'Offer unavailable',
    message: 'This offer is no longer available.',
  },
  INSUFFICIENT_STOCK: {
    title: 'Quantity updated',
    message: 'Available quantity has changed. Please review your quantity.',
  },
  QUANTITY_EXCEEDS_AVAILABILITY: {
    title: 'Quantity updated',
    message: 'Available quantity has changed. Please review your quantity.',
  },
  INSUFFICIENT_INVENTORY: {
    title: 'Quantity updated',
    message: 'Available quantity has changed. Please review your quantity.',
  },
  MOQ_VIOLATION: {
    title: 'Minimum quantity changed',
    message: 'Minimum order quantity has changed.',
  },
  QUANTITY_BELOW_MOQ: {
    title: 'Minimum quantity changed',
    message: 'Minimum order quantity has changed.',
  },
  MOQ_NOT_MET: {
    title: 'Minimum quantity changed',
    message: 'Minimum order quantity has changed.',
  },
  PRICE_CHANGED: {
    title: 'Price Updated',
    message: 'Latest market price has been updated.',
  },
  QUOTE_CHANGED: {
    title: 'Price Updated',
    message: 'Latest market price has been updated.',
  },
  QUOTE_EXPIRED: {
    title: 'Price Quote Expired',
    message: 'Pricing has been refreshed because the previous quote is no longer valid.',
  },
  CREDIT_NOT_ELIGIBLE: {
    title: 'Credit unavailable',
    message: 'Credit payment is currently unavailable for your account.',
  },
  CREDIT_LIMIT_EXCEEDED: {
    title: 'Credit limit exceeded',
    message: 'Requested amount exceeds your available PetroTrade credit.',
  },
  NETWORK_ERROR: {
    title: 'Unable to refresh pricing',
    message: 'Unable to refresh pricing. Please check your connection and try again.',
  },
  UNKNOWN_ERROR: {
    title: 'Something went wrong',
    message: 'Something went wrong. Please try again.',
  },
  CART_EMPTY: {
    title: 'Cart is empty',
    message: 'Add a product from the marketplace to continue.',
  },
  NO_MATCHING_SELLER: {
    title: 'Unable to fulfil',
    message: 'No seller can currently fulfil this quantity.',
  },
};

export function commerceErrorCopy(
  code?: string | null,
  fallbackMessage = 'Something went wrong. Please try again.',
): CommerceErrorCopy {
  const key = (code ?? 'UNKNOWN_ERROR').toUpperCase();
  const match = COPY[key] ?? {
    title: 'Something went wrong',
    message: fallbackMessage,
  };
  return { code: key, ...match };
}

export function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const maybe = error as { message?: string; code?: string; isAxiosError?: boolean };
  if (maybe.code === 'ERR_NETWORK' || maybe.code === 'ECONNABORTED') {
    return true;
  }
  const message = maybe.message?.toLowerCase() ?? '';
  return message.includes('network') || message.includes('timeout');
}
