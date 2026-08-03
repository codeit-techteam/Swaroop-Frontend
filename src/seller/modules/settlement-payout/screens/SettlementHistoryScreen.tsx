import { memo, useMemo, useState } from 'react';

import { FlatList, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { FilterChipRow } from '@/seller/components';
import { SellerHeader } from '@/seller/components/SellerHeader';
import { SettlementCard } from '@/seller/modules/settlement-payout/components';
import { useSettlementStore } from '@/seller/modules/settlement-payout/store/settlementStore';
import type {
  Settlement,
  SettlementHistoryFilter,
} from '@/seller/modules/settlement-payout/types/settlement';

const HISTORY_FILTERS: SettlementHistoryFilter[] = [
  'today',
  'this_week',
  'this_month',
  'custom',
];

const filterLabels: Record<SettlementHistoryFilter, string> = {
  today: 'Today',
  this_week: 'This Week',
  this_month: 'This Month',
  custom: 'Custom',
};

export const SettlementHistoryScreen = memo(function SettlementHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const filterHistory = useSettlementStore((state) => state.filterHistory);
  const downloadDocument = useSettlementStore((state) => state.downloadDocument);
  const [activeFilter, setActiveFilter] = useState<SettlementHistoryFilter>('this_month');

  const historyItems = useMemo(
    () => filterHistory(activeFilter),
    [activeFilter, filterHistory],
  );

  const handleDownloadAdvice = (settlement: Settlement) => {
    const document = settlement.documents.find((item) => item.type === 'settlement_advice');
    if (!document) {
      Toast.show({ type: 'info', text1: 'Settlement advice not available' });
      return;
    }
    const name = downloadDocument(document.id);
    Toast.show({ type: 'success', text1: 'Download started', text2: name ?? document.name });
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader title="Settlement History" showBack onBack={() => router.back()} />
      <FlatList
        data={historyItems}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
        }}
        ListHeaderComponent={
          <View className="pb-md pt-md">
            <Typography variant="headingLeft" className="text-[28px]">
              Released Payouts
            </Typography>
            <Typography variant="subheading" className="mt-xs text-brand-body">
              Complete history of settlement releases
            </Typography>
            <View className="mt-lg">
              <FilterChipRow
                options={HISTORY_FILTERS.map((filter) => filterLabels[filter])}
                selected={filterLabels[activeFilter]}
                onSelect={(label) => {
                  const next =
                    HISTORY_FILTERS.find((filter) => filterLabels[filter] === label) ??
                    'this_month';
                  setActiveFilter(next);
                }}
              />
            </View>
            <Typography variant="roleTitle" className="mt-lg">
              {historyItems.length} releases
            </Typography>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-md" />}
        renderItem={({ item }) => (
          <SettlementCard
            settlement={item}
            variant="history"
            onViewDetails={() =>
              router.push(
                `${ROUTES.SELLER.SETTLEMENT_DETAILS}?settlementId=${item.settlementId}` as Href,
              )
            }
            onDownloadInvoice={() => undefined}
            onDownloadAdvice={handleDownloadAdvice}
          />
        )}
      />
    </ScreenWrapper>
  );
});
