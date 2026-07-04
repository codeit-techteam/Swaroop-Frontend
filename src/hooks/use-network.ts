import { useEffect } from 'react';

import * as Network from 'expo-network';

import { useNetworkStore } from '@/store/network-store';
import { logger } from '@/utils/logger';

export const useNetworkListener = (): void => {
  const setNetworkStatus = useNetworkStore((state) => state.setNetworkStatus);

  useEffect(() => {
    const checkNetwork = async (): Promise<void> => {
      try {
        const state = await Network.getNetworkStateAsync();
        setNetworkStatus({
          isConnected: state.isConnected ?? false,
          isInternetReachable: state.isInternetReachable ?? null,
        });
      } catch (error) {
        logger.error('Network listener error', error);
      }
    };

    void checkNetwork();

    const intervalId = setInterval(() => {
      void checkNetwork();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [setNetworkStatus]);
};

export const useIsOnline = (): boolean => {
  const isConnected = useNetworkStore((state) => state.isConnected);
  const isInternetReachable = useNetworkStore((state) => state.isInternetReachable);
  return isConnected && isInternetReachable !== false;
};
