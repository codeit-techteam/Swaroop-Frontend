type OfferIdentity = {
  id: string;
  offerId: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isOfferBackendId = (value?: string | null): value is string =>
  Boolean(value && UUID_RE.test(value.trim()));

/**
 * Mutations must use the backend UUID. Display refs (OFFER-…) are accepted and
 * resolved against the in-memory offer list when present.
 */
export const resolveOfferBackendId = (
  offerIdOrRef: string,
  offers: OfferIdentity[],
): string => {
  const key = offerIdOrRef.trim();
  if (!key) {
    throw new Error('Offer id is required.');
  }
  if (isOfferBackendId(key)) {
    return key;
  }
  const match = offers.find((offer) => offer.id === key || offer.offerId === key);
  if (match && isOfferBackendId(match.id)) {
    return match.id;
  }
  throw new Error(
    'This offer is missing a valid server id. Pull to refresh and try again.',
  );
};
