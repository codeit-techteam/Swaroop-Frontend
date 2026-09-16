import { useMemo } from 'react';

import { View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { SellerCard, SellerHeader, SellerPrimaryButton, SellerStepper } from '@/seller/components';
import { useSellerStore } from '@/seller/store/sellerStore';

export const SellerReviewScreen = () => {
  const router = useRouter();
  const company = useSellerStore((state) => state.company);
  const documents = useSellerStore((state) => state.documents);
  const submitVerification = useSellerStore((state) => state.submitVerification);

  const uploadedDocuments = useMemo(
    () => documents.filter((document) => document.status === 'uploaded'),
    [documents],
  );

  const handleSubmit = () => {
    submitVerification();
    router.replace(ROUTES.SELLER.VERIFICATION_SUBMITTED as Href);
  };

  return (
    <ScreenWrapper scrollable className="bg-brand-background">
      <SellerHeader
        showBack
        title="Seller Onboarding"
        rightActionLabel="Save & Exit"
        onBack={() => router.back()}
        onRightActionPress={() => router.replace(ROUTES.AUTH.ROLE_SELECTION as Href)}
      />

      <SellerStepper currentStep="review" className="mt-md" />

      <SellerCard
        title="Business Info"
        className="mt-lg"
        actionLabel="Edit"
        onActionPress={() => router.push(ROUTES.SELLER.COMPANY as Href)}
      >
        <View className="gap-sm">
          <Typography variant="body">{company.companyName}</Typography>
          <Typography variant="legal" className="text-left">
            GST: {company.gst}
          </Typography>
          {company.gstVerified ? (
            <Typography variant="legal" className="text-left">
              GST State: {company.gstState} ({company.gstStateCode})
            </Typography>
          ) : null}
          <Typography variant="legal" className="text-left">
            PAN: {company.pan}
          </Typography>
          <Typography variant="legal" className="text-left">
            {company.city}, {company.state} - {company.pincode}
          </Typography>
        </View>
      </SellerCard>

      <SellerCard
        title="Documents"
        className="mt-lg"
        actionLabel="Edit"
        onActionPress={() => router.push(ROUTES.SELLER.VERIFICATION as Href)}
      >
        <View className="gap-sm">
          {uploadedDocuments.map((document) => (
            <View
              key={document.id}
              className="flex-row items-center justify-between rounded-xl bg-brand-surface px-md py-md"
            >
              <Typography variant="body">{document.title}</Typography>
              <Typography variant="badge" className="text-brand-uploaded-text">
                Uploaded
              </Typography>
            </View>
          ))}
        </View>
      </SellerCard>

      <View className="mt-lg">
        <SellerPrimaryButton label="Submit For Verification" showArrow onPress={handleSubmit} />
      </View>
    </ScreenWrapper>
  );
};
