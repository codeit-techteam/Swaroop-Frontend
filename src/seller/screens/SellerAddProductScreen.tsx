import { memo, useEffect, useMemo, useRef, useState } from 'react';

import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { ScreenWrapper, Typography } from '@/components';
import { fetchSellerCatalogProducts, getLiveCatalogProduct } from '@/services/catalog';
import {
  SELLER_CATALOG_PARENT_FILTERS,
  getCatalogGradesForFamily,
  getMaterialsByParentGroup,
  searchCatalogGrades,
  type SellerMaterialFamily,
} from '@/constants/materials-taxonomy';
import { BackArrowIcon, ChevronDownIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  BuyerPreviewCard,
  FilterChipRow,
  SearchField,
  SellerBottomSheet,
  SellerHeader,
  SellerPrimaryButton,
  SellerTextField,
  SpecificationCard,
  TierCard,
  UploadCard,
} from '@/seller/components';
import {
  SellerCatalogGradeRow,
  SellerCatalogSelectedBanner,
  SellerMaterialTile,
} from '@/seller/components/SellerCatalogComponents';
import {
  SELLER_ORIGIN_OPTIONS,
  SELLER_PACKAGING_TYPES,
  SELLER_PAYMENT_TERM_PRICE_FIELDS,
  SELLER_UNIT_OPTIONS,
} from '@/seller/constants/grade-options';
import { INVENTORY_WAREHOUSES } from '@/seller/services/inventoryService';
import { useSellerProductStore } from '@/seller/store/sellerProductStore';
import type { SellerPaymentPricing, SellerProductForm } from '@/seller/types';
import { PETROTRADE_CREDIT_NOTE } from '@/seller/utils/pricing';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { MarketProduct } from '@/types/market';
import { cn } from '@/utils/cn';

type ListingStep = 1 | 2 | 3;
type PickerKey = 'origin' | 'packagingType' | 'unit' | 'warehouse';

const STEPS: { id: ListingStep; label: string }[] = [
  { id: 1, label: 'Grade' },
  { id: 2, label: 'Offer' },
  { id: 3, label: 'Price' },
];

const PriceRow = memo(function PriceRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View className="flex-row items-center border-b border-brand-border py-sm last:border-b-0">
      <Typography variant="roleDescription" className="flex-1 text-brand-body">
        {label.replace(' (₹/MT)', '')}
      </Typography>
      <View className="min-w-[132px] flex-row items-center rounded-xl bg-brand-surface px-sm">
        <Typography variant="legal" className="text-brand-body">
          ₹
        </Typography>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={brandColors.footer}
          className="flex-1 py-sm text-right font-sans text-[16px] font-bold text-brand-heading"
        />
        <Typography variant="legal" className="ml-xs text-brand-footer">
          /MT
        </Typography>
      </View>
    </View>
  );
});

