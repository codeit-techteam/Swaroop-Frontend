import type { StoreApi } from 'zustand';

import { useAddressStore } from '@/store/address-store';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useCheckoutStore } from '@/store/checkout-store';
import { useCustomerKycOverviewStore } from '@/store/customer-kyc-overview-store';
import { useDocumentsStore } from '@/store/documents-store';
import { useNotificationStore } from '@/store/notification-store';
import { useOrderStore } from '@/store/order-store';
import { usePaymentStore } from '@/store/payment-store';

function resetStore<T>(store: Pick<StoreApi<T>, 'setState' | 'getInitialState'>): void {
  store.setState(store.getInitialState(), true);
}

/** Puts every in-memory store holding account data back to its initial state. */
export function resetUserScopedState(): void {
  useCustomerKycOverviewStore.getState().reset();
  resetStore(useAddressStore);
  resetStore(useCartStore);
  resetStore(useCheckoutStore);
  resetStore(useDocumentsStore);
  resetStore(useNotificationStore);
  resetStore(useOrderStore);
  resetStore(usePaymentStore);
}

/** Ends the session and clears this account's data from storage and memory. */
export async function signOut(): Promise<void> {
  resetUserScopedState();
  await useAuthStore.getState().logout();
}
