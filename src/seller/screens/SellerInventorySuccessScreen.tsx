import { memo, useMemo } from 'react';

import { ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { CheckCircleIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { SellerPrimaryButton } from '@/seller/components';
import { useInventoryStore } from '@/seller/store/inventoryStore';
import { brandColors } from '@/theme/colors';

const formatStock = (value: number): string => `${value.toFixed(value % 1 === 0 ? 1 : 2)} MT`;

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export const SellerInventorySuccessScreen = memo(function SellerInventorySuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { historyId } = useLocalSearchParams<{ historyId?: string }>();
  const history = useInventoryStore((state) => state.stockHistory);

  const entry = useMemo(
    () => history.find((item) => item.id === historyId) ?? history[0] ?? null,
    [history, historyId],
  );

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <ScrollView
        className="flex-1 px-lg"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center rounded-[28px] bg-brand-white px-lg py-2xl">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-success-light">
            <CheckCircleIcon size={36} color={brandColors.success} />
          </View>
          <Typography variant="headingLeft" className="mt-lg text-center text-[28px]">
            Inventory Updated Successfully
          </Typography>
          <Typography variant="subheading" className="mt-sm text-brand-body">
            Local inventory and linked seller catalog are now synchronized.
          </Typography>
        </View>

        {entry ? (
          <View className="mt-xl rounded-[24px] border border-brand-border bg-brand-white p-lg">
            <Typography variant="headingLeft" className="text-[22px]">
              Update Summary
            </Typography>
            <View className="mt-lg flex-row flex-wrap">
              {[
                { label: 'Product', value: entry.productName },
                { label: 'Warehouse', value: entry.warehouse },
                { label: 'Old Stock', value: formatStock(entry.oldStock) },
                { label: 'New Stock', value: formatStock(entry.newStock) },
                { label: 'Updated Time', value: formatDateTime(entry.updatedAt) },
              ].map((item) => (
                <View key={item.label} className="mb-md w-1/2 pr-sm">
                  <Typography variant="fieldLabel">{item.label}</Typography>
                  <Typography variant="roleTitle" className="mt-xs">
                    {item.value}
                  </Typography>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <SellerPrimaryButton
          label="Back to Inventory"
          className="mt-xl bg-brand-navy"
          onPress={() => router.replace(ROUTES.SELLER.INVENTORY as Href)}
        />
        <SellerPrimaryButton
          label="Update Another Product"
          className="mt-md"
          onPress={() => router.replace(ROUTES.SELLER.INVENTORY as Href)}
        />
      </ScrollView>
    </ScreenWrapper>
  );
});
