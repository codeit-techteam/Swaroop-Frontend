import { memo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrderDetailsCard } from '@/components/order';
import { PrimaryButton, Typography } from '@/components/ui';
import { PAYMENT_WORKFLOW_COPY } from '@/constants/paymentWorkflow';
import { useLoadingCompleted } from '@/hooks/useLoadingCompleted';
import { BackArrowIcon, CheckCircleIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

export const CustomerLoadingCompletedScreen = memo(function CustomerLoadingCompletedScreen() {
  const insets = useSafeAreaInsets();
  const { order, handleContinue, handleBack } = useLoadingCompleted();
  const copy = PAYMENT_WORKFLOW_COPY.loadingCompleted;

  return (
    <View className="flex-1 bg-brand-background">
      <View
        className="border-b border-brand-border bg-brand-white px-lg"
        style={{ paddingTop: insets.top }}
      >
        <View className="h-14 flex-row items-center">
          <Pressable
            onPress={handleBack}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="h-10 w-10 items-center justify-center"
          >
            <BackArrowIcon color={brandColors.heading} />
          </Pressable>
          <Typography variant="roleTitle" className="ml-sm text-[17px] text-brand-heading">
            {copy.headerTitle}
          </Typography>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: insets.bottom + 120,
        }}
      >
        <View className="items-center rounded-2xl border border-brand-border bg-brand-white p-lg">
          <View className="mb-md h-16 w-16 items-center justify-center rounded-full bg-brand-success-light">
            <CheckCircleIcon size={iconSizes.xl} color={brandColors.success} />
          </View>
          <Typography variant="headingLeft" className="text-center text-[20px] text-brand-heading">
            {copy.title}
          </Typography>
          <Typography
            variant="subheadingLeft"
            className="mt-sm text-center text-[14px] leading-[22px] text-brand-body"
          >
            {copy.subtitle}
          </Typography>
        </View>

        {order ? (
          <OrderDetailsCard
            order={order}
            destination={order.destination}
            className="mt-lg"
          />
        ) : null}
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <PrimaryButton label={copy.continueLabel} onPress={handleContinue} disabled={!order} />
      </View>
    </View>
  );
});
