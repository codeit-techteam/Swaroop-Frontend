import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Image } from 'expo-image';

import { Typography } from '@/components/ui/typography';
import type { MarketInsight } from '@/types/home';
import { cn } from '@/utils/cn';

type InsightCardProps = {
  insight: MarketInsight;
  onPress?: (insight: MarketInsight) => void;
  className?: string;
};

export const InsightCard = memo(function InsightCard({
  insight,
  onPress,
  className,
}: InsightCardProps) {
  return (
    <Pressable
      onPress={() => onPress?.(insight)}
      accessibilityRole="button"
      accessibilityLabel={`${insight.title}. ${insight.source}, ${insight.timeAgo}`}
      className={cn('flex-row items-start px-lg py-sm', className)}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View className="mr-md h-[68px] w-[68px] overflow-hidden rounded-lg bg-brand-surface">
        <Image
          source={{ uri: insight.imageUrl }}
          style={{ width: 68, height: 68 }}
          contentFit="cover"
          transition={0}
          cachePolicy="memory-disk"
          recyclingKey={insight.id}
        />
      </View>

      <View className="flex-1 pt-0.5">
        <Typography
          variant="roleTitle"
          className="text-[14px] leading-[20px] text-brand-primary"
          numberOfLines={2}
        >
          {insight.title}
        </Typography>
        <Typography
          variant="fieldLabel"
          className="mt-sm text-[10px] tracking-[0.8px] text-brand-muted"
        >
          {insight.source} • {insight.timeAgo}
        </Typography>
      </View>
    </Pressable>
  );
});
