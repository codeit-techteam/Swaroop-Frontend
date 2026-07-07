import { memo, type ReactNode } from 'react';

import { StyleSheet, View } from 'react-native';

import {
  Header,
  IllustrationContainer,
  PageIndicator,
  PrimaryButton,
  ScreenContainer,
  Typography,
} from '@/components';
import { ONBOARDING_TOTAL_PAGES } from '@/features/onboarding/constants';
import { ShieldSmallIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type OnboardingScreenProps = {
  title: string;
  subtitle: string;
  caption?: string;
  activeIndex: number;
  buttonLabel: string;
  onContinue: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
  illustration: ReactNode;
  showIllustrationCard?: boolean;
  captionVariant?: 'caption' | 'illustrationLabel';
  footerLabel?: string;
};

export const OnboardingScreen = memo(function OnboardingScreen({
  title,
  subtitle,
  caption,
  activeIndex,
  buttonLabel,
  onContinue,
  onSkip,
  showSkip = false,
  illustration,
  showIllustrationCard = false,
  captionVariant = 'caption',
  footerLabel,
}: OnboardingScreenProps) {
  return (
    <ScreenContainer backgroundColor={brandColors.background}>
      <Header showSkip={showSkip} onSkip={onSkip} />

      <View
        style={{
          height: StyleSheet.hairlineWidth,
          backgroundColor: brandColors.border,
          marginTop: spacing.md,
          marginHorizontal: -spacing.screenHorizontal,
        }}
      />

      <View className="flex-1 justify-between" style={{ paddingTop: spacing['2xl'] }}>
        <View className="items-center">
          <IllustrationContainer
            caption={caption}
            captionVariant={captionVariant}
            showCard={showIllustrationCard}
          >
            {illustration}
          </IllustrationContainer>

          <View
            className="w-full items-center"
            style={{ marginTop: spacing.sectionGap, paddingHorizontal: spacing.sm }}
          >
            <Typography variant="heading">{title}</Typography>
            <Typography variant="subheading" style={{ marginTop: spacing.md }}>
              {subtitle}
            </Typography>
          </View>

          <PageIndicator
            total={ONBOARDING_TOTAL_PAGES}
            activeIndex={activeIndex}
            className="mt-xl"
          />
        </View>

        <View style={{ paddingBottom: spacing.screenBottom }}>
          <PrimaryButton label={buttonLabel} showArrow onPress={onContinue} />

          {footerLabel ? (
            <View
              className="flex-row items-center justify-center"
              style={{ marginTop: spacing.lg, gap: spacing.xs }}
            >
              <ShieldSmallIcon />
              <Typography variant="footer">{footerLabel}</Typography>
            </View>
          ) : (
            <View style={{ height: spacing['2xl'] }} />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
});
