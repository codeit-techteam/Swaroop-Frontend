import { memo, useMemo, useState } from 'react';

import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { ChevronDownIcon, LocationPinIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  BuyerPreviewCard,
  PricingCard,
  SellerBottomSheet,
  SellerHeader,
  SellerPrimaryButton,
  SellerTextField,
  SpecificationCard,
  TierCard,
  UploadCard,
} from '@/seller/components';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';

const CATEGORY_OPTIONS = ['Polymers', 'Petrochemicals', 'Industrial Chemicals', 'Lubricants'];
const ORIGIN_OPTIONS = ['India', 'UAE', 'Saudi Arabia', 'Singapore'];

export const SellerAddProductScreen = memo(function SellerAddProductScreen({
  mode = 'create',
}: {
  mode?: 'create' | 'edit';
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const form = useSellerProductStore((state) => state.form);
  const pricing = useSellerProductStore((state) => state.pricing);
  const tiers = useSellerProductStore((state) => state.tiers);
  const technicalSpecs = useSellerProductStore((state) => state.technicalSpecs);
  const formErrors = useSellerProductStore((state) => state.formErrors);
  const selectedProductId = useSellerProductStore((state) => state.selectedProductId);
  const updateFormField = useSellerProductStore((state) => state.updateFormField);
  const updatePricingField = useSellerProductStore((state) => state.updatePricingField);
  const updateTechnicalSpecField = useSellerProductStore((state) => state.updateTechnicalSpecField);
  const updateTier = useSellerProductStore((state) => state.updateTier);
  const addTier = useSellerProductStore((state) => state.addTier);
  const deleteTier = useSellerProductStore((state) => state.deleteTier);
  const moveTier = useSellerProductStore((state) => state.moveTier);
  const saveDraftProduct = useSellerProductStore((state) => state.saveDraftProduct);
  const publishProduct = useSellerProductStore((state) => state.publishProduct);

  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [originPickerVisible, setOriginPickerVisible] = useState(false);

  const screenTitle = mode === 'edit' || selectedProductId ? 'Edit Product' : 'Add New Product';
  const saveLabel = mode === 'edit' || selectedProductId ? 'Save Changes' : 'Save Draft';
  const publishLabel = mode === 'edit' || selectedProductId ? 'Publish Changes' : 'Publish Product';

  const previewProduct = useMemo(
    () => ({
      id: selectedProductId ?? 'preview',
      productId: selectedProductId ?? 'preview',
      status: 'draft' as const,
      createdAt: '',
      updatedAt: '',
      imageUrl: '',
      form,
      pricing,
      tiers,
      technicalSpecs,
    }),
    [form, pricing, selectedProductId, technicalSpecs, tiers],
  );

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader showBack showBell title={screenTitle} onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28, paddingTop: 8 }}
      >
        <Typography variant="headingLeft" className="text-[32px]">
          {screenTitle}
        </Typography>
        <Typography variant="subheadingLeft" className="mt-xs">
          List your petrochemical inventory on the global marketplace.
        </Typography>

        <SpecificationCard title="Product Information">
          <View className="gap-md">
            <SellerTextField
              label="Product Name"
              value={form.name}
              onChangeText={(value) => updateFormField('name', value)}
              placeholder="e.g. HDPE Granules"
              error={formErrors.name}
            />
            <View className="flex-row gap-md">
              <SellerTextField
                label="Grade"
                value={form.grade}
                onChangeText={(value) => updateFormField('grade', value)}
                placeholder="PE100"
                containerClassName="flex-1"
                error={formErrors.grade}
              />
              <Pressable className="flex-1" onPress={() => setCategoryPickerVisible(true)}>
                <SellerTextField
                  label="Category"
                  value={form.category}
                  editable={false}
                  rightSlot={<ChevronDownIcon size={iconSizes.sm} color={brandColors.body} />}
                  error={formErrors.category}
                />
              </Pressable>
            </View>
            <View className="flex-row gap-md">
              <SellerTextField
                label="Brand"
                value={form.brand}
                onChangeText={(value) => updateFormField('brand', value)}
                containerClassName="flex-1"
                error={formErrors.brand}
              />
              <Pressable className="flex-1" onPress={() => setOriginPickerVisible(true)}>
                <SellerTextField
                  label="Origin"
                  value={form.origin}
                  editable={false}
                  rightSlot={<ChevronDownIcon size={iconSizes.sm} color={brandColors.body} />}
                  error={formErrors.origin}
                />
              </Pressable>
            </View>
            <View>
              <Typography variant="fieldLabel" className="mb-sm">
                Description
              </Typography>
              <View
                className={`rounded-md border bg-brand-white px-md ${
                  formErrors.description ? 'border-brand-error' : 'border-brand-border'
                }`}
              >
                <TextInput
                  value={form.description}
                  onChangeText={(value) => updateFormField('description', value)}
                  placeholder="Describe material properties, color, and packaging..."
                  placeholderTextColor={brandColors.footer}
                  multiline
                  textAlignVertical="top"
                  className="min-h-[108px] py-md font-sans text-[15px] text-brand-heading"
                />
              </View>
              {formErrors.description ? (
                <Typography variant="error" className="mt-xs">
                  {formErrors.description}
                </Typography>
              ) : null}
            </View>
          </View>
        </SpecificationCard>

        <View className="mt-lg">
          <SpecificationCard title="Inventory & Logistics">
            <View className="gap-md">
              <View className="flex-row gap-md">
                <SellerTextField
                  label="Available Qty (MT)"
                  value={form.availableQty}
                  onChangeText={(value) => updateFormField('availableQty', value)}
                  keyboardType="numeric"
                  containerClassName="flex-1"
                  error={formErrors.availableQty}
                />
                <SellerTextField
                  label="MOQ (MT)"
                  value={form.moq}
                  onChangeText={(value) => updateFormField('moq', value)}
                  keyboardType="numeric"
                  containerClassName="flex-1"
                  error={formErrors.moq}
                />
              </View>
              <SellerTextField
                label="Warehouse Location"
                value={form.warehouseLocation}
                onChangeText={(value) => updateFormField('warehouseLocation', value)}
                leftSlot={<LocationPinIcon size={16} color={brandColors.body} />}
                error={formErrors.warehouseLocation}
              />
            </View>
          </SpecificationCard>
        </View>

        <View className="mt-lg">
          <SpecificationCard title="Payment Term Pricing">
            <Typography variant="subheadingLeft" className="mb-md">
              Configure pricing variations based on buyer payment flexibility.
            </Typography>
            <View className="gap-md">
              <PricingCard
                label="Advance Price (USD/MT)"
                value={pricing.advance}
                onChange={(value) => updatePricingField('advance', value)}
              />
              <PricingCard
                label="On Loading"
                value={pricing.onLoading}
                onChange={(value) => updatePricingField('onLoading', value)}
              />
              <PricingCard
                label="On Delivery"
                value={pricing.onDelivery}
                onChange={(value) => updatePricingField('onDelivery', value)}
              />
              <PricingCard
                label="15 Days Credit"
                value={pricing.credit15Days}
                onChange={(value) => updatePricingField('credit15Days', value)}
              />
              <PricingCard
                label="30 Days Credit"
                value={pricing.credit30Days}
                onChange={(value) => updatePricingField('credit30Days', value)}
              />
            </View>
          </SpecificationCard>
        </View>

        <View className="mt-lg">
          <View className="mb-md flex-row items-center justify-between">
            <Typography variant="caption" className="text-left text-brand-heading">
              Bulk Pricing Tiers
            </Typography>
            <Pressable onPress={addTier}>
              <Typography variant="link">Add Tier</Typography>
            </Pressable>
          </View>
          <View className="gap-md">
            {tiers.map((tier, index) => (
              <TierCard
                key={tier.id}
                index={index}
                tier={tier}
                onChange={(patch) => updateTier(tier.id, patch)}
                onDelete={() => deleteTier(tier.id)}
                onMoveUp={() => moveTier(tier.id, 'up')}
                onMoveDown={() => moveTier(tier.id, 'down')}
              />
            ))}
          </View>
        </View>

        <View className="mt-lg">
          <BuyerPreviewCard
            product={previewProduct.form}
            pricing={previewProduct.pricing}
            technicalSpecs={previewProduct.technicalSpecs}
            tiers={previewProduct.tiers}
          />
        </View>

        <View className="mt-lg">
          <SpecificationCard title="Technical Specifications">
            <View className="gap-md">
              <View className="flex-row gap-md">
                <SellerTextField
                  label="MFI (g/10min)"
                  value={technicalSpecs.mfi}
                  onChangeText={(value) => updateTechnicalSpecField('mfi', value)}
                  containerClassName="flex-1"
                  error={formErrors.mfi}
                />
                <SellerTextField
                  label="Density (g/cm3)"
                  value={technicalSpecs.density}
                  onChangeText={(value) => updateTechnicalSpecField('density', value)}
                  containerClassName="flex-1"
                  error={formErrors.density}
                />
              </View>
              <SellerTextField
                label="Primary Application"
                value={technicalSpecs.primaryApplication}
                onChangeText={(value) => updateTechnicalSpecField('primaryApplication', value)}
                error={formErrors.primaryApplication}
              />
              <UploadCard
                title="Technical Datasheet (TDS)"
                fileName={technicalSpecs.technicalDatasheetName}
                onPress={() =>
                  updateTechnicalSpecField('technicalDatasheetName', `${form.name || 'product'}-tds.pdf`)
                }
              />
              <UploadCard
                title="Quality Certificate (COA)"
                fileName={technicalSpecs.qualityCertificateName}
                onPress={() =>
                  updateTechnicalSpecField(
                    'qualityCertificateName',
                    `${form.name || 'product'}-quality-certificate.pdf`,
                  )
                }
              />
            </View>
          </SpecificationCard>
        </View>

        <View className="mt-xl flex-row gap-md">
          <Pressable
            onPress={() => {
              const result = saveDraftProduct();
              if (result.success) {
                router.replace(ROUTES.SELLER.PRODUCTS as Href);
              }
            }}
            className="flex-1 items-center justify-center rounded-2xl border border-brand-border bg-brand-white px-lg py-lg"
          >
            <Typography variant="roleTitle" className="text-brand-heading">
              {saveLabel}
            </Typography>
          </Pressable>
          <SellerPrimaryButton
            label={publishLabel}
            className="flex-1"
            onPress={() => {
              const result = publishProduct();
              if (result.success && result.productId) {
                router.replace(
                  `${ROUTES.SELLER.PRODUCT_PUBLISHED}?id=${encodeURIComponent(result.productId)}` as Href,
                );
              }
            }}
          />
        </View>
      </ScrollView>

      <SellerBottomSheet
        title="Select Category"
        items={CATEGORY_OPTIONS}
        selectedValue={form.category}
        visible={categoryPickerVisible}
        onClose={() => setCategoryPickerVisible(false)}
        onSelect={(value) => updateFormField('category', value)}
      />
      <SellerBottomSheet
        title="Select Origin"
        items={ORIGIN_OPTIONS}
        selectedValue={form.origin}
        visible={originPickerVisible}
        onClose={() => setOriginPickerVisible(false)}
        onSelect={(value) => updateFormField('origin', value)}
      />
    </ScreenWrapper>
  );
});
