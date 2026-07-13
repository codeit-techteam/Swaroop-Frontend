import { memo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  LoadingLogisticsCard,
  LoadingProgressTimeline,
} from '@/components/loading';
import { PrimaryButton, Typography } from '@/components/ui';
import { LOADING_WORKFLOW_COPY } from '@/constants/loadingWorkflow';
import { useLoadingScheduled } from '@/hooks/useLoadingScheduled';
import { BackArrowIcon } from '@/icons';
import { brandColors } from '@/theme/colors';

export const CustomerLoadingScheduledScreen = memo(function CustomerLoadingScheduledScreen() {
  const insets = useSafeAreaInsets();
  const { order, timelineSteps, handleContinue, handleBack } = useLoadingScheduled();
  const copy = LOADING_WORKFLOW_COPY.scheduled;

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
          paddingTop: 20,
          paddingBottom: insets.bottom + 120,
        }}
      >
        <Typography variant="headingLeft" className="text-[20px] text-brand-heading">
          {copy.pageTitle}
        </Typography>
        {order ? (
          <Typography variant="subheadingLeft" className="mt-xs text-[13px] text-brand-primary">
            Order Reference: {order.id}
          </Typography>
        ) : null}

        {order?.loadingSchedule ? (
          <LoadingLogisticsCard
            schedule={order.loadingSchedule}
            orderId={order.id}
            className="mt-lg"
          />
        ) : null}

        <LoadingProgressTimeline
          steps={timelineSteps}
          heading={copy.timelineHeading}
          className="mt-lg"
        />
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
