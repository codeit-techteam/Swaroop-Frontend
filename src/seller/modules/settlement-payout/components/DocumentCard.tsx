import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import { DocumentFileIcon } from '@/icons';
import { DownloadButton } from '@/seller/modules/settlement-payout/components/DownloadButton';
import type { SettlementDocument } from '@/seller/modules/settlement-payout/types/settlement';
import { brandColors } from '@/theme/colors';
import { elevation } from '@/theme/shadows';

const typeLabels: Record<SettlementDocument['type'], string> = {
  invoice: 'Invoice',
  credit_note: 'Credit note',
  settlement_advice: 'Settlement advice',
  gst_report: 'GST report',
  tds_certificate: 'TDS certificate',
};

export const DocumentCard = memo(function DocumentCard({
  document,
  onDownload,
}: {
  document: SettlementDocument;
  onDownload: (document: SettlementDocument) => void;
}) {
  return (
    <View
      className="flex-row items-center rounded-2xl border border-brand-border bg-brand-white p-md"
      style={elevation.sm}
    >
      <View className="mr-md h-11 w-11 items-center justify-center rounded-2xl bg-brand-error-light">
        <DocumentFileIcon size={18} color={brandColors.error} />
      </View>
      <View className="flex-1 pr-sm">
        <Typography variant="roleTitle" className="text-[14px]" numberOfLines={1}>
          {document.name}
        </Typography>
        <Typography variant="legal" className="mt-xs text-left text-brand-body">
          {typeLabels[document.type]} · {document.size}
        </Typography>
      </View>
      <DownloadButton label="PDF" onPress={() => onDownload(document)} compact />
    </View>
  );
});
