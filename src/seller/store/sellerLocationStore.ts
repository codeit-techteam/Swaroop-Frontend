import { create } from 'zustand';

import {
  fetchSellerLocations,
  fetchCurrentSellerLocation,
  setCurrentSellerLocation,
  type SellerLocation,
} from '@/services/seller-locations';
import { logger } from '@/utils/logger';

type SellerLocationStore = {
  locations: SellerLocation[];
  currentLocationId: string | null;
  isHydrated: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  selectLocation: (locationId: string) => Promise<void>;
};

export const useSellerLocationStore = create<SellerLocationStore>((set, get) => ({
  locations: [],
  currentLocationId: null,
  isHydrated: false,
  error: null,

  hydrate: async () => {
    try {
      const currentPayload = await fetchCurrentSellerLocation().catch(async () => {
        const locations = await fetchSellerLocations();
        return { current: locations[0] ?? null, locations };
      });
      const locations =
        currentPayload.locations.length > 0
          ? currentPayload.locations
          : await fetchSellerLocations();
      set({
        locations,
        currentLocationId: currentPayload.current?.id ?? locations[0]?.id ?? null,
        isHydrated: true,
        error: null,
      });
    } catch (error) {
      logger.warn('Seller locations hydrate failed', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      set({
        locations: [],
        currentLocationId: null,
        isHydrated: true,
        error: error instanceof Error ? error.message : 'Failed to load locations',
      });
    }
  },

  refresh: async () => {
    await get().hydrate();
  },

  selectLocation: async (locationId: string) => {
    try {
      await setCurrentSellerLocation(locationId);
      set({ currentLocationId: locationId, error: null });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to set location',
      });
      throw error;
    }
  },
}));
