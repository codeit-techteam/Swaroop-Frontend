import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

type ProductApplicationsProps = {
  applications: string[];
  industry?: string;
  className?: string;
};

export const ProductApplications = memo(function ProductApplications({
  applications,
  industry,
  className,
}: ProductApplicationsProps) {
  if (applications.length === 0) {
    return null;
  }

  return (
    <View
      className={cn(
        'mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
        Common Applications
      </Typography>
      {industry ? (
        <Typography
          variant="caption"
          className="mt-xs font-sans text-[12px] normal-case tracking-normal text-brand-muted"
        >
          {industry}
        </Typography>
      ) : null}
      <View className="mt-md flex-row flex-wrap" style={{ gap: 8 }}>
        {applications.map((app) => (
          <View
            key={app}
            className="min-w-[46%] flex-1 rounded-lg border border-brand-border bg-brand-surface px-md py-md"
            style={{ flexBasis: '46%' }}
          >
            <Typography variant="roleTitle" className="text-[13px] text-brand-heading">
              {app}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
});
