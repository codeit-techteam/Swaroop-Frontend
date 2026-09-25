import { memo } from 'react';

import { View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, ScreenWrapper, SecondaryButton, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { useSellerOffersStore } from '@/seller/modules/seller-offers/store/sellerOffersStore';
import { SellerHeader } from '@/seller/components';

export const OfferPausedScreen = memo(function OfferPausedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { offerId } = useLocalSearchParams<{ offerId?: string }>();
  const getOffer = useSellerOffersStore((state) => state.getOffer);
  const resumeOffer = useSellerOffersStore((state) => state.resumeOffer);

  const offer = offerId ? getOffer(offerId) : undefined;

  const handleResume = async () => {
    if (!offer) {
      return;
    }
    const resumed = await resumeOffer(offer.id);
    if (resumed) {
      router.push(ROUTES.SELLER.OFFERS as Href);
    }
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader title="PetroTrade Seller" showBack onBack={() => router.back()} />

      <View
        className="flex-1 px-lg"
        style={{ paddingBottom: insets.bottom + 24, justifyContent: 'center' }}
      >
        <View className="rounded-2xl border border-brand-border bg-brand-white px-lg py-2xl">
          <Typography variant="headingLeft" className="text-center text-[26px]">
            Offer Paused
          </Typography>
          <Typography variant="roleDescription" className="mt-sm text-center text-brand-body">
            Visibility disabled on buyer marketplace for {offer?.product ?? 'this offer'}.
          </Typography>
        </View>

        <View className="mt-xl gap-sm">
          <PrimaryButton label="Resume" onPress={handleResume} />
          <SecondaryButton
            label="Back"
            variant="outline"
            onPress={() => router.back()}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
});
