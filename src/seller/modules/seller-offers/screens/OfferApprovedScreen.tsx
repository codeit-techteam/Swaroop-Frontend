import { memo } from 'react';

import { ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, ScreenWrapper, SecondaryButton, Typography } from '@/components';
import { CheckCircleIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { useSellerOffersStore } from '@/seller/modules/seller-offers/store/sellerOffersStore';
import { SellerHeader } from '@/seller/components';
import { brandColors } from '@/theme/colors';

export const OfferApprovedScreen = memo(function OfferApprovedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { offerId } = useLocalSearchParams<{ offerId?: string }>();
  const getOffer = useSellerOffersStore((state) => state.getOffer);

  const offer = offerId ? getOffer(offerId) : undefined;

  if (!offer) {
    return (
      <ScreenWrapper className="bg-brand-background">
        <Typography variant="roleTitle">Offer not found</Typography>
      </ScreenWrapper>
    );
  }

  const expiry = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(offer.expiresAt));

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader title="PetroTrade Seller" showBack onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-lg"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32, alignItems: 'center' }}
      >
        <View className="mt-2xl h-24 w-24 items-center justify-center rounded-full bg-brand-success-light">
          <CheckCircleIcon size={48} color={brandColors.success} />
        </View>
        <Typography variant="headingLeft" className="mt-lg text-center text-[28px]">
          Offer Approved Successfully
        </Typography>

        <View className="mt-xl w-full rounded-2xl border border-brand-border bg-brand-white px-md py-md">
          {[
            { label: 'Offer ID', value: offer.offerId },
            { label: 'Material', value: offer.product },
            { label: 'Approved Price', value: `₹${offer.basePrice}/kg` },
            { label: 'Expiry', value: expiry },
            { label: 'Inventory', value: `${offer.remainingStock} MT` },
          ].map((row) => (
            <View key={row.label} className="mb-md flex-row items-center justify-between">
              <Typography variant="roleDescription" className="text-brand-body">
                {row.label}
              </Typography>
              <Typography variant="roleTitle">{row.value}</Typography>
            </View>
          ))}
        </View>

        <View className="mt-xl w-full gap-sm">
          <PrimaryButton
            label="View Live Offer"
            onPress={() =>
              router.push(`${ROUTES.SELLER.OFFER_DETAILS}?offerId=${offer.id}` as Href)
            }
          />
          <SecondaryButton
            label="Back To Offers"
            variant="outline"
            onPress={() => router.push(ROUTES.SELLER.OFFERS as Href)}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
});
