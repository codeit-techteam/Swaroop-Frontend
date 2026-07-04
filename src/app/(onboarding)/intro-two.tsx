import { useCallback } from 'react';

import { type Href, useRouter } from 'expo-router';

import { OnboardingScreen } from '@/features/onboarding';
import { ONBOARDING_COPY } from '@/features/onboarding/constants';
import { TrustIllustration } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { useAuthStore } from '@/store/auth-store';
import { wp } from '@/utils/responsive';

export default function IntroTwoRoute() {
  const router = useRouter();
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const copy = ONBOARDING_COPY.screenTwo;

  const handleGetStarted = useCallback(() => {
    completeOnboarding();
    router.replace(ROUTES.AUTH.ROLE_SELECTION as Href);
  }, [completeOnboarding, router]);

  return (
    <OnboardingScreen
      title={copy.title}
      subtitle={copy.subtitle}
      caption={copy.caption}
      captionVariant="illustrationLabel"
      activeIndex={copy.activeIndex}
      buttonLabel={copy.buttonLabel}
      onContinue={handleGetStarted}
      showIllustrationCard
      footerLabel={copy.footer}
      illustration={<TrustIllustration width={wp(68)} height={wp(62)} />}
    />
  );
}
