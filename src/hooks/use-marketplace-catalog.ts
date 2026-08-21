import { useEffect, useMemo, useState } from 'react';

import { MARKET_PRODUCTS } from '@/constants/marketProducts';
import {
  getPublishedMarketProducts,
  hydratePublishedMarketProducts,
} from '@/services/cxPublishedFeed';
import { getActiveMarketplaceListings } from '@/seller/modules/seller-offers/services/sellerOffersService';
import { useSellerOffersStore } from '@/seller/modules/seller-offers/store/sellerOffersStore';
import type { MarketProduct } from '@/types/market';

export const useMarketplaceCatalog = (): MarketProduct[] => {
  const offers = useSellerOffersStore((state) => state.offers);
  const isHydrated = useSellerOffersStore((state) => state.isHydrated);
  const [published, setPublished] = useState<MarketProduct[]>(getPublishedMarketProducts);

  useEffect(() => {
    void hydratePublishedMarketProducts().then(setPublished);
  }, []);

  return useMemo(() => {
    const publishedIds = new Set(published.map((product) => product.id));
    const base = published.length
      ? [...published, ...MARKET_PRODUCTS.filter((product) => !publishedIds.has(product.id))]
      : MARKET_PRODUCTS;

    if (!isHydrated) {
      return base;
    }

    const sellerListings = getActiveMarketplaceListings(offers);
    const staticIds = new Set(base.map((product) => product.id));
    const uniqueSellerListings = sellerListings.filter((listing) => !staticIds.has(listing.id));

    return [...uniqueSellerListings, ...base];
  }, [isHydrated, offers, published]);
};
