import { memo, useMemo, useState } from 'react';

import { FlatList, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { EmptyState, FilterChipRow } from '@/seller/components';
import { SellerHeader } from '@/seller/components/SellerHeader';
import { SettlementCard } from '@/seller/modules/settlement-payout/components';
import { formatSettlementAmount } from '@/seller/modules/settlement-payout/services/settlementService';
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
  this_week: 'This week',
  this_month: 'This month',
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

  const releasedTotal = useMemo(
    () => historyItems.reduce((sum, item) => sum + item.netAmount, 0),
    [historyItems],
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
      <SellerHeader title="Settlement history" showBack onBack={() => router.back()} />
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
            <Typography variant="headingLeft" className="text-[26px] leading-[32px]">
              Released payouts
            </Typography>
            <Typography variant="legal" className="mt-xs text-left text-brand-body">
              Complete history of settlement releases
            </Typography>

            <View className="mt-lg rounded-2xl bg-brand-navy px-lg py-lg">
              <Typography variant="legal" className="text-left text-brand-primary-light">
                {filterLabels[activeFilter]} total
              </Typography>
              <Typography
                variant="headingLeft"
                numberOfLines={1}
                adjustsFontSizeToFit
                className="mt-xs text-[28px] text-brand-white"
              >
                {formatSettlementAmount(releasedTotal, true)}
              </Typography>
            </View>

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
            <Typography variant="roleTitle" className="mt-lg text-[15px]">
              {historyItems.length} {historyItems.length === 1 ? 'release' : 'releases'}
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
        ListEmptyComponent={
          <EmptyState
            variant="no_search_results"
            title="No releases in this period"
            description="Try another date range to see completed payouts."
          />
        }
      />
    </ScreenWrapper>
  );
});
