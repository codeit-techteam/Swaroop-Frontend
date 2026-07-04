import { useCallback, useMemo } from 'react';

import { View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import Toast from 'react-native-toast-message';

import {
  PrimaryButton,
  ReferenceCard,
  ScreenWrapper,
  Typography,
  VerificationBanner,
} from '@/components';
import { generateKycReferenceId } from '@/constants/documents';
import { ClockIcon, SuccessShield } from '@/icons';
import { useKycStore } from '@/store/kyc-store';
import { brandColors } from '@/theme/colors';
import { wp } from '@/utils/responsive';

export const CustomerDashboardScreen = () => {
  const params = useLocalSearchParams<{ referenceId?: string; kycStatus?: string }>();
  const storedReferenceId = useKycStore((state) => state.referenceId);
  const businessName = useKycStore((state) => state.businessInfo.businessEntityName);
  const referenceId = useMemo(
    () => params.referenceId ?? storedReferenceId ?? generateKycReferenceId(),
    [params.referenceId, storedReferenceId],
  );

  const handleRefresh = useCallback(() => {
    Toast.show({
      type: 'info',
      text1: 'Still under review',
      text2: 'Your KYC is pending admin approval.',
      visibilityTime: 2200,
    });
  }, []);

  return (
    <ScreenWrapper className="bg-brand-white">
      <View className="flex-1 items-center justify-center px-sm">
        <SuccessShield width={wp(42)} height={wp(36)} />

        <Typography variant="heading" className="mt-lg">
          Waiting For Verification
        </Typography>
        <Typography variant="subheading" className="mt-sm">
          {businessName
            ? `${businessName} is under review.`
            : 'Your account is under review.'}
        </Typography>

        <View className="mt-lg flex-row items-center gap-xs rounded-full bg-brand-primary-light px-md py-sm">
          <ClockIcon color={brandColors.primary} />
          <Typography variant="badge" className="text-brand-primary">
            Estimated verification 24-48 Hours
          </Typography>
        </View>

        <ReferenceCard referenceId={referenceId} className="mt-2xl" />

        <VerificationBanner
          className="mt-lg"
          message="KYC Pending Approval. Marketplace access will unlock after admin verification."
        />

        <PrimaryButton label="Refresh Status" className="mt-2xl" onPress={handleRefresh} />
      </View>
    </ScreenWrapper>
  );
};
