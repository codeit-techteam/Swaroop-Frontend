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

const SECTIONS: Array<{ type: SettlementDocumentType; title: string }> = [
  { type: 'invoice', title: 'Invoices' },
  { type: 'credit_note', title: 'Credit Notes' },
  { type: 'settlement_advice', title: 'Settlement Advice' },
  { type: 'gst_report', title: 'GST Reports' },
  { type: 'tds_certificate', title: 'TDS Certificate' },
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
      <SellerHeader title="Tax & Documents" showBack onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
      >
        <Typography variant="headingLeft" className="text-[28px]">
          Tax & Documents
        </Typography>
        <Typography variant="subheading" className="mt-xs text-brand-body">
          Invoices, settlement advice, and compliance documents
        </Typography>

        {groupedDocuments.map((section) => (
          <View key={section.type} className="mt-xl">
            <Typography variant="headingLeft" className="mb-md text-[20px]">
              {section.title}
            </Typography>
            <View className="gap-md">
              {section.items.length ? (
                section.items.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    onDownload={(item) => handleDownload(item.id, item.name)}
                  />
                ))
              ) : (
                <View className="rounded-[20px] border border-dashed border-brand-border bg-brand-white px-lg py-xl">
                  <Typography variant="roleDescription" className="text-center text-brand-body">
                    No documents available in this section yet.
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
