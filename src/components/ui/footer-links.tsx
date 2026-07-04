import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

type FooterLinksProps = {
  className?: string;
  showCopyright?: boolean;
  onTermsPress?: () => void;
  onPrivacyPress?: () => void;
};

export const FooterLinks = memo(function FooterLinks({
  className,
  showCopyright = true,
  onTermsPress,
  onPrivacyPress,
}: FooterLinksProps) {
  return (
    <View className={cn('w-full items-center', className)}>
      <View className="flex-row items-center gap-md">
        <Pressable onPress={onTermsPress} accessibilityRole="link">
          <Typography variant="legal" className="underline">
            Terms of Service
          </Typography>
        </Pressable>
        <Typography variant="legal">·</Typography>
        <Pressable onPress={onPrivacyPress} accessibilityRole="link">
          <Typography variant="legal" className="underline">
            Privacy Policy
          </Typography>
        </Pressable>
      </View>
      {showCopyright ? (
        <Typography variant="legal" className="mt-sm">
          © 2024 PetroTrade Industrial Marketplace
        </Typography>
      ) : null}
    </View>
  );
});
