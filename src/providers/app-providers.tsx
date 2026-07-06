import { type ReactNode, useEffect, useState } from 'react';

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
import Toast from 'react-native-toast-message';

import { ErrorBoundary } from '@/components/error-boundary';
import { useNetworkListener } from '@/hooks/use-network';
import { queryClient } from '@/lib/query-client';
import { ThemeProvider } from '@/providers/theme-provider';
import { configureNotifications } from '@/services/notification-service';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useKycStore } from '@/store/kyc-store';
import { useOrderStore } from '@/store/order-store';
import { usePaymentStore } from '@/store/payment-store';
import { hydrateSecureStorage } from '@/utils/storage';

type AppProvidersProps = {
  children: ReactNode;
};

const NetworkListener = (): null => {
  useNetworkListener();
  return null;
};

const NotificationConfigurator = (): null => {
  configureNotifications();
  return null;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });
  const [sessionReady, setSessionReady] = useState(false);
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const hydrateKyc = useKycStore((state) => state.hydrateKyc);
  const hydrateCart = useCartStore((state) => state.hydrateCart);
  const hydratePayment = usePaymentStore((state) => state.hydratePayment);
  const hydrateOrder = useOrderStore((state) => state.hydrateOrder);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      await hydrateSecureStorage();
      if (!active) {
        return;
      }
      hydrateSession();
      hydrateKyc();
      hydrateCart();
      hydratePayment();
      hydrateOrder();
      setSessionReady(true);
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [hydrateCart, hydrateKyc, hydrateOrder, hydratePayment, hydrateSession]);

  if (!fontsLoaded || !sessionReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView className="flex-1">
        <SafeAreaProvider>
          <KeyboardProvider>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider>
                <BottomSheetModalProvider>
                  <NetworkListener />
                  <NotificationConfigurator />
                  {children}
                  <Toast />
                </BottomSheetModalProvider>
              </ThemeProvider>
            </QueryClientProvider>
          </KeyboardProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};
