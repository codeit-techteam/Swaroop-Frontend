import { memo, useCallback, useMemo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { SellerHeader } from '@/seller/components/SellerHeader';
import {
  DownloadButton,
  FinancialBreakdownCard,
  SettlementSummaryCard,
  SettlementTimeline,
} from '@/seller/modules/settlement-payout/components';
import { useSettlementStore } from '@/seller/modules/settlement-payout/store/settlementStore';

export const SettlementDetailsScreen = memo(function SettlementDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settlementId } = useLocalSearchParams<{ settlementId: string }>();
  const settlements = useSettlementStore((state) => state.settlements);
  const downloadDocument = useSettlementStore((state) => state.downloadDocument);
  const advanceSettlementStatus = useSettlementStore((state) => state.advanceSettlementStatus);

  const settlement = useMemo(
    () => settlements.find((item) => item.settlementId === settlementId) ?? null,
    [settlementId, settlements],
  );

  const handleDownload = useCallback(
    (type: 'settlement_advice' | 'invoice') => {
      if (!settlement) {
        return;
      }
      const document = settlement.documents.find((item) => item.type === type);
      if (!document) {
        Toast.show({ type: 'info', text1: 'Document not available yet' });
        return;
      }
      const name = downloadDocument(document.id);
      Toast.show({ type: 'success', text1: 'Download started', text2: name ?? document.name });
    },
    [downloadDocument, settlement],
  );

  const handleAdvance = useCallback(() => {
    if (!settlement || settlement.status === 'released' || settlement.status === 'failed') {
      return;
    }
    const updated = advanceSettlementStatus(settlement.settlementId);
    if (updated?.status === 'released') {
      router.replace(
        `${ROUTES.SELLER.SETTLEMENT_RELEASED}?settlementId=${updated.settlementId}` as Href,
      );
    }
  }, [advanceSettlementStatus, router, settlement]);

  if (!settlement) {
    return null;
  }

  const canSimulateRelease =
    settlement.status === 'pending' || settlement.status === 'processing';

  return (
    <View className="flex-1 bg-brand-background">
      <SellerHeader title="Settlement Details" showBack onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 140 }}
      >
        <SettlementSummaryCard settlement={settlement} />

        <View className="mt-lg">
          <FinancialBreakdownCard settlement={settlement} />
        </View>

        <View className="mt-lg">
          <SettlementTimeline currentStep={settlement.currentTimelineStep} />
        </View>

        {canSimulateRelease ? (
          <Pressable
            onPress={handleAdvance}
            className="mt-lg rounded-2xl border border-dashed border-brand-primary bg-brand-primary-light px-lg py-md"
          >
            <Typography variant="roleTitle" className="text-center text-brand-primary">
              Simulate next settlement stage
            </Typography>
          </Pressable>
        ) : null}
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="gap-sm">
          <DownloadButton
            label="Download Settlement PDF"
            onPress={() => handleDownload('settlement_advice')}
          />
          <DownloadButton label="Download Tax Invoice" onPress={() => handleDownload('invoice')} />
        </View>
      </View>
    </View>
  );
});
