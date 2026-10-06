import { create } from 'zustand';

import type { CustomerKycOverview } from '@/services/customer-kyc';

type OverviewStatus = 'idle' | 'loading' | 'ready' | 'error';

type CustomerKycOverviewStore = {
  /** Last backend response. Memory only: never persisted, cleared on logout. */
  overview: CustomerKycOverview | null;
  status: OverviewStatus;
  error: string | null;
  /** Bumped on reset so a request started before logout cannot write afterwards. */
  generation: number;
  setLoading: () => void;
  setOverview: (overview: CustomerKycOverview) => void;
  setError: (message: string) => void;
  reset: () => void;
};

export const useCustomerKycOverviewStore = create<CustomerKycOverviewStore>((set) => ({
  overview: null,
  status: 'idle',
  error: null,
  generation: 0,
  setLoading: () => set({ status: 'loading', error: null }),
  setOverview: (overview) => set({ overview, status: 'ready', error: null }),
  setError: (error) => set({ status: 'error', error }),
  reset: () =>
    set((state) => ({
      overview: null,
      status: 'idle',
      error: null,
      generation: state.generation + 1,
    })),
}));
