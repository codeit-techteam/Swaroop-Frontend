import { useCallback } from 'react';

import { type Href, useRouter } from 'expo-router';

import { OnboardingScreen } from '@/features/onboarding';
import { ONBOARDING_COPY } from '@/features/onboarding/constants';
import { TradingIllustration } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { useAuthStore } from '@/store/auth-store';
import { wp } from '@/utils/responsive';

export default function IntroOneRoute() {
  const router = useRouter();
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const copy = ONBOARDING_COPY.screenOne;

  const handleContinue = useCallback(() => {
    router.push(ROUTES.ONBOARDING.INTRO_TWO as Href);
  }, [router]);

  const handleSkip = useCallback(() => {
    completeOnboarding();
    router.replace(ROUTES.AUTH.ROLE_SELECTION as Href);
  }, [completeOnboarding, router]);

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
