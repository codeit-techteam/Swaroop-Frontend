import { memo, useEffect, useMemo, useState } from 'react';

import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, ScreenWrapper, SecondaryButton, Typography } from '@/components';
import { ChevronDownIcon, ClockIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { SellerHeader } from '@/seller/components';
import {
  ActiveOfferCompactCard,
  BuyerPreviewCard,
  OfferTierCard,
  PriceHistorySheet,
  TierBottomSheet,
} from '@/seller/modules/seller-offers/components';
import {
  DEFAULT_WAREHOUSE,
  OFFER_VALIDITY_OPTIONS,
} from '@/seller/modules/seller-offers/services/sellerOffersService';
import { useSellerOffersStore } from '@/seller/modules/seller-offers/store/sellerOffersStore';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';
import type { SellerProduct } from '@/seller/types';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const CreateOfferScreen = memo(function CreateOfferScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { offerId } = useLocalSearchParams<{ offerId?: string }>();

  const editorForm = useSellerOffersStore((state) => state.editorForm);
  const activeOffers = useSellerOffersStore((state) => state.activeOffers);
  const pausedOffers = useSellerOffersStore((state) => state.pausedOffers);
  const updateEditorField = useSellerOffersStore((state) => state.updateEditorField);
  const addEditorTier = useSellerOffersStore((state) => state.addEditorTier);
  const removeEditorTier = useSellerOffersStore((state) => state.removeEditorTier);
  const saveDraft = useSellerOffersStore((state) => state.saveDraft);
  const activateOffer = useSellerOffersStore((state) => state.activateOffer);
  const selectOffer = useSellerOffersStore((state) => state.selectOffer);
  const pauseOffer = useSellerOffersStore((state) => state.pauseOffer);
  const duplicateOffer = useSellerOffersStore((state) => state.duplicateOffer);
  const deleteOffer = useSellerOffersStore((state) => state.deleteOffer);
  const resumeOffer = useSellerOffersStore((state) => state.resumeOffer);
  const loadEditorFromOffer = useSellerOffersStore((state) => state.loadEditorFromOffer);

  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [showTierSheet, setShowTierSheet] = useState(false);
  const [showGradePicker, setShowGradePicker] = useState(false);

  const sellerProducts = useSellerProductStore((state) => state.products);
  const productsHydrated = useSellerProductStore((state) => state.isHydrated);
  const hydrateProducts = useSellerProductStore((state) => state.hydrateFromApi);
  useEffect(() => {
    if (!productsHydrated) void hydrateProducts();
  }, [hydrateProducts, productsHydrated]);
  const offerProducts = useMemo(
    () =>
      sellerProducts.filter((product) => UUID_RE.test(product.id) && product.status !== 'inactive'),
    [sellerProducts],
  );

  const basePrice = Number(editorForm.basePrice) || 0;
  const listedOffers = useMemo(
    () => [...activeOffers, ...pausedOffers].slice(0, 12),
    [activeOffers, pausedOffers],
  );

  const handleProductSelect = (product: SellerProduct) => {
    updateEditorField('productGrade', product.form.name);
    updateEditorField('product', product.form.name);
    updateEditorField('grade', product.form.grade);
    updateEditorField('category', product.form.category);
    updateEditorField('productId', product.id);
    setShowGradePicker(false);
  };

  const handleSaveDraft = async () => {
    const draft = await saveDraft();
    if (draft) {
      selectOffer(draft.id);
    }
  };

  const handleActivate = async () => {
    const submitted = await activateOffer(offerId);
    if (submitted) {
      selectOffer(submitted.id);
      router.push(`${ROUTES.SELLER.OFFER_REVIEW_STATUS}?offerId=${submitted.id}` as Href);
    }
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader title="PetroTrade Seller" showBack showBell onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <View className="mt-md rounded-2xl border border-brand-border bg-brand-white px-md py-md">
          <Pressable className="flex-row items-center justify-between">
            <View>
              <Typography variant="roleTitle">{DEFAULT_WAREHOUSE.name}</Typography>
              <Typography variant="legal" className="text-left text-brand-body">
                {DEFAULT_WAREHOUSE.location}
              </Typography>
            </View>
            <ChevronDownIcon size={18} color={brandColors.body} />
          </Pressable>
          <View className="mt-sm flex-row items-center gap-sm">
            <View className="rounded-full bg-brand-success-light px-sm py-xs">
              <Typography variant="badge" className="text-brand-success">
                Trading Active
              </Typography>
            </View>
            <Typography variant="legal" className="text-brand-body">
              Last Updated: 2 mins ago
            </Typography>
          </View>
          <Pressable
            onPress={() => setShowPriceHistory(true)}
            className="mt-md flex-row items-center justify-center rounded-xl border border-brand-border py-md"
          >
            <ClockIcon size={16} color={brandColors.heading} />
            <Typography variant="roleTitle" className="ml-sm">
              Price History
            </Typography>
          </Pressable>
        </View>

        <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white px-md py-md">
          <Typography variant="headingLeft" className="text-[22px]">
            Create New Offer
          </Typography>

          <Typography variant="fieldLabel" className="mt-lg">
            Product Grade
          </Typography>
          <Pressable
            onPress={() => setShowGradePicker((value) => !value)}
            className="mt-sm flex-row items-center justify-between rounded-xl border border-brand-border bg-brand-surface px-md py-md"
          >
            <Typography variant="roleDescription">
              {editorForm.productGrade || 'Select one of your product listings'}
            </Typography>
            <ChevronDownIcon size={16} color={brandColors.body} />
          </Pressable>
          {showGradePicker ? (
            <View className="mt-sm rounded-xl border border-brand-border bg-brand-white">
              {!productsHydrated ? (
                <Typography variant="legal" className="px-md py-md text-left text-brand-body">
                  Loading your product listings…
                </Typography>
              ) : offerProducts.length === 0 ? (
                <Typography variant="legal" className="px-md py-md text-left text-brand-body">
                  No product listings yet. Add a product from the Grade Master catalog first.
                </Typography>
              ) : (
                offerProducts.map((product) => (
                  <Pressable
                    key={product.id}
                    onPress={() => handleProductSelect(product)}
                    className="border-b border-brand-border px-md py-md"
                  >
                    <Typography variant="roleDescription">{product.form.name}</Typography>
                    {product.form.grade ? (
                      <Typography variant="legal" className="text-left text-brand-body">
                        {product.form.grade}
                      </Typography>
                    ) : null}
                  </Pressable>
                ))
              )}
            </View>
          ) : null}

          <FormField
            label="Base Price (per kg)"
            prefix="₹"
            value={editorForm.basePrice}
            onChangeText={(value) => updateEditorField('basePrice', value)}
            keyboardType="decimal-pad"
          />
          <FormField
            label="Minimum Order Quantity (MOQ)"
            value={editorForm.moq}
            onChangeText={(value) => updateEditorField('moq', value)}
            suffix="MT"
            keyboardType="number-pad"
          />
          <Typography variant="fieldLabel" className="mt-md">
            Remarks
          </Typography>
          <TextInput
            value={editorForm.remarks}
            onChangeText={(value) => updateEditorField('remarks', value)}
            multiline
            numberOfLines={3}
            className="mt-sm min-h-[88px] rounded-xl border border-brand-border bg-brand-surface px-md py-md font-sans text-[15px] text-brand-heading"
            textAlignVertical="top"
          />

          <View className="mt-lg flex-row items-center justify-between">
            <Typography variant="badge" className="text-[11px] text-brand-body">
              BULK PRICING TIERS
            </Typography>
            <Pressable onPress={() => setShowTierSheet(true)}>
              <Typography variant="roleTitle" className="text-brand-primary">
                + Add New Tier
              </Typography>
            </Pressable>
          </View>

          {editorForm.tiers.map((tier) => (
            <OfferTierCard
              key={tier.id}
              tier={tier}
              basePrice={basePrice}
              onDelete={() => removeEditorTier(tier.id)}
            />
          ))}

          <Typography variant="fieldLabel" className="mt-lg">
            Validity
          </Typography>
          <View className="mt-sm flex-row flex-wrap gap-sm">
            {OFFER_VALIDITY_OPTIONS.map((option) => {
              const selected = editorForm.validity === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => updateEditorField('validity', option.value)}
                  className={cn(
                    'rounded-xl px-md py-sm',
                    selected ? 'bg-brand-navy' : 'bg-brand-surface',
                  )}
                >
                  <Typography
                    variant="roleTitle"
                    className={selected ? 'text-brand-white' : 'text-brand-heading'}
                  >
                    {option.label}
                  </Typography>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-lg">
          <Typography variant="roleTitle" className="mb-sm">
            Active Offers ({listedOffers.length})
          </Typography>
          {listedOffers.map((offer) => (
            <ActiveOfferCompactCard
              key={offer.id}
              offer={offer}
              onEdit={() => {
                loadEditorFromOffer(offer.id);
                router.push(`${ROUTES.SELLER.EDIT_OFFER}?offerId=${offer.id}` as Href);
              }}
              onPause={() => {
                void pauseOffer(offer.id);
              }}
              onResume={() => {
                void resumeOffer(offer.id);
              }}
              onDuplicate={() => {
                void (async () => {
                  const duplicated = await duplicateOffer(offer.id);
                  if (duplicated) {
                    loadEditorFromOffer(duplicated.id);
                  }
                })();
              }}
              onDelete={() => {
                void deleteOffer(offer.id);
              }}
            />
          ))}
        </View>

        <View className="mt-lg">
          <BuyerPreviewCard form={editorForm} />
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 flex-row gap-sm border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="flex-1">
          <SecondaryButton label="Save Draft" variant="outline" onPress={handleSaveDraft} />
        </View>
        <View className="flex-1">
          <PrimaryButton label="Activate Offer" onPress={handleActivate} />
        </View>
      </View>

      <PriceHistorySheet visible={showPriceHistory} onClose={() => setShowPriceHistory(false)} />
      <TierBottomSheet
        visible={showTierSheet}
        basePrice={basePrice}
        onClose={() => setShowTierSheet(false)}
        onSave={addEditorTier}
      />
    </ScreenWrapper>
  );
});

const FormField = ({
  label,
  value,
  onChangeText,
  prefix,
  suffix,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  prefix?: string;
  suffix?: string;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad';
}) => (
  <View className="mt-md">
    <Typography variant="fieldLabel">{label}</Typography>
    <View className="mt-sm flex-row items-center rounded-xl border border-brand-border bg-brand-surface">
      {prefix ? (
        <Typography variant="roleTitle" className="px-md">
          {prefix}
        </Typography>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        className="flex-1 py-md font-sans text-[15px] text-brand-heading"
      />
      {suffix ? (
        <Typography variant="roleTitle" className="px-md text-brand-body">
          {suffix}
        </Typography>
      ) : null}
    </View>
  </View>
);

export const EditOfferScreen = memo(function EditOfferScreen() {
  const { offerId } = useLocalSearchParams<{ offerId?: string }>();
  const loadEditorFromOffer = useSellerOffersStore((state) => state.loadEditorFromOffer);

  useEffect(() => {
    if (offerId) {
      loadEditorFromOffer(offerId);
    }
  }, [loadEditorFromOffer, offerId]);

  return <CreateOfferScreen />;
});
