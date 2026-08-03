import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { CheckCircleIcon, ClockIcon, HourglassIcon, LockIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { OfferReviewTimelineStep } from '@/seller/modules/seller-offers/types/offers';
import { cn } from '@/utils/cn';

const StepIcon = ({ status }: { status: OfferReviewTimelineStep['status'] }) => {
  if (status === 'completed') {
    return <CheckCircleIcon size={18} color={brandColors.navy} />;
  }
  if (status === 'in_progress') {
    return <ClockIcon size={18} color="#D97706" />;
  }
  return <LockIcon size={16} color={brandColors.body} />;
};

export const OfferReviewTimeline = memo(function OfferReviewTimeline({
  steps,
}: {
  steps: OfferReviewTimelineStep[];
}) {
  return (
    <View className="mt-md">
      <Typography variant="badge" className="mb-md text-[11px] text-brand-body">
        APPROVAL TIMELINE
      </Typography>
      {steps.map((step, index) => (
        <View key={step.id} className="flex-row">
          <View className="mr-md items-center">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-surface">
              <StepIcon status={step.status} />
            </View>
            {index < steps.length - 1 ? (
              <View className="my-xs w-0.5 flex-1 bg-brand-border" />
            ) : null}
          </View>
          <View className="mb-lg flex-1 pb-sm">
            <View className="flex-row items-center gap-sm">
              <Typography variant="roleTitle">{step.title}</Typography>
              {step.status === 'in_progress' ? (
                <View className="rounded-full bg-[#FEF3E8] px-sm py-xs">
                  <Typography variant="badge" className="text-[10px] text-[#B45309]">
                    IN PROGRESS
                  </Typography>
                </View>
              ) : null}
            </View>
            <Typography variant="roleDescription" className="mt-xs">
              {step.subtitle}
            </Typography>
            {step.timestamp ? (
              <Typography variant="legal" className="mt-xs text-left text-brand-body">
                {step.timestamp}
              </Typography>
            ) : step.status === 'pending' ? (
              <Typography variant="legal" className="mt-xs text-left text-brand-body">
                Awaiting previous steps
              </Typography>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
});

export const OfferSummaryCard = memo(function OfferSummaryCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="rounded-2xl border border-brand-border bg-brand-white px-md py-md">
      <Typography variant="roleTitle" className="text-brand-heading">
        {title}
      </Typography>
      <View className="mt-md">{children}</View>
    </View>
  );
});

export const AllocationCard = memo(function AllocationCard({
  allocatedStock,
}: {
  allocatedStock: number;
}) {
  return (
    <View className="items-center rounded-2xl border border-brand-border bg-brand-white px-md py-lg">
      <View className="h-36 w-36 items-center justify-center rounded-full border-[12px] border-brand-navy border-r-brand-surface">
        <Typography variant="headingLeft" className="text-[24px]">
          {allocatedStock} MT
        </Typography>
      </View>
      <Typography variant="roleDescription" className="mt-md text-center">
        Total Inventory Allocated
      </Typography>
    </View>
  );
});

export const OfferReviewStatusBanner = memo(function OfferReviewStatusBanner({
  status,
}: {
  status: 'pending_review' | 'approved' | 'rejected' | 'submitted';
}) {
  const config = {
    submitted: {
      label: 'Offer Submitted Successfully',
      className: 'bg-brand-success-light',
      text: 'text-brand-success',
      icon: <CheckCircleIcon size={18} color={brandColors.success} />,
    },
    pending_review: {
      label: 'Pending Review',
      className: 'bg-[#FEF3E8]',
      text: 'text-[#B45309]',
      icon: <HourglassIcon size={18} color="#B45309" />,
    },
    approved: {
      label: 'Offer Approved',
      className: 'bg-brand-success-light',
      text: 'text-brand-success',
      icon: <CheckCircleIcon size={18} color={brandColors.success} />,
    },
    rejected: {
      label: 'Offer Rejected',
      className: 'bg-brand-error-light',
      text: 'text-brand-error',
      icon: <HourglassIcon size={18} color={brandColors.error} />,
    },
  }[status];

  return (
    <View className={cn('flex-row items-center gap-sm rounded-2xl px-md py-md', config.className)}>
      {config.icon}
      <Typography variant="roleTitle" className={config.text}>
        {config.label}
      </Typography>
    </View>
  );
});
