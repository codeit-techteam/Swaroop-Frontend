import { memo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, Typography } from '@/components/ui';
import {
  CREDIT_WORKFLOW_COPY,
  useCreditRestored,
} from '@/hooks/useCreditRestored';
import {
  BackArrowIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  SuccessShield,
  WalletIcon,
} from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';

export const CustomerCreditRestoredScreen = memo(function CustomerCreditRestoredScreen() {
  const insets = useSafeAreaInsets();
  const copy = CREDIT_WORKFLOW_COPY.restored;
  const { previousUsed, currentAvailable, timelineSteps, handleGoToOrders, handleBack } =
    useCreditRestored();

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
        <View className="items-center">
          <SuccessShield width={180} height={160} />
          <View className="mt-md flex-row items-center gap-sm">
            <ShieldCheckIcon size={iconSizes.md} color={brandColors.primary} />
            <WalletIcon size={iconSizes.md} color={brandColors.success} />
            <CheckCircleIcon size={iconSizes.md} color={brandColors.success} />
          </View>
        </View>

        <Typography variant="headingLeft" className="mt-lg text-center text-[22px] text-brand-heading">
          {copy.title}
        </Typography>

        <View
          className="mt-xl rounded-2xl border border-brand-border bg-brand-white p-lg"
          style={elevation.sm}
        >
          <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
            {copy.creditRestoredLabel}
          </Typography>
          <View className="my-md border-t border-brand-border" />
          <StatRow label={copy.previousUsedLabel} value={previousUsed} />
          <StatRow label={copy.currentAvailableLabel} value={currentAvailable} highlight />
          <StatRow label={copy.statusLabel} value={copy.statusActive} />
        </View>

        <Typography variant="roleTitle" className="mb-md mt-lg text-[14px] text-brand-heading">
          {copy.timelineHeading}
        </Typography>
        {timelineSteps.map((step) => (
          <View key={step.id} className="mb-sm flex-row items-center gap-sm">
            <CheckCircleIcon size={iconSizes.sm} color={brandColors.success} />
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
        <PrimaryButton label={copy.goToOrdersLabel} onPress={handleGoToOrders} />
      </View>
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
