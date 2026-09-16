import { memo, useMemo } from 'react';

import { ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { ScreenWrapper, Typography } from '@/components';
import { SellerHeader } from '@/seller/components/SellerHeader';
import { DocumentCard } from '@/seller/modules/settlement-payout/components';
import { useSettlementStore } from '@/seller/modules/settlement-payout/store/settlementStore';
import type { SettlementDocumentType } from '@/seller/modules/settlement-payout/types/settlement';

const SECTIONS: Array<{ type: SettlementDocumentType; title: string; blurb: string }> = [
  { type: 'invoice', title: 'Invoices', blurb: 'Tax invoices for completed orders' },
  { type: 'credit_note', title: 'Credit notes', blurb: 'Adjustments against invoices' },
  { type: 'settlement_advice', title: 'Settlement advice', blurb: 'Payout confirmations' },
  { type: 'gst_report', title: 'GST reports', blurb: 'Period GST summaries' },
  { type: 'tds_certificate', title: 'TDS certificates', blurb: 'Withholding tax proofs' },
];

export const TaxDocumentsScreen = memo(function TaxDocumentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const documents = useSettlementStore((state) => state.documents);
  const downloadDocument = useSettlementStore((state) => state.downloadDocument);

  const groupedDocuments = useMemo(
    () =>
      SECTIONS.map((section) => ({
        ...section,
        items: documents.filter((document) => document.type === section.type),
      })),
    [documents],
  );

  const handleDownload = (documentId: string, name: string) => {
    const fileName = downloadDocument(documentId);
    Toast.show({ type: 'success', text1: 'Download started', text2: fileName ?? name });
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader title="Tax & documents" showBack onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
      >
        <Typography variant="headingLeft" className="text-[26px] leading-[32px]">
          Tax & documents
        </Typography>
        <Typography variant="legal" className="mt-xs text-left text-brand-body">
          Invoices, settlement advice, and compliance files in one place
        </Typography>

        {groupedDocuments.map((section) => (
          <View key={section.type} className="mt-xl">
            <Typography variant="headingLeft" className="text-[18px]">
              {section.title}
            </Typography>
            <Typography variant="legal" className="mb-md mt-xs text-left text-brand-body">
              {section.blurb}
            </Typography>
            <View className="gap-sm">
              {section.items.length ? (
                section.items.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    onDownload={(item) => handleDownload(item.id, item.name)}
                  />
                ))
              ) : (
                <View className="rounded-2xl border border-dashed border-brand-border bg-brand-white px-lg py-lg">
                  <Typography variant="roleDescription" className="text-center text-brand-body">
                    No files in this section yet
                  </Typography>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
});
