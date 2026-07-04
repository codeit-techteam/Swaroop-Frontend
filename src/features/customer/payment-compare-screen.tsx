import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { PaymentBenefitCard } from '@/components/payment/payment-benefit-card';
import { PaymentComparisonTable } from '@/components/payment/payment-comparison-table';
import { PaymentHeader } from '@/components/payment/payment-header';
import { PaymentInfoModal } from '@/components/payment/payment-info-modal';
import { Typography } from '@/components/ui/typography';
import {
  getPaymentComparisonOptionById,
  PAYMENT_COMPARISON_DISCLAIMER,
  PAYMENT_COMPARISON_OPTIONS,
} from '@/constants/payment-comparison';
import { ROUTES } from '@/navigation/routes';
import { selectPaymentMethodId, usePaymentStore } from '@/store/payment-store';
import { elevation } from '@/theme/shadows';
import type { PaymentMethodId } from '@/types/payment';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const CustomerPaymentCompareScreen = memo(function CustomerPaymentCompareScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const storedMethodId = usePaymentStore(selectPaymentMethodId);
  const selectPayment = usePaymentStore((state) => state.selectPayment);
  const hydratePayment = usePaymentStore((state) => state.hydratePayment);
  const isHydrated = usePaymentStore((state) => state.isHydrated);

  const [previewMethodId, setPreviewMethodId] = useState<PaymentMethodId>(storedMethodId);
  const [infoVisible, setInfoVisible] = useState(false);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    if (!isHydrated) {
      hydratePayment();
    }
  }, [hydratePayment, isHydrated]);

  useEffect(() => {
    setPreviewMethodId(storedMethodId);
  }, [storedMethodId]);

  const selectedOption = useMemo(
    () => getPaymentComparisonOptionById(previewMethodId),
    [previewMethodId],
  );

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.PAYMENT as Href);
  }, [router]);

  const handleLocationPress = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Delivery location',
      text2: 'Payment terms apply to your selected delivery region.',
      visibilityTime: 2200,
    });
  }, []);

  const handleSelectRow = useCallback((methodId: PaymentMethodId) => {
    setPreviewMethodId(methodId);
  }, []);

  const handleOpenInfo = useCallback(() => {
    setInfoVisible(true);
  }, []);

  const handleCloseInfo = useCallback(() => {
    setInfoVisible(false);
  }, []);

  const handleConfirmSelection = useCallback(() => {
    selectPayment(previewMethodId);
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.PAYMENT as Href);
  }, [previewMethodId, router, selectPayment]);

  return (
    <View className="flex-1 bg-brand-background">
      <PaymentHeader
        title="Compare Payment Options"
        showLocation
        onBackPress={handleBack}
        onLocationPress={handleLocationPress}
      />

      <Animated.View entering={FadeIn.duration(260)} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
          }}
          className="flex-1"
        >
          <PaymentComparisonTable
            options={PAYMENT_COMPARISON_OPTIONS}
            selectedId={previewMethodId}
            onSelect={handleSelectRow}
            onInfoPress={handleOpenInfo}
          />

          <Animated.View
            entering={FadeInDown.delay(80).duration(320).springify().damping(18)}
            className="mt-4"
          >
            <PaymentBenefitCard key={selectedOption.id} option={selectedOption} />
          </Animated.View>

          <Typography variant="legal" className="mt-5 px-2 text-[11px] leading-[16px]">
            {PAYMENT_COMPARISON_DISCLAIMER}
          </Typography>
        </ScrollView>

        <Animated.View
          entering={FadeInUp.duration(320).springify().damping(18)}
          className="border-t border-brand-border bg-brand-white px-lg pt-md"
          style={[elevation.lg, { paddingBottom: Math.max(insets.bottom, 12) }]}
        >
          <Typography
            variant="fieldLabel"
            className="mb-2 text-[10px] tracking-[0.6px] text-brand-muted"
          >
            SELECTED PAYMENT METHOD
          </Typography>
          <Typography
            variant="roleTitle"
            className="mb-3 text-[14px] text-brand-heading"
            numberOfLines={1}
          >
            {selectedOption.title}
          </Typography>

          <AnimatedPressable
            onPress={handleConfirmSelection}
            onPressIn={() => {
              buttonScale.value = withSpring(0.98, { damping: 16, stiffness: 320 });
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1, { damping: 16, stiffness: 320 });
            }}
            accessibilityRole="button"
            accessibilityLabel="Select this payment method"
            className="h-12 items-center justify-center rounded-xl bg-brand-heading"
            style={buttonStyle}
          >
            <Typography variant="button" className="text-[15px] tracking-normal">
              Select This Payment Method
            </Typography>
          </AnimatedPressable>
        </Animated.View>
      </Animated.View>

      <PaymentInfoModal visible={infoVisible} onClose={handleCloseInfo} />
    </View>
  );
});
