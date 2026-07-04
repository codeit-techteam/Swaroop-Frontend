import { useCallback } from 'react';

import { type Href, useRouter } from 'expo-router';

import { OnboardingScreen } from '@/features/onboarding';
import { ONBOARDING_COPY } from '@/features/onboarding/constants';
import { TradingIllustration } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { wp } from '@/utils/responsive';

export default function OnboardingScreenOne() {
  const router = useRouter();
  const copy = ONBOARDING_COPY.screenOne;

  const handleContinue = useCallback(() => {
    router.push(ROUTES.ONBOARDING.SCREEN_TWO as Href);
  }, [router]);

  const handleSkip = useCallback(() => {
    router.replace(ROUTES.AUTH.LOGIN as Href);
  }, [router]);

  return (
    <OnboardingScreen
      title={copy.title}
      subtitle={copy.subtitle}
      caption={copy.caption}
      activeIndex={copy.activeIndex}
      buttonLabel={copy.buttonLabel}
      showSkip
      onSkip={handleSkip}
      onContinue={handleContinue}
      illustration={<TradingIllustration width={wp(82)} height={wp(60)} />}
    />
  );
}
