import { useIsOnline } from '@/hooks/use-network';
import { isMockOffline } from '@/seller/services/settingsService';

export function useSellerOffline(): boolean {
  const isOnline = useIsOnline();
  const mockOffline = isMockOffline();
  return mockOffline || !isOnline;
}
