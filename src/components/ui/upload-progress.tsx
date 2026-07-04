import { memo, useEffect } from 'react';

import { View } from 'react-native';

import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

type UploadProgressProps = {
  progress: number;
  className?: string;
};

export const UploadProgress = memo(function UploadProgress({
  progress,
  className,
}: UploadProgressProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(Math.min(100, Math.max(0, progress)), { duration: 180 });
  }, [progress, width]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View className={cn('w-full', className)}>
      <View className="mb-xs flex-row items-center justify-between">
        <Typography variant="legal" className="text-brand-primary">
          Uploading Document...
        </Typography>
        <Typography variant="badge" className="text-brand-primary">
          {Math.round(progress)}%
        </Typography>
      </View>
      <View className="h-1.5 w-full overflow-hidden rounded-full bg-brand-primary-light">
        <Animated.View className="h-full rounded-full bg-brand-primary" style={barStyle} />
      </View>
    </View>
  );
});
