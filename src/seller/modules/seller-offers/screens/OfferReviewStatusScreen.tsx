import { memo, useEffect, useState } from 'react';

import { Alert, ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, ScreenWrapper, SecondaryButton, Typography } from '@/components';
import { BankIcon, BuildingIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  AllocationCard,
  OfferReviewStatusBanner,
  OfferReviewTimeline,
  OfferStatusBadge,
} from '@/seller/modules/seller-offers/components';
import { useSellerOffersStore } from '@/seller/modules/seller-offers/store/sellerOffersStore';
import { SellerHeader } from '@/seller/components';
import {
  fetchSellerProductGradeTds,
  type SellerGradeTdsResponse,
} from '@/seller/services/gradeTdsService';
import { isBackendId } from '@/seller/utils/listing-input';
import { brandColors } from '@/theme/colors';

export const OfferReviewStatusScreen = memo(function OfferReviewStatusScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { offerId } = useLocalSearchParams<{ offerId?: string }>();
  const getOffer = useSellerOffersStore((state) => state.getOffer);
  const refreshReviewStatus = useSellerOffersStore((state) => state.refreshReviewStatus);
  const selectOffer = useSellerOffersStore((state) => state.selectOffer);

  const offer = offerId ? getOffer(offerId) : undefined;
  const [gradeTds, setGradeTds] = useState<SellerGradeTdsResponse | null>(null);
  const [gradeTdsLoading, setGradeTdsLoading] = useState(false);

  useEffect(() => {
    if (!offerId) {
      return;
    }
    const timer = setTimeout(() => {
      void (async () => {
        const refreshed = await refreshReviewStatus(offerId);
        if (refreshed?.status === 'active') {
          router.replace(`${ROUTES.SELLER.OFFER_APPROVED}?offerId=${offerId}` as Href);
        }
      })();
    }, 2500);
    return () => clearTimeout(timer);
  }, [offerId, refreshReviewStatus, router]);

  useEffect(() => {
    const productId = offer?.productId;
    if (!productId || !isBackendId(productId)) {
      setGradeTds(null);
      return;
    }
    let cancelled = false;
    setGradeTdsLoading(true);
    void (async () => {
      try {
        const result = await fetchSellerProductGradeTds(productId);
        if (!cancelled) setGradeTds(result);
      } catch {
        if (!cancelled) setGradeTds(null);
      } finally {
        if (!cancelled) setGradeTdsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [offer?.productId]);

  if (!offer) {
    return (
      <ScreenWrapper className="bg-brand-background">
        <Typography variant="roleTitle">Offer not found</Typography>
      </ScreenWrapper>
    );
  }

  const handleRefresh = async () => {
    const refreshed = await refreshReviewStatus(offer.id);
    if (refreshed?.status === 'active') {
      router.replace(`${ROUTES.SELLER.OFFER_APPROVED}?offerId=${offer.id}` as Href);
    }
  };

  const handleReviewTds = () => {
    if (!offer.productId || !isBackendId(offer.productId)) {
      Alert.alert(
        'Platform TDS',
        'Link this offer to a catalogue product to see verified platform TDS status.',
      );
      return;
    }
    if (gradeTdsLoading) {
      Alert.alert('Platform TDS', 'Checking library…');
      return;
    }
    if (!gradeTds) {
      Alert.alert('Platform TDS', 'Unable to load platform TDS status right now.');
      return;
    }
    if (!gradeTds.available) {
      Alert.alert(
        'Platform TDS',
        gradeTds.message ??
          'No verified platform TDS is linked yet. Customers will not see a datasheet until one is verified.',
      );
      return;
    }
    const first = gradeTds.items[0];
    Alert.alert(
      'Verified on platform',
      [
        gradeTds.product?.name ?? gradeTds.grade.name,
        first?.title ? `Document: ${first.title}` : null,
        first?.format ? `Format: ${String(first.format).toUpperCase()}` : null,
        'Customers see this verified TDS on the grade page.',
      ]
        .filter(Boolean)
        .join('\n'),
    );
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader title="PolyStoreX" showBack showBell />

      <ScrollView
        className="flex-1 px-lg"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Typography variant="headingLeft" className="mt-md text-[28px]">
          Offer Review Status
        </Typography>
        <Typography variant="subheading" className="mt-xs text-brand-body">
          Tracking your offer for {offer.product}.
        </Typography>

        <View className="mt-lg">
          <OfferReviewStatusBanner status="submitted" />
        </View>

        <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white px-md py-md">
          <Typography variant="badge" className="text-[11px] text-brand-body">
            CURRENT STATUS
          </Typography>
          <View className="mt-sm">
            <OfferStatusBadge status={offer.status} />
          </View>
        </View>

        <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white px-md py-md">
          <View className="flex-row items-center gap-sm">
            <BankIcon size={16} color={brandColors.heading} />
            <Typography variant="roleTitle">Financials</Typography>
          </View>
          <Typography variant="headingLeft" className="mt-md text-[28px] text-brand-navy">
            ₹{offer.basePrice.toLocaleString('en-IN')} / MT
          </Typography>
          {offer.tiers.map((tier) => (
            <View key={tier.id} className="mt-sm flex-row items-center justify-between">
              <Typography variant="roleDescription">{tier.label}</Typography>
              <View className="rounded-full bg-brand-primary-light px-sm py-xs">
                <Typography variant="badge" className="text-brand-primary">
                  {tier.discountPercent}% discount
                </Typography>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white px-md py-md">
          <View className="mb-md flex-row items-center gap-sm">
            <BuildingIcon size={16} color={brandColors.heading} />
            <Typography variant="roleTitle">Allocation</Typography>
          </View>
          <AllocationCard allocatedStock={offer.allocatedStock} />
        </View>

        <View className="mt-lg rounded-2xl border border-dashed border-brand-border bg-brand-white px-md py-lg">
          <Typography variant="roleTitle">Reviewer Comments</Typography>
          <Typography variant="roleDescription" className="mt-md text-center text-brand-body">
            {offer.reviewerComments ??
              'No comments from the review team yet. We will notify you if any changes are required.'}
          </Typography>
        </View>

        <OfferReviewTimeline steps={offer.reviewTimeline} />

        <View className="mt-lg overflow-hidden rounded-2xl bg-brand-navy px-md py-lg">
          <Typography variant="roleTitle" className="text-brand-white">
            Product Documentation
          </Typography>
          <Typography variant="roleDescription" className="mt-sm text-brand-white/80">
            Platform TDS status for {offer.grade}. Customers see verified datasheets on the grade
            page.
          </Typography>
          <Typography variant="legal" className="mt-sm text-left text-brand-white/70">
            {gradeTdsLoading
              ? 'Checking library…'
              : gradeTds?.available
                ? `Available · ${gradeTds.product?.name ?? gradeTds.grade.name}`
                : offer.productId && isBackendId(offer.productId)
                  ? (gradeTds?.message ?? 'Unavailable — no verified TDS linked yet.')
                  : 'Link a catalogue product to load TDS status.'}
          </Typography>
          <View className="mt-md gap-sm">
            <SecondaryButton
              label={
                gradeTdsLoading
                  ? 'Checking TDS…'
                  : gradeTds?.available
                    ? 'Review technical datasheet'
                    : 'View TDS status'
              }
              variant="outline"
              onPress={handleReviewTds}
            />
            <SecondaryButton label="Safety Certificate" variant="outline" onPress={() => undefined} />
          </View>
        </View>

        <View className="mt-lg gap-sm">
          <PrimaryButton label="Refresh Status" onPress={handleRefresh} />
          <SecondaryButton
            label="Back To Offers"
            variant="outline"
            onPress={() => {
              selectOffer(offer.id);
              router.push(ROUTES.SELLER.OFFERS as Href);
            }}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
});
