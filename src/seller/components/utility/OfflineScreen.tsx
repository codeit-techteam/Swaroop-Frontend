import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { PrimaryButton, SecondaryButton, Typography } from '@/components';
import { RefreshIcon } from '@/icons';
import { brandColors } from '@/theme/colors';

type OfflineScreenProps = {
  onRetry: () => void;
  onGoHome: () => void;
};

export const OfflineScreen = memo(function OfflineScreen({ onRetry, onGoHome }: OfflineScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-brand-background px-xl">
      <View className="h-24 w-24 items-center justify-center rounded-full bg-brand-primary-light">
        <RefreshIcon size={40} color={brandColors.primaryDark} />
      </View>
      <Typography variant="headingLeft" className="mt-xl text-center text-[24px]">
        No Internet
      </Typography>
      <Typography variant="subheading" className="mt-sm text-center text-brand-body">
        Unable to connect.{'\n'}Check your connection.
      </Typography>
      <View className="mt-xl w-full gap-sm">
        <PrimaryButton label="Retry" onPress={onRetry} />
        <SecondaryButton label="Go Home" variant="outline" onPress={onGoHome} />
      </View>
    </View>
  );
});

type OfflineBannerProps = {
  onRetry: () => void;
};

export const OfflineBanner = memo(function OfflineBanner({ onRetry }: OfflineBannerProps) {
  return (
    <Pressable
      onPress={onRetry}
      className="flex-row items-center justify-between bg-brand-error px-lg py-sm"
    >
      <Typography variant="badge" className="text-brand-white">
        You are offline
      </Typography>
      <Typography variant="badge" className="text-brand-white underline">
        Retry
      </Typography>
    </Pressable>
  );
});
