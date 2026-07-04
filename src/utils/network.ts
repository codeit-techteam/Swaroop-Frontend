import * as Network from 'expo-network';

import type { NetworkStatus } from '@/types';
import { logger } from '@/utils/logger';

export const getNetworkStatus = async (): Promise<NetworkStatus> => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return {
      isConnected: networkState.isConnected ?? false,
      isInternetReachable: networkState.isInternetReachable ?? null,
    };
  } catch (error) {
    logger.error('Failed to get network status', error);
    return {
      isConnected: false,
      isInternetReachable: null,
    };
  }
};

export const isOnline = async (): Promise<boolean> => {
  const status = await getNetworkStatus();
  return status.isConnected && status.isInternetReachable !== false;
};

export const getIpAddress = async (): Promise<string | null> => {
  try {
    return await Network.getIpAddressAsync();
  } catch (error) {
    logger.error('Failed to get IP address', error);
    return null;
  }
};
