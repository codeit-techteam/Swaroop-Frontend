import { memo, useMemo } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components';
import { SettlementReleasedIllustration } from '@/icons/settlement-released-illustration';
import { ROUTES } from '@/navigation/routes';
import { SellerHeader } from '@/seller/components/SellerHeader';
import { InlineDetailGrid } from '@/seller/components';
import {
  formatSettlementAmount,
  formatSettlementDate,
} from '@/seller/modules/settlement-payout/services/settlementService';
import { useSettlementStore } from '@/seller/modules/settlement-payout/store/settlementStore';

export const SettlementReleasedScreen = memo(function SettlementReleasedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settlementId } = useLocalSearchParams<{ settlementId: string }>();
  const settlements = useSettlementStore((state) => state.settlements);
  const defaultBankAccount = useSettlementStore((state) => state.defaultBankAccount);

  const settlement = useMemo(
    () => settlements.find((item) => item.settlementId === settlementId) ?? null,
    [settlementId, settlements],
  );

  if (!settlement) {
    return null;
  }

  return (
    <View className="flex-1 bg-brand-background">
      <SellerHeader title="Settlement Released" showBack onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 132 }}
      >
        <View className="items-center rounded-[28px] border border-brand-border bg-brand-white px-lg py-2xl">
          <SettlementReleasedIllustration width={168} height={124} />
          <Typography variant="headingLeft" className="mt-lg text-center text-[26px]">
            Settlement Successfully Released
          </Typography>
          <Typography variant="subheadingLeft" className="mt-sm text-center text-brand-body">
            Funds have been transferred to your registered bank account.
          </Typography>
        </View>

        <View className="mt-lg rounded-[22px] border border-brand-border bg-brand-white p-lg">
          <InlineDetailGrid
            items={[
              {
                label: 'Amount Released',
                value: formatSettlementAmount(settlement.netAmount),
              },
              { label: 'Settlement ID', value: settlement.settlementId },
              {
                label: 'Transaction Reference',
                value: settlement.transactionReference ?? '--',
              },
              {
                label: 'Settlement Date',
                value: settlement.releasedDate
                  ? formatSettlementDate(settlement.releasedDate)
                  : '--',
              },
              {
                label: 'Bank Account',
                value: settlement.bankAccount ?? defaultBankAccount,
              },
            ]}
          />
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="gap-sm">
          <Pressable
            onPress={() => router.replace(ROUTES.SELLER.SETTLEMENTS as Href)}
            className="rounded-2xl bg-brand-navy px-lg py-md"
          >
            <Typography variant="button" className="text-center text-brand-white">
              Back to Dashboard
            </Typography>
          </Pressable>
          <Pressable
            onPress={() => router.push(ROUTES.SELLER.SETTLEMENT_HISTORY as Href)}
            className="rounded-2xl border border-brand-border bg-brand-white px-lg py-md"
          >
            <Typography variant="button" className="text-center text-brand-heading">
              View History
            </Typography>
          </Pressable>
        </View>
      </View>
    </View>
  );
});
