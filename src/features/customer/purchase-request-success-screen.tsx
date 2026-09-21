import { memo, useCallback, useEffect } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CountdownRing } from '@/components/ui/countdown-ring';
import { PrimaryButton, SecondaryButton, Typography } from '@/components/ui';
import { formatInr } from '@/constants/productDetails';
import { useCountdown } from '@/hooks/use-countdown';
import { CheckCircleIcon, ClockIcon, ShieldCheckIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';

export const CustomerPurchaseRequestSuccessScreen = memo(
  function CustomerPurchaseRequestSuccessScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{
      referenceNumber?: string;
      status?: string;
      paymentOption?: string;
      quantity?: string;
      unit?: string;
      amount?: string;
      productName?: string;
      deadline?: string;
    }>();

    const countdown = useCountdown(params.deadline);
    const pulse = useSharedValue(1);

    useEffect(() => {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }, [pulse]);

    const pulseStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulse.value }],
    }));

    const handleViewOrders = useCallback(() => {
      router.replace(ROUTES.CUSTOMER.ORDERS as Href);
    }, [router]);

    const handleMarket = useCallback(() => {
      router.replace(ROUTES.CUSTOMER.MARKET as Href);
    }, [router]);

    const amountValue = params.amount ? Number(params.amount) : null;

    return (
      <View className="flex-1 bg-brand-background" style={{ paddingTop: insets.top }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 24,
            flexGrow: 1,
          }}
        >
          <Animated.View entering={FadeInDown.duration(420)} className="items-center">
            <Animated.View
              style={pulseStyle}
              className="h-16 w-16 items-center justify-center rounded-full bg-brand-success-light"
            >
              <CheckCircleIcon size={36} color={brandColors.success} />
            </Animated.View>

            <Typography
              variant="fieldLabel"
              className="mt-lg text-[11px] tracking-[1.2px] text-brand-muted"
            >
              PURCHASE REQUEST SUBMITTED
            </Typography>
            <Typography
              variant="headingLeft"
              className="mt-sm text-center text-[24px] text-brand-heading"
            >
              {params.referenceNumber ?? 'Request received'}
            </Typography>
            <Typography
              variant="subheadingLeft"
              className="mt-sm text-center text-[14px] leading-[22px] text-brand-body"
            >
              Seller matching is in progress. You will see updates in Orders as the seller responds.
            </Typography>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(120).duration(420)}
            className="mt-xl items-center rounded-2xl border border-brand-border bg-brand-white px-lg py-xl"
            style={elevation.sm}
          >
            <View className="mb-md flex-row items-center gap-sm rounded-full bg-brand-primary-tint px-md py-sm">
              <ClockIcon size={iconSizes.sm} color={brandColors.primary} />
              <Typography variant="badge" className="text-[11px] text-brand-primary">
                {countdown.isExpired ? 'Response window closed' : 'Awaiting seller response'}
              </Typography>
            </View>

            <CountdownRing
              label={countdown.label}
              progress={countdown.progress}
              isUrgent={countdown.isUrgent}
              isExpired={countdown.isExpired}
              caption={
                countdown.isExpired
                  ? 'We will notify you if the seller responds late or the request expires.'
                  : 'Sellers have 15 minutes to accept, reject, or counter your request.'
              }
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(220).duration(420)}
            className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg"
            style={elevation.sm}
          >
            <Typography variant="fieldLabel" className="text-[10px] tracking-[0.8px] text-brand-muted">
              REQUEST SUMMARY
            </Typography>
            <Typography variant="roleTitle" className="mt-sm text-[17px] text-brand-heading">
              {params.productName ?? 'Marketplace product'}
            </Typography>

            <View className="mt-md flex-row flex-wrap gap-sm">
              <View className="rounded-full bg-brand-surface px-md py-sm">
                <Typography variant="caption" className="text-[12px] normal-case text-brand-body">
                  {params.quantity ?? '—'} {params.unit ?? 'MT'}
                </Typography>
              </View>
              <View className="rounded-full bg-brand-surface px-md py-sm">
                <Typography variant="caption" className="text-[12px] normal-case text-brand-body">
                  {params.paymentOption ?? 'Advance'}
                </Typography>
              </View>
            </View>

            {amountValue != null && Number.isFinite(amountValue) ? (
              <Typography variant="roleTitle" className="mt-md text-[22px] text-brand-primary">
                {formatInr(amountValue)}
              </Typography>
            ) : null}

            <View className="mt-lg flex-row items-start gap-md rounded-xl bg-brand-primary-tint px-md py-md">
              <ShieldCheckIcon size={iconSizes.md} color={brandColors.primary} />
              <View className="min-w-0 flex-1">
                <Typography variant="roleTitle" className="text-[13px] text-brand-heading">
                  Blind marketplace protected
                </Typography>
                <Typography
                  variant="caption"
                  className="mt-xs text-[12px] leading-[18px] normal-case text-brand-body"
                >
                  Seller identity stays confidential until commercial acceptance. PetroTrade manages
                  matching and negotiation on your behalf.
                </Typography>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        <View
          className="border-t border-brand-border bg-brand-white px-lg pt-md"
          style={{ paddingBottom: Math.max(insets.bottom, 16), gap: 10 }}
        >
          <PrimaryButton label="Go to Orders" onPress={handleViewOrders} />
          <SecondaryButton label="Continue Shopping" onPress={handleMarket} variant="outline" />
          <Pressable
            onPress={handleViewOrders}
            accessibilityRole="button"
            className="h-8 items-center justify-center"
          >
            <Typography variant="link" className="text-[12px] text-brand-muted">
              Track response status anytime from Orders
            </Typography>
          </Pressable>
        </View>
      </View>
    );
  },
);
