import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { StatusBadge } from '@/components/ui/status-badge';
import { Typography } from '@/components/ui/typography';
import type { BusinessInformation } from '@/types/kyc';
import { cn } from '@/utils/cn';

type BusinessSummaryCardProps = {
  businessInfo: BusinessInformation;
  showVerifiedBadge?: boolean;
  onEdit?: () => void;
  className?: string;
  compact?: boolean;
};

export const BusinessSummaryCard = memo(function BusinessSummaryCard({
  businessInfo,
  showVerifiedBadge = false,
  onEdit,
  className,
  compact = false,
}: BusinessSummaryCardProps) {
  return (
    <View
      className={cn(
        'w-full rounded-lg border border-brand-border bg-brand-white px-lg py-lg',
        className,
      )}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-md">
          <Typography variant="fieldLabel">Business Entity</Typography>
          <Typography variant="roleTitle" className="mt-xs text-brand-primary">
            {businessInfo.businessEntityName || '—'}
          </Typography>
          <Typography variant="roleDescription" className="mt-xs">
            {businessInfo.companyType || '—'}
          </Typography>
        </View>
        {showVerifiedBadge ? <StatusBadge label="✔ Verified" variant="success" /> : null}
        {onEdit ? (
          <Pressable onPress={onEdit} hitSlop={8} accessibilityRole="button">
            <Typography variant="link">Edit</Typography>
          </Pressable>
        ) : null}
      </View>

      {!compact ? (
        <View className="mt-lg gap-sm border-t border-brand-border pt-lg">
          <SummaryRow label="GST" value={businessInfo.gstNumber} />
          <SummaryRow label="PAN" value={businessInfo.panNumber} />
          <SummaryRow label="Email" value={businessInfo.businessEmail} />
          <SummaryRow label="Mobile" value={businessInfo.mobileNumber} />
          <SummaryRow label="Address" value={businessInfo.businessAddress} />
          <SummaryRow
            label="Location"
            value={[businessInfo.city, businessInfo.state, businessInfo.pincode]
              .filter(Boolean)
              .join(', ')}
          />
          <SummaryRow label="Nature of Business" value={businessInfo.natureOfBusiness} />
          {businessInfo.annualPurchaseVolume ? (
            <SummaryRow
              label="Annual Purchase Volume"
              value={`₹ ${businessInfo.annualPurchaseVolume}`}
            />
          ) : null}
          {businessInfo.expectedMonthlyRequirement ? (
            <SummaryRow
              label="Expected Monthly Requirement"
              value={businessInfo.expectedMonthlyRequirement}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
});

const SummaryRow = memo(function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-md">
      <Typography variant="legal" className="w-1/3 text-left text-brand-muted">
        {label}
      </Typography>
      <Typography variant="roleDescription" className="flex-1 text-right text-brand-heading">
        {value || '—'}
      </Typography>
    </View>
  );
});
