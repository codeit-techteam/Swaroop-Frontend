import { useMemo } from 'react';

import { MARKET_PRODUCTS } from '@/constants/marketProducts';
import { getActiveMarketplaceListings } from '@/seller/modules/seller-offers/services/sellerOffersService';
import { useSellerOffersStore } from '@/seller/modules/seller-offers/store/sellerOffersStore';
import type { MarketProduct } from '@/types/market';

export const useMarketplaceCatalog = (): MarketProduct[] => {
  const offers = useSellerOffersStore((state) => state.offers);
  const isHydrated = useSellerOffersStore((state) => state.isHydrated);

  return useMemo(() => {
    if (!isHydrated) {
      return MARKET_PRODUCTS;
    }

    const sellerListings = getActiveMarketplaceListings(offers);
    const staticIds = new Set(MARKET_PRODUCTS.map((product) => product.id));
    const uniqueSellerListings = sellerListings.filter((listing) => !staticIds.has(listing.id));

    return [...uniqueSellerListings, ...MARKET_PRODUCTS];
  }, [isHydrated, offers]);
};
