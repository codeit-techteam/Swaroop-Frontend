import { memo, useCallback } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import {
  openPrivacyPolicy,
  openTermsOfService,
} from '@/services/legal-links';
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
  const handleTerms = useCallback(() => {
    if (onTermsPress) {
      onTermsPress();
      return;
    }
    void openTermsOfService();
  }, [onTermsPress]);

  const handlePrivacy = useCallback(() => {
    if (onPrivacyPress) {
      onPrivacyPress();
      return;
    }
    void openPrivacyPolicy();
  }, [onPrivacyPress]);

  return (
    <View className={cn('w-full items-center', className)}>
      <View className="flex-row items-center gap-md">
        <Pressable onPress={handleTerms} accessibilityRole="link">
          <Typography variant="legal" className="underline">
            Terms of Service
          </Typography>
        </Pressable>
        <Typography variant="legal">·</Typography>
        <Pressable onPress={handlePrivacy} accessibilityRole="link">
          <Typography variant="legal" className="underline">
            Privacy Policy
          </Typography>
        </Pressable>
      </View>
      {showCopyright ? (
        <Typography variant="legal" className="mt-sm">
          © PolyStoreX Industrial Marketplace
        </Typography>
      ) : null}
    </View>
  );
});
