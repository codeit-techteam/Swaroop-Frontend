import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import type { CreditTimelineEvent } from '@/types/customer-credit';
import { cn } from '@/utils/cn';

type CreditTimelineListProps = {
  events: CreditTimelineEvent[];
  className?: string;
};

const formatEventDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const CreditTimelineList = memo(function CreditTimelineList({
  events,
  className,
}: CreditTimelineListProps) {
  return (
    <View
      className={cn(
        'rounded-2xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <Typography variant="fieldLabel" className="mb-lg">
        Application Activity
      </Typography>

      {events.length === 0 ? (
        <Typography variant="subheadingLeft" className="text-brand-muted">
          Activity will appear here once your application moves forward.
        </Typography>
      ) : (
        events.map((event, index) => {
          const isLast = index === events.length - 1;
          return (
            <View key={event.id} className="flex-row">
              <View className="mr-md items-center">
                <View className="mt-xs h-3 w-3 rounded-full bg-brand-primary" />
                {!isLast ? <View className="my-xs w-0.5 flex-1 bg-brand-border" /> : null}
              </View>
              <View className={cn('flex-1', !isLast && 'pb-lg')}>
                <Typography variant="roleTitle" className="text-[14px]">
                  {event.description}
                </Typography>
                <Typography variant="legal" className="mt-xs text-left text-brand-muted">
                  {formatEventDate(event.createdAt)}
                </Typography>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
});
