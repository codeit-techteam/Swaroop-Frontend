import { type ReactNode, useEffect, useState } from 'react';

import { ActivityIndicator, View } from 'react-native';

import * as SplashScreen from 'expo-splash-screen';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/error-boundary';
import { AppDialogHost } from '@/components/ui/app-dialog';
import { AppToastHost } from '@/components/ui/app-toast';
import { useNetworkListener } from '@/hooks/use-network';
import { queryClient } from '@/lib/query-client';
import { ThemeProvider } from '@/providers/theme-provider';
import { useDispatchStore } from '@/seller/modules/dispatch/store/dispatchStore';
import { useSellerOffersStore } from '@/seller/modules/seller-offers/store/sellerOffersStore';
import { useSellerOrdersStore } from '@/seller/modules/seller-orders/store/sellerOrdersStore';
import { useSettlementStore } from '@/seller/modules/settlement-payout/store/settlementStore';
import { useInventoryStore } from '@/seller/store/inventoryStore';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';
import { useSellerStore } from '@/seller/store/sellerStore';
import { applyDevResetIfNeeded } from '@/services/dev-reset';
import { configureNotifications } from '@/services/notification-service';
import { useAddressStore } from '@/store/address-store';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useKycStore } from '@/store/kyc-store';
import { useOrderStore } from '@/store/order-store';
import { usePaymentStore } from '@/store/payment-store';
import { brandColors } from '@/theme/colors';
import { hydrateSecureStorage } from '@/utils/storage';

type AppProvidersProps = {
  children: ReactNode;
};

const NetworkListener = (): null => {
  useNetworkListener();
  return null;
};

const NotificationConfigurator = (): null => {
  useEffect(() => {
    configureNotifications();
  }, []);

  return null;
};

const BootLoadingScreen = (): ReactNode => (
  <View
    style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brandColors.white,
    }}
  >
    <ActivityIndicator size="large" color={brandColors.primary} />
  </View>
);

export const AppProviders = ({ children }: AppProvidersProps) => {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });
  const [sessionReady, setSessionReady] = useState(false);
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const hydrateKyc = useKycStore((state) => state.hydrateKyc);
  const hydrateCart = useCartStore((state) => state.hydrateCart);
  const hydrateAddresses = useAddressStore((state) => state.hydrate);
  const hydratePayment = usePaymentStore((state) => state.hydratePayment);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);
  const hydrateSellerSession = useSellerStore((state) => state.hydrateSellerSession);
  const hydrateProductState = useSellerProductStore((state) => state.hydrateProductState);
  const hydrateInventoryState = useInventoryStore((state) => state.hydrateInventoryState);
  const hydrateDispatchState = useDispatchStore((state) => state.hydrateDispatchState);
  const hydrateSellerOrdersState = useSellerOrdersStore((state) => state.hydrateSellerOrdersState);
  const hydrateSellerOffersState = useSellerOffersStore((state) => state.hydrateSellerOffersState);
  const hydrateSettlementState = useSettlementStore((state) => state.hydrateSettlementState);

  const fontsReady = fontsLoaded || Boolean(fontError);
  const appReady = fontsReady && sessionReady;

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        await hydrateSecureStorage();
        if (!active) {
          return;
        }
        await applyDevResetIfNeeded();
        if (!active) {
          return;
        }
        hydrateSession();
        hydrateKyc();
        hydrateCart();
        hydrateAddresses();
        hydratePayment();
        hydrateOrder();

        const selectedRole = useAuthStore.getState().selectedRole;
        const isSellerSession = selectedRole === 'seller';

        // Local seller mock/session stores are cheap; keep them available for role switch.
        hydrateSellerSession();
        hydrateProductState();
        hydrateInventoryState();
        hydrateDispatchState();
        hydrateSellerOffersState();
        hydrateSettlementState();

        // Seller purchase-orders API requires a seller profile — never call it on customer sessions.
        if (isSellerSession) {
          hydrateSellerOrdersState();
        }
      } finally {
        if (active) {
          setSessionReady(true);
        }
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [
    hydrateAddresses,
    hydrateCart,
    hydrateKyc,
    hydrateInventoryState,
    hydrateDispatchState,
    hydrateSellerOrdersState,
    hydrateOrder,
    hydratePayment,
    hydrateSettlementState,
    hydrateProductState,
    hydrateSellerSession,
    hydrateSession,
  ]);

  useEffect(() => {
    if (appReady) {
      void SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return <BootLoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <KeyboardProvider>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider>
                <BottomSheetModalProvider>
                  <NetworkListener />
                  <NotificationConfigurator />
                  {children}
                  <AppDialogHost />
                  <AppToastHost />
                </BottomSheetModalProvider>
              </ThemeProvider>
            </QueryClientProvider>
          </KeyboardProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};
