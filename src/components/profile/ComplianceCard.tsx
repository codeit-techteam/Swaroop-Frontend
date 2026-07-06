import { memo } from 'react';

import { Pressable, View } from 'react-native';

import Animated, { FadeIn } from 'react-native-reanimated';

import { ProfileSectionHeader } from '@/components/profile/ProfileSectionHeader';
import { Typography } from '@/components/ui/typography';
import { ChevronRightIcon, ShieldCheckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { ComplianceStatus } from '@/types/profile';
import { cn } from '@/utils/cn';

type ComplianceCardProps = {
  compliance: ComplianceStatus;
  onPress?: () => void;
  className?: string;
};

export const ComplianceCard = memo(function ComplianceCard({
  compliance,
  onPress,
  className,
}: ComplianceCardProps) {
  return (
    <Animated.View entering={FadeIn.duration(300).delay(100)}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : 'text'}
        className={cn(
          'rounded-2xl border border-brand-border bg-brand-white p-lg shadow-sm',
          className,
        )}
        style={({ pressed }) => ({ opacity: onPress && pressed ? 0.95 : 1 })}
      >
        <View className="flex-row items-center justify-between">
          <ProfileSectionHeader
            title="Compliance"
            icon={
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-brand-success-light">
                <ShieldCheckIcon size={18} color={brandColors.success} />
              </View>
            }
          />
          {onPress ? <ChevronRightIcon color={brandColors.muted} /> : null}
        </View>

        <Typography
          variant="subheadingLeft"
          className="mt-md text-[13px] leading-5 text-brand-body"
        >
          {compliance.summary}
        </Typography>

        {compliance.kycVerified ? (
          <View className="mt-md flex-row flex-wrap gap-sm">
            {[
              { label: 'KYC Verified', active: compliance.kycVerified },
              { label: 'GST Verified', active: compliance.gstVerified },
              { label: 'PAN Verified', active: compliance.panVerified },
              {
                label: compliance.documentsComplete ? 'Documents Complete' : 'Documents Pending',
                active: compliance.documentsComplete,
              },
            ].map((item) => (
              <View
                key={item.label}
                className={cn(
                  'rounded-full px-sm py-xs',
                  item.active ? 'bg-brand-success-light' : 'bg-brand-surface',
                )}
              >
                <Typography
                  variant="badge"
                  className={cn(
                    'text-[9px] tracking-[0.6px]',
                    item.active ? 'text-brand-success' : 'text-brand-muted',
                  )}
                >
                  {item.label.toUpperCase()}
                </Typography>
              </View>
            ))}
          </View>
        ) : null}

        {compliance.kycVerified ? (
          <View className="mt-md flex-row items-center gap-sm self-start rounded-full bg-brand-success-light px-md py-sm">
            <ShieldCheckIcon size={14} color={brandColors.success} />
            <Typography variant="roleTitle" className="text-[12px] text-brand-success">
              {compliance.validTillLabel}
            </Typography>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
});
