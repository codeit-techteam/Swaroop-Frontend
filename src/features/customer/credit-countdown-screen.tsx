import { memo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, Typography } from '@/components/ui';
import {
  CREDIT_WORKFLOW_COPY,
  formatCreditCountdownDisplay,
  getCreditUsedDisplay,
  getRemainingCreditDisplay,
  useCreditCountdown,
} from '@/hooks/useCreditCountdown';
import { BackArrowIcon, ClockIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';

export const CustomerCreditCountdownScreen = memo(function CustomerCreditCountdownScreen() {
  const insets = useSafeAreaInsets();
  const copy = CREDIT_WORKFLOW_COPY.countdown;
  const { order, countdown, timelineSteps, handleBack, handlePayNow } = useCreditCountdown();
  const display = formatCreditCountdownDisplay(countdown);

  return (
    <View className="flex-1 bg-brand-background">
      <View
        className="border-b border-brand-border bg-brand-white px-lg"
        style={{ paddingTop: insets.top }}
      >
        <View className="h-14 flex-row items-center">
          <Pressable onPress={handleBack} className="h-10 w-10 items-center justify-center">
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
        <View className="items-center rounded-2xl border border-brand-border bg-brand-white py-xl">
          <ClockIcon size={iconSizes.xl} color={brandColors.primary} />
          <View className="mt-lg flex-row items-end justify-center gap-md">
            <CountdownUnit value={display.days} unit="Days" />
            <CountdownUnit value={display.hours} unit="Hours" />
            <CountdownUnit value={display.minutes} unit="Minutes" />
          </View>
        </View>

        {order ? (
          <View
            className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg"
            style={elevation.sm}
          >
            <StatRow label={copy.creditUsedLabel} value={getCreditUsedDisplay(order)} />
            <StatRow
              label={copy.remainingCreditLabel}
              value={getRemainingCreditDisplay(order)}
              highlight
            />
            <StatRow
              label={copy.interestLabel}
              value={`${order.credit?.interestRate ?? 0}%`}
            />
          </View>
        ) : null}

        <Typography variant="roleTitle" className="mb-md mt-lg text-[14px] text-brand-heading">
          {copy.timelineHeading}
        </Typography>
        {timelineSteps.map((step) => (
          <View key={step.id} className="mb-sm flex-row items-center gap-sm">
            <View
              className={`h-2.5 w-2.5 rounded-full ${
                step.status === 'completed'
                  ? 'bg-brand-success'
                  : step.status === 'current'
                    ? 'bg-brand-primary'
                    : 'bg-brand-border'
              }`}
            />
            <Typography variant="subheadingLeft" className="text-[13px] text-brand-body">
              {step.title}
            </Typography>
          </View>
        ))}
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <PrimaryButton label={copy.payLabel} onPress={handlePayNow} disabled={!order} />
      </View>
    </View>
  );
});

const CountdownUnit = memo(function CountdownUnit({ value, unit }: { value: string; unit: string }) {
  return (
    <View className="items-center">
      <Typography variant="headingLeft" className="text-[36px] text-brand-heading">
        {value}
      </Typography>
      <Typography variant="fieldLabel" className="text-[11px] text-brand-muted">
        {unit}
      </Typography>
    </View>
  );
});

const StatRow = memo(function StatRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between py-sm">
      <Typography variant="roleDescription" className="text-[13px] text-brand-body">
        {label}
      </Typography>
      <Typography
        variant="roleTitle"
        className={highlight ? 'text-[14px] text-brand-primary' : 'text-[14px] text-brand-heading'}
      >
        {value}
      </Typography>
    </View>
  );
});
