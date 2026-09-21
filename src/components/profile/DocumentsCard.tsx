import { memo } from 'react';

import { Pressable, View } from 'react-native';

import Animated, { FadeIn } from 'react-native-reanimated';

import { ProfileSectionHeader } from '@/components/profile/ProfileSectionHeader';
import { Typography } from '@/components/ui/typography';
import { DOCUMENT_PROFILE_ITEMS } from '@/constants/documents';
import { ChevronRightIcon, DocumentFileIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { DocumentTab } from '@/types/documents';
import { cn } from '@/utils/cn';

type DocumentsCardProps = {
  counts?: Partial<Record<DocumentTab, number>>;
  onPressItem: (tab: DocumentTab) => void;
  className?: string;
};

export const DocumentsCard = memo(function DocumentsCard({
  counts,
  onPressItem,
  className,
}: DocumentsCardProps) {
  return (
    <Animated.View entering={FadeIn.duration(300).delay(120)}>
      <View
        className={cn(
          'rounded-2xl border border-brand-border bg-brand-white p-lg shadow-sm',
          className,
        )}
      >
        <ProfileSectionHeader
          title="Documents"
          icon={
            <View className="h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-tint">
              <DocumentFileIcon size={18} color={brandColors.primaryDark} />
            </View>
          }
        />

        <Typography variant="legal" className="mt-xs text-left text-brand-muted">
          Purchase orders, tax invoices, proforma, and GST documents across your order lifecycle.
        </Typography>

        <View className="mt-md">
          {DOCUMENT_PROFILE_ITEMS.map((item, index) => {
            const isLast = index === DOCUMENT_PROFILE_ITEMS.length - 1;
            const count = counts?.[item.id];

            return (
              <Pressable
                key={item.id}
                onPress={() => onPressItem(item.id)}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                className={cn(
                  'flex-row items-center py-md',
                  !isLast && 'border-b border-brand-border',
                )}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <View className="mr-md h-10 w-10 items-center justify-center rounded-lg bg-brand-surface">
                  <DocumentFileIcon size={20} color={brandColors.secondaryButton} />
                </View>
                <View className="flex-1">
                  <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
                    {item.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="mt-0.5 font-sans normal-case tracking-normal text-brand-muted"
                  >
                    {typeof count === 'number'
                      ? `${count} ${count === 1 ? 'document' : 'documents'}`
                      : item.subtitle}
                  </Typography>
                </View>
                <ChevronRightIcon color={brandColors.muted} />
              </Pressable>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
});
