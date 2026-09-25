import { memo, useMemo, useState } from 'react';

import { ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, ScreenWrapper, SecondaryButton, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { ConfirmationBottomSheet } from '@/seller/modules/seller-orders/components/ConfirmationBottomSheet';
import {
  BuyerPreviewCard,
  OfferAnalyticsCard,
  OfferStatusBadge,
  OfferTierList,
} from '@/seller/modules/seller-offers/components';
import {
  AllocationCard,
  OfferReviewTimeline,
  OfferSummaryCard,
} from '@/seller/modules/seller-offers/components/OfferReviewTimeline';
import { buildOfferDetailTimeline, calculateOfferRevenue } from '@/seller/mock/offers';
import { createEditorFormFromOffer } from '@/seller/modules/seller-offers/services/sellerOffersService';
import { useSellerOffersStore } from '@/seller/modules/seller-offers/store/sellerOffersStore';
import { SellerHeader } from '@/seller/components';

type ConfirmAction = 'pause' | 'archive' | 'duplicate' | null;

export const OfferDetailsScreen = memo(function OfferDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { offerId } = useLocalSearchParams<{ offerId?: string }>();
  const getOffer = useSellerOffersStore((state) => state.getOffer);
  const loadEditorFromOffer = useSellerOffersStore((state) => state.loadEditorFromOffer);
  const pauseOffer = useSellerOffersStore((state) => state.pauseOffer);
  const duplicateOffer = useSellerOffersStore((state) => state.duplicateOffer);
  const deleteOffer = useSellerOffersStore((state) => state.deleteOffer);

  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const offer = offerId ? getOffer(offerId) : undefined;

  const timeline = useMemo(
    () => (offer ? buildOfferDetailTimeline(offer.id) : []),
    [offer],
  );

  const revenue = useMemo(
    () => (offer ? calculateOfferRevenue(offer.analytics.orders, offer.basePrice) : '₹0'),
    [offer],
  );

  if (!offer) {
    return (
      <ScreenWrapper className="bg-brand-background">
        <Typography variant="roleTitle">Offer not found</Typography>
      </ScreenWrapper>
    );
  }

  const handleConfirm = async () => {
    if (confirmAction === 'pause') {
      const paused = await pauseOffer(offer.id);
      if (paused) {
        router.push(`${ROUTES.SELLER.OFFER_PAUSED}?offerId=${offer.id}` as Href);
      }
    }
    if (confirmAction === 'archive') {
      const ok = await deleteOffer(offer.id);
      if (ok) {
        router.push(ROUTES.SELLER.OFFERS as Href);
      }
    }
    if (confirmAction === 'duplicate') {
      const duplicated = await duplicateOffer(offer.id);
      if (duplicated) {
        loadEditorFromOffer(duplicated.id);
        router.push(ROUTES.SELLER.CREATE_OFFER as Href);
      }
    }
    setConfirmAction(null);
  };

  const confirmCopy =
    confirmAction === 'pause'
      ? {
          title: 'Pause Offer',
          message: 'Buyers will no longer see this offer until you resume it.',
          confirmLabel: 'Pause Offer',
        }
      : confirmAction === 'archive'
        ? {
            title: 'Archive Offer',
            message: 'This offer will be removed from your active catalog.',
            confirmLabel: 'Archive',
          }
        : {
            title: 'Duplicate Offer',
            message:
              'Create a copy of this offer with the same pricing tiers and inventory settings.',
            confirmLabel: 'Duplicate',
          };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader title="Offer Detail" showBack showBell onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-lg"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <View className="mt-md flex-row items-center justify-between">
          <Typography variant="headingLeft" className="text-[26px]">
            {offer.product}
          </Typography>
          <OfferStatusBadge status={offer.status} />
        </View>

        <OfferSummaryCard title="Offer Summary">
          <View className="flex-row flex-wrap">
            {[
              { label: 'Offer ID', value: offer.offerId },
              { label: 'Status', value: offer.status.replace(/_/g, ' ') },
              { label: 'Created', value: new Date(offer.createdAt).toLocaleDateString('en-IN') },
              { label: 'Expiry', value: new Date(offer.expiresAt).toLocaleDateString('en-IN') },
            ].map((row) => (
              <View key={row.label} className="mb-md w-1/2 pr-sm">
                <Typography variant="legal" className="text-left text-brand-body">
                  {row.label}
                </Typography>
                <Typography variant="roleTitle" className="mt-xs capitalize">
                  {row.value}
                </Typography>
              </View>
            ))}
          </View>
        </OfferSummaryCard>

        <View className="mt-lg">
          <OfferSummaryCard title="Inventory">
            <View className="flex-row flex-wrap">
              {[
                { label: 'Available', value: `${offer.remainingStock} MT` },
                { label: 'Reserved', value: `${offer.reservedStock} MT` },
                { label: 'Allocated', value: `${offer.allocatedStock} MT` },
              ].map((row) => (
                <View key={row.label} className="mb-md w-1/3 pr-sm">
                  <Typography variant="legal" className="text-left text-brand-body">
                    {row.label}
                  </Typography>
                  <Typography variant="roleTitle" className="mt-xs">
                    {row.value}
                  </Typography>
                </View>
              ))}
            </View>
            <AllocationCard allocatedStock={offer.allocatedStock} />
          </OfferSummaryCard>
        </View>

        <View className="mt-lg overflow-hidden rounded-2xl border border-brand-border bg-brand-white">
          <View className="px-md py-md">
            <Typography variant="roleTitle" className="text-brand-heading">
              Bulk Pricing
            </Typography>
            <OfferTierList tiers={offer.tiers} highlightLast showHeader={false} />
          </View>
        </View>

        <View className="mt-lg">
          <Typography variant="roleTitle" className="mb-sm text-brand-heading">
            Buyer Preview
          </Typography>
          <BuyerPreviewCard form={createEditorFormFromOffer(offer)} />
        </View>

        <View className="mt-lg overflow-hidden rounded-2xl border border-brand-border bg-brand-white">
          <OfferAnalyticsCard analytics={offer.analytics} />
          <View className="border-t border-brand-border px-md py-md">
            <Typography variant="legal" className="text-left text-brand-body">
              Revenue
            </Typography>
            <Typography variant="roleTitle" className="mt-xs text-[#0B4A8B]">
              {revenue}
            </Typography>
          </View>
        </View>

        <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white px-md py-md">
          <OfferReviewTimeline steps={offer.reviewTimeline.length ? offer.reviewTimeline : timeline.map((step) => ({
            id: step.id,
            title: step.title,
            subtitle: step.subtitle,
            status: step.status === 'current' ? 'in_progress' as const : step.status === 'completed' ? 'completed' as const : 'pending' as const,
            timestamp: step.timestamp,
          }))} />
        </View>

        <View className="mt-lg gap-sm">
          <PrimaryButton
            label="Edit"
            onPress={() => {
              loadEditorFromOffer(offer.id);
              router.push(`${ROUTES.SELLER.EDIT_OFFER}?offerId=${offer.id}` as Href);
            }}
          />
          <SecondaryButton label="Pause" variant="outline" onPress={() => setConfirmAction('pause')} />
          <SecondaryButton label="Duplicate" variant="outline" onPress={() => setConfirmAction('duplicate')} />
          <SecondaryButton label="Archive" variant="outline" onPress={() => setConfirmAction('archive')} />
        </View>
      </ScrollView>

      {confirmAction ? (
        <ConfirmationBottomSheet
          visible
          title={confirmCopy.title}
          message={confirmCopy.message}
          confirmLabel={confirmCopy.confirmLabel}
          onCancel={() => setConfirmAction(null)}
          onConfirm={handleConfirm}
        />
      ) : null}
    </ScreenWrapper>
  );
});

export const OfferPreviewScreen = memo(function OfferPreviewScreen() {
  const editorForm = useSellerOffersStore((state) => state.editorForm);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader title="Offer Preview" showBack onBack={() => router.back()} />
      <ScrollView
        className="flex-1 px-lg"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <Typography variant="headingLeft" className="mt-md text-[26px]">
          Buyer Preview
        </Typography>
        <View className="mt-lg">
          <BuyerPreviewCard form={editorForm} />
        </View>
        <View className="mt-lg">
          <SecondaryButton label="Back" variant="outline" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
});
