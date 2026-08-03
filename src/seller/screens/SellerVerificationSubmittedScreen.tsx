import { View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { AppLogo, ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { SellerCard, SellerPrimaryButton, SellerSuccessBanner } from '@/seller/components';

export const SellerVerificationSubmittedScreen = () => {
  const router = useRouter();

  return (
    <ScreenWrapper className="bg-brand-background">
      <View className="items-center pt-lg">
        <AppLogo />
      </View>

      <SellerSuccessBanner
        title="Application Submitted"
        description="Verification in Progress"
        className="mt-2xl"
      />

      <SellerCard className="mt-lg">
        <Typography variant="headingLeft" className="text-center">
          Verification Submitted
        </Typography>
        <Typography variant="subheading" className="mt-sm">
          Estimated time: 2-4 Business Hours
        </Typography>
      </SellerCard>

      <SellerCard title="What happens next" className="mt-lg">
        <View className="gap-sm">
          <Typography variant="body">
            Your seller dashboard is enabled for this frontend demo.
          </Typography>
          <Typography variant="body">
            Documents remain in Uploaded state until APIs are connected.
          </Typography>
        </View>
      </SellerCard>

      <SellerPrimaryButton
        label="Go To Dashboard"
        className="mt-auto"
        onPress={() => router.replace(ROUTES.SELLER.DASHBOARD as Href)}
      />
    </ScreenWrapper>
  );
};
