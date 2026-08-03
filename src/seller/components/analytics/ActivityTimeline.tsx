import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { CheckCircleIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { AnalyticsActivity } from '@/seller/types/analytics';
import { cn } from '@/utils/cn';

export const ActivityTimeline = memo(function ActivityTimeline({
  activities,
}: {
  activities: AnalyticsActivity[];
}) {
  return (
    <View className="rounded-2xl border border-brand-border bg-brand-white px-md py-md">
      <Typography variant="roleTitle" className="text-brand-heading">
        Recent Activities
      </Typography>
      <View className="mt-md">
        {activities.map((activity, index) => (
          <View key={activity.id} className="flex-row">
            <View className="mr-md items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-primary-light">
                <CheckCircleIcon size={14} color={brandColors.navy} />
              </View>
              {index < activities.length - 1 ? (
                <View className="my-xs w-0.5 flex-1 bg-brand-border" />
              ) : null}
            </View>
            <View className={cn('mb-lg flex-1', index === activities.length - 1 && 'mb-0')}>
              <Typography variant="roleTitle">{activity.title}</Typography>
              <Typography variant="roleDescription" className="mt-xs">
                {activity.subtitle}
              </Typography>
              <Typography variant="legal" className="mt-xs text-left text-brand-body">
                {activity.timestamp}
              </Typography>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});
