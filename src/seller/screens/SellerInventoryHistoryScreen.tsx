import { memo } from 'react';

import { ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { SellerHeader, StockHistoryCard } from '@/seller/components';
import { useInventoryStore } from '@/seller/store/inventoryStore';

export const SellerInventoryHistoryScreen = memo(function SellerInventoryHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const history = useInventoryStore((state) => state.stockHistory);

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader
        showBack
        showBell
        title="Inventory History"
        onBack={() => router.back()}
      />
      <ScrollView
        className="flex-1 px-lg"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Typography variant="subheadingLeft">
          Placeholder history feed backed by local persisted stock updates.
        </Typography>
        <View className="mt-lg gap-md">
          {history.map((entry) => (
            <StockHistoryCard key={entry.id} entry={entry} />
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
});