export const SellerAddProductScreen = memo(function SellerAddProductScreen({
  mode = 'create',
}: {
  mode?: 'create' | 'edit';
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const { catalogId, materialType } = useLocalSearchParams<{
    catalogId?: string;
    materialType?: string;
  }>();
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
  const applyCatalogGrade = useSellerProductStore((state) => state.applyCatalogGrade);

  const isEdit = mode === 'edit' || Boolean(selectedProductId);
  const [step, setStep] = useState<ListingStep>(isEdit || catalogId ? 2 : 1);
  const [activePicker, setActivePicker] = useState<PickerKey | null>(null);
  const [parentGroup, setParentGroup] = useState<(typeof SELLER_CATALOG_PARENT_FILTERS)[number]>('All');
  const [selectedFamily, setSelectedFamily] = useState<SellerMaterialFamily | null>(null);
  const [query, setQuery] = useState('');
  const [catalogProducts, setCatalogProducts] = useState<MarketProduct[]>([]);
  const appliedCatalogRef = useRef<string | null>(null);

  useEffect(() => {
    void fetchSellerCatalogProducts()
      .then(setCatalogProducts)
      .catch(() => setCatalogProducts([]));
  }, []);

  const selectedCatalog = form.catalogProductId
    ? getLiveCatalogProduct(form.catalogProductId) ??
      catalogProducts.find((item) => item.id === form.catalogProductId)
    : undefined;
  const families = useMemo(
    () => getMaterialsByParentGroup(catalogProducts, parentGroup),
    [catalogProducts, parentGroup],
  );
  const catalogGrades = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed) {
      return searchCatalogGrades(catalogProducts, trimmed);
    }
    if (!selectedFamily) {
      return [];
    }
    return getCatalogGradesForFamily(catalogProducts, selectedFamily.name);
  }, [catalogProducts, query, selectedFamily]);

  useEffect(() => {
    if (isEdit) {
      return;
    }
    if (catalogId && appliedCatalogRef.current !== catalogId) {
      applyCatalogGrade(catalogId);
      appliedCatalogRef.current = catalogId;
      setStep(2);
      return;
    }
    if (!catalogId && materialType && !form.category) {
      updateFormField('category', materialType);
      const family = families.find((item) => item.name === materialType) ?? null;
      setSelectedFamily(family);
    }
  }, [applyCatalogGrade, catalogId, families, form.category, isEdit, materialType, updateFormField]);

  const pickers: Record<PickerKey, { title: string; field: keyof SellerProductForm; items: readonly string[] }> = {
    origin: { title: 'Select origin', field: 'origin', items: SELLER_ORIGIN_OPTIONS },
    packagingType: { title: 'Select packaging', field: 'packagingType', items: SELLER_PACKAGING_TYPES },
    unit: { title: 'Select unit', field: 'unit', items: SELLER_UNIT_OPTIONS },
    warehouse: { title: 'Select warehouse', field: 'warehouseLocation', items: INVENTORY_WAREHOUSES },
  };

  const screenTitle = isEdit ? 'Edit listing' : 'Add listing';

  const goToStep = (next: ListingStep) => {
    setStep(next);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleSelectGrade = (id: string) => {
    applyCatalogGrade(id);
    goToStep(2);
  };

  const continueFromOffer = () => {
    if (!form.catalogProductId) {
      Toast.show({ type: 'info', text1: 'Pick a marketplace grade first' });
      goToStep(1);
      return;
    }
    if (!form.brand.trim() || !form.availableQty.trim() || !form.warehouseLocation.trim() || !form.moq.trim()) {
      Toast.show({
        type: 'info',
        text1: 'Complete offer details',
        text2: 'Brand, stock, warehouse, and MOQ are required.',
      });
      return;
    }
    goToStep(3);
  };

  const handleSaveDraft = () => {
    const result = saveDraftProduct();
    if (result.success) {
      router.replace(ROUTES.SELLER.PRODUCTS as Href);
      return;
    }
    Toast.show({ type: 'info', text1: 'Add a grade name before saving draft' });
  };

  const handlePublish = () => {
    const result = publishProduct();
    if (result.success && result.productId) {
      router.replace(
        `${ROUTES.SELLER.PRODUCT_PUBLISHED}?id=${encodeURIComponent(result.productId)}` as Href,
      );
      return;
    }
    Toast.show({
      type: 'info',
      text1: 'Listing is incomplete',
      text2: 'Check offer details and description, then try again.',
    });
    goToStep(2);
  };

  const renderPickerField = (picker: PickerKey, label: string, value: string, error?: string) => (
    <Pressable className="flex-1" onPress={() => setActivePicker(picker)}>
      <SellerTextField
        label={label}
        value={value}
        editable={false}
        rightSlot={<ChevronDownIcon size={iconSizes.sm} color={brandColors.body} />}
        error={error}
      />
    </Pressable>
  );

  const showTiles = !query.trim() && !selectedFamily;

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader showBack title={screenTitle} onBack={() => router.back()} />

      <View className="flex-row px-lg pb-sm pt-sm">
        {STEPS.map((item, index) => {
          const active = step === item.id;
          const done = step > item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                if (item.id === 1 || selectedCatalog) {
                  goToStep(item.id);
                }
              }}
              className="flex-1 flex-row items-center"
            >
              <View
                className={cn(
                  'h-7 w-7 items-center justify-center rounded-full',
                  active || done ? 'bg-brand-navy' : 'bg-brand-surface',
                )}
              >
                <Typography
                  variant="badge"
                  className={cn('text-[11px]', active || done ? 'text-brand-white' : 'text-brand-body')}
                >
                  {item.id}
                </Typography>
              </View>
              <Typography
                variant="badge"
                className={cn('ml-xs text-[11px]', active ? 'text-brand-navy' : 'text-brand-body')}
              >
                {item.label}
              </Typography>
              {index < STEPS.length - 1 ? (
                <View className={cn('mx-sm h-px flex-1', done ? 'bg-brand-navy' : 'bg-brand-border')} />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-lg"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + 108, paddingTop: 8 }}
        >
          {step === 1 ? (
            <View>
              <Typography variant="headingLeft" className="text-[26px] leading-[32px]">
                Choose a grade
              </Typography>
              <Typography variant="legal" className="mt-xs text-left text-brand-body">
                List the same SKU buyers already browse in the customer app.
              </Typography>

              <View className="mt-lg">
                <SearchField
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search HDPE, Melamine, PE100..."
                />
              </View>
              <View className="mt-md">
                <FilterChipRow
                  options={[...SELLER_CATALOG_PARENT_FILTERS]}
                  selected={parentGroup}
                  onSelect={(value) => {
                    setParentGroup(value as (typeof SELLER_CATALOG_PARENT_FILTERS)[number]);
                    setSelectedFamily(null);
                  }}
                />
              </View>

              {selectedFamily && !query.trim() ? (
                <Pressable
                  onPress={() => setSelectedFamily(null)}
                  className="mt-lg flex-row items-center"
                >
                  <BackArrowIcon size={16} color={brandColors.navy} />
                  <Typography variant="roleTitle" className="ml-sm text-[14px] text-brand-navy">
                    {selectedFamily.code}
                  </Typography>
                </Pressable>
              ) : null}

              {showTiles ? (
                <View className="mt-lg flex-row flex-wrap justify-between">
                  {families.map((family) => (
                    <View key={family.id} className="mb-md" style={{ width: '48.5%' }}>
                      <SellerMaterialTile
                        family={family}
                        onPress={() => setSelectedFamily(family)}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <View className="mt-lg gap-md">
                  {catalogGrades.map((product) => (
                    <SellerCatalogGradeRow
                      key={product.id}
                      product={product}
                      onPress={() => handleSelectGrade(product.id)}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : null}

          {step === 2 ? (
            <View>
              <Typography variant="headingLeft" className="text-[26px] leading-[32px]">
                Offer details
              </Typography>
              <Typography variant="legal" className="mt-xs text-left text-brand-body">
                Set the brand, stock, and warehouse for this grade.
              </Typography>

              <View className="mt-lg">
                {selectedCatalog ? (
                  <SellerCatalogSelectedBanner product={selectedCatalog} onChange={() => goToStep(1)} />
                ) : (
                  <Pressable
                    onPress={() => goToStep(1)}
                    className="rounded-2xl border border-dashed border-brand-navy bg-brand-primary-tint px-md py-lg"
                  >
                    <Typography variant="roleTitle" className="text-center text-brand-navy">
                      Select marketplace grade
                    </Typography>
                  </Pressable>
                )}
              </View>

              <View className="mt-lg">
                <SpecificationCard title="Your offer">
                  <View className="gap-md">
                    <SellerTextField
                      label="Manufacturer / Brand"
                      value={form.brand}
                      onChangeText={(value) => updateFormField('brand', value)}
                      placeholder="Reliance, SCG, IOCL"
                      error={formErrors.brand}
                    />
                    <View className="flex-row gap-md">
                      <SellerTextField
                        label={`Available stock (${form.unit || 'MT'})`}
                        value={form.availableQty}
                        onChangeText={(value) => updateFormField('availableQty', value)}
                        keyboardType="numeric"
                        containerClassName="flex-1"
                        error={formErrors.availableQty}
                      />
                      {renderPickerField('unit', 'Unit', form.unit, formErrors.unit)}
                    </View>
                    <View className="flex-row gap-md">
                      <SellerTextField
                        label="MOQ"
                        value={form.moq}
                        onChangeText={(value) => updateFormField('moq', value)}
                        keyboardType="numeric"
                        containerClassName="flex-1"
                        error={formErrors.moq}
                      />
                      {renderPickerField('origin', 'Origin', form.origin, formErrors.origin)}
                    </View>
                    {renderPickerField(
                      'warehouse',
                      'Warehouse',
                      form.warehouseLocation,
                      formErrors.warehouseLocation,
                    )}
                    <View className="flex-row gap-md">
                      <SellerTextField
                        label="Reserved"
                        value={form.reservedQty}
                        onChangeText={(value) => updateFormField('reservedQty', value)}
                        keyboardType="numeric"
                        containerClassName="flex-1"
                      />
                      <SellerTextField
                        label="GST %"
                        value={form.gstPercent}
                        onChangeText={(value) => updateFormField('gstPercent', value)}
                        keyboardType="numeric"
                        containerClassName="flex-1"
                      />
                    </View>
                    {renderPickerField('packagingType', 'Packaging', form.packagingType, formErrors.packagingType)}
                    <SellerTextField
                      label="Application"
                      value={technicalSpecs.primaryApplication}
                      onChangeText={(value) => updateTechnicalSpecField('primaryApplication', value)}
                      placeholder="Pipe, film, raffia"
                      error={formErrors.primaryApplication}
                    />
                    {(technicalSpecs.mfi || technicalSpecs.density || selectedCatalog?.technicalSpecs?.mfi) ? (
                      <View className="flex-row gap-md">
                        <SellerTextField
                          label="MFI"
                          value={technicalSpecs.mfi}
                          onChangeText={(value) => updateTechnicalSpecField('mfi', value)}
                          containerClassName="flex-1"
                          error={formErrors.mfi}
                        />
                        <SellerTextField
                          label="Density"
                          value={technicalSpecs.density}
                          onChangeText={(value) => updateTechnicalSpecField('density', value)}
                          containerClassName="flex-1"
                          error={formErrors.density}
                        />
                      </View>
                    ) : null}
                    <View>
                      <Typography variant="fieldLabel" className="mb-sm">
                        Notes for buyers
                      </Typography>
                      <View
                        className={`rounded-2xl border bg-brand-white px-md ${
                          formErrors.description ? 'border-brand-error' : 'border-brand-border'
                        }`}
                      >
                        <TextInput
                          value={form.description}
                          onChangeText={(value) => updateFormField('description', value)}
                          placeholder="Colour, packing, and dispatch notes..."
                          placeholderTextColor={brandColors.footer}
                          multiline
                          textAlignVertical="top"
                          className="min-h-[92px] py-md font-sans text-[15px] text-brand-heading"
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
              </View>
            </View>
          ) : null}

          {step === 3 ? (
            <View>
              <Typography variant="headingLeft" className="text-[26px] leading-[32px]">
                Pricing
              </Typography>
              <Typography variant="legal" className="mt-xs text-left text-brand-body">
                Enter the selling price for this listing. Payment method does not change this price.
              </Typography>

              {selectedCatalog ? (
                <View className="mt-lg">
                  <SellerCatalogSelectedBanner product={selectedCatalog} onChange={() => goToStep(1)} />
                </View>
              ) : null}

              <View className="mt-lg">
                <SpecificationCard title="Selling price">
                  <View>
                    {SELLER_PAYMENT_TERM_PRICE_FIELDS.map((item) => (
                      <PriceRow
                        key={item.key}
                        label={item.label}
                        value={pricing[item.key as keyof SellerPaymentPricing]}
                        onChange={(value) => updatePricingField(item.key, value)}
                      />
                    ))}
                  </View>
                  {formErrors.sellingPrice ? (
                    <Typography variant="error" className="mt-sm">
                      {formErrors.sellingPrice}
                    </Typography>
                  ) : null}
                  <Typography variant="legal" className="mt-md text-left text-brand-body">
                    {PETROTRADE_CREDIT_NOTE}
                  </Typography>
                </SpecificationCard>
              </View>

              <View className="mt-lg">
                <View className="mb-md flex-row items-center justify-between">
                  <Typography variant="roleTitle" className="text-[16px]">
                    Bulk tiers
                  </Typography>
                  <Pressable onPress={addTier} className="rounded-full bg-brand-primary-light px-md py-sm">
                    <Typography variant="badge" className="text-[11px] text-brand-navy">
                      Add tier
                    </Typography>
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
                  product={form}
                  pricing={pricing}
                  technicalSpecs={technicalSpecs}
                  tiers={tiers}
                />
              </View>

              <View className="mt-lg">
                <SpecificationCard title="Documents">
                  <View className="gap-md">
                    <UploadCard
                      title="Technical datasheet (TDS)"
                      fileName={technicalSpecs.technicalDatasheetName}
                      onPress={() =>
                        updateTechnicalSpecField(
                          'technicalDatasheetName',
                          `${form.name || 'product'}-tds.pdf`,
                        )
                      }
                    />
                    <UploadCard
                      title="Quality certificate (COA)"
                      fileName={technicalSpecs.qualityCertificateName}
                      onPress={() =>
                        updateTechnicalSpecField(
                          'qualityCertificateName',
                          `${form.name || 'product'}-coa.pdf`,
                        )
                      }
                    />
                  </View>
                </SpecificationCard>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        className="border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        {step === 1 ? (
          <SellerPrimaryButton
            label={selectedCatalog ? 'Continue with this grade' : 'Select a grade to continue'}
            disabled={!selectedCatalog}
            onPress={() => (selectedCatalog ? goToStep(2) : undefined)}
          />
        ) : null}
        {step === 2 ? (
          <View className="flex-row gap-sm">
            <Pressable
              onPress={handleSaveDraft}
              className="flex-1 items-center justify-center rounded-2xl border border-brand-border bg-brand-white py-md"
            >
              <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                Save draft
              </Typography>
            </Pressable>
            <SellerPrimaryButton label="Continue" className="flex-1" onPress={continueFromOffer} />
          </View>
        ) : null}
        {step === 3 ? (
          <View className="flex-row gap-sm">
            <Pressable
              onPress={handleSaveDraft}
              className="flex-1 items-center justify-center rounded-2xl border border-brand-border bg-brand-white py-md"
            >
              <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                Save draft
              </Typography>
            </Pressable>
            <SellerPrimaryButton
              label={isEdit ? 'Publish changes' : 'Publish listing'}
              className="flex-1"
              onPress={handlePublish}
            />
          </View>
        ) : null}
      </View>

      {activePicker ? (
        <SellerBottomSheet
          title={pickers[activePicker].title}
          items={pickers[activePicker].items}
          selectedValue={form[pickers[activePicker].field]}
          visible
          onClose={() => setActivePicker(null)}
          onSelect={(value) => {
            updateFormField(pickers[activePicker].field, value);
            setActivePicker(null);
          }}
        />
      ) : null}
    </ScreenWrapper>
  );
});
