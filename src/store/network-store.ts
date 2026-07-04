import { create } from 'zustand';

import type { NetworkStore } from '@/types/store';

export const useNetworkStore = create<NetworkStore>((set) => ({
  isConnected: true,
  isInternetReachable: true,
  setNetworkStatus: (status) => set(status),
}));

export const selectIsConnected = (state: NetworkStore): boolean => state.isConnected;

export const selectIsInternetReachable = (state: NetworkStore): boolean | null =>
  state.isInternetReachable;
