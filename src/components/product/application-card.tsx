import { memo } from 'react';

import { Text, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

type ApplicationCardProps = {
  note: string;
  applications?: string[];
  className?: string;
};

export const ApplicationCard = memo(function ApplicationCard({
  note,
  applications = [],
  className,
}: ApplicationCardProps) {
  return (
    <View className={cn('overflow-hidden rounded-lg bg-brand-primary-tint', className)}>
      <View className="flex-row">
        <View className="w-1 bg-brand-heading" />
        <View className="flex-1 px-md py-md">
          <Text className="font-sans text-[13px] leading-[20px] text-brand-heading">
            <Text className="font-bold text-[13px] leading-[20px] text-brand-heading">
              Application Note:{' '}
            </Text>
            {note}
          </Text>

          {applications.length > 0 ? (
            <View className="mt-md">
              <Typography
                variant="fieldLabel"
                className="mb-sm text-[10px] tracking-[0.8px] text-brand-muted"
              >
                Recommended Applications
              </Typography>
              {applications.map((application) => (
                <Typography
                  key={application}
                  variant="roleDescription"
                  className="mb-xs text-[13px] text-brand-heading"
                >
                  • {application}
                </Typography>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
});
