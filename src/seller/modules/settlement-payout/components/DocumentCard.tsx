import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { DownloadButton } from '@/seller/modules/settlement-payout/components/DownloadButton';
import type { SettlementDocument } from '@/seller/modules/settlement-payout/types/settlement';

const typeLabels: Record<SettlementDocument['type'], string> = {
  invoice: 'Invoice',
  credit_note: 'Credit Note',
  settlement_advice: 'Settlement Advice',
  gst_report: 'GST Report',
  tds_certificate: 'TDS Certificate',
};

export const DocumentCard = memo(function DocumentCard({
  document,
  onDownload,
}: {
  document: SettlementDocument;
  onDownload: (document: SettlementDocument) => void;
}) {
  return (
    <View className="flex-row items-center rounded-[20px] border border-brand-border bg-brand-white p-md">
      <View className="mr-md h-12 w-12 items-center justify-center rounded-xl bg-brand-error-light">
        <Typography variant="badge" className="text-[10px] text-brand-error">
          PDF
        </Typography>
      </View>
      <View className="flex-1 pr-md">
        <Typography variant="roleTitle">{document.name}</Typography>
        <Typography variant="legal" className="mt-xs text-left text-brand-body">
          {typeLabels[document.type]} • {document.size}
        </Typography>
      </View>
      <DownloadButton label="Download" onPress={() => onDownload(document)} compact />
    </View>
  );
});
