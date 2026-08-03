import { memo } from 'react';

import { View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, ScreenWrapper, SecondaryButton, Typography } from '@/components';
import { HourglassIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { useSellerOffersStore } from '@/seller/modules/seller-offers/store/sellerOffersStore';
import { SellerHeader } from '@/seller/components';
import { brandColors } from '@/theme/colors';

export const OfferExpiredScreen = memo(function OfferExpiredScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { offerId } = useLocalSearchParams<{ offerId?: string }>();
  const getOffer = useSellerOffersStore((state) => state.getOffer);
  const duplicateOffer = useSellerOffersStore((state) => state.duplicateOffer);
  const loadEditorFromOffer = useSellerOffersStore((state) => state.loadEditorFromOffer);
  const resetEditor = useSellerOffersStore((state) => state.resetEditor);

  const offer = offerId ? getOffer(offerId) : undefined;

  const handleDuplicate = () => {
    if (!offer) {
      return;
    }
    const duplicated = duplicateOffer(offer.id);
    if (duplicated) {
      loadEditorFromOffer(duplicated.id);
      router.push(ROUTES.SELLER.CREATE_OFFER as Href);
    }
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader title="PetroTrade Seller" showBack onBack={() => router.back()} />

      <View
        className="flex-1 px-lg"
        style={{ paddingBottom: insets.bottom + 24, justifyContent: 'center', alignItems: 'center' }}
      >
        <View className="h-24 w-24 items-center justify-center rounded-full bg-brand-surface">
          <HourglassIcon size={42} color={brandColors.body} />
        </View>
        <Typography variant="headingLeft" className="mt-lg text-center text-[28px]">
          Offer Expired
        </Typography>
        <Typography variant="roleDescription" className="mt-sm text-center text-brand-body">
          {offer?.product ?? 'This offer'} is archived and no longer visible to buyers.
        </Typography>

        <View className="mt-xl w-full gap-sm">
          <PrimaryButton label="Duplicate Offer" onPress={handleDuplicate} />
          <SecondaryButton
            label="Create New Offer"
            variant="outline"
            onPress={() => {
              resetEditor();
              router.push(ROUTES.SELLER.CREATE_OFFER as Href);
            }}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
});
