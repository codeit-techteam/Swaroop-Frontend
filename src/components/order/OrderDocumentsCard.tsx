import { memo, useCallback } from 'react';

import { Pressable, View } from 'react-native';

import Toast from 'react-native-toast-message';

import { Typography } from '@/components/ui/typography';
import { ORDER_DOCUMENTS, PURCHASE_ORDER_COPY } from '@/constants/purchaseOrderTimeline';
import { DocumentFileIcon, DownloadIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { OrderDocumentId } from '@/types/purchaseOrder';
import { cn } from '@/utils/cn';

type OrderDocumentsCardProps = {
  className?: string;
  onDocumentPress?: (documentId: OrderDocumentId) => void;
};

const getDocumentIcon = (documentId: OrderDocumentId) => {
  switch (documentId) {
    case 'purchase_order_pdf':
      return <DocumentFileIcon size={iconSizes.lg} color={brandColors.invoice} />;
    case 'proforma_invoice':
      return <DocumentFileIcon size={iconSizes.lg} color={brandColors.primary} />;
    case 'tax_invoice':
      return <DocumentFileIcon size={iconSizes.lg} color={brandColors.heading} />;
    default:
      return <DocumentFileIcon size={iconSizes.lg} color={brandColors.primary} />;
  }
};

export const OrderDocumentsCard = memo(function OrderDocumentsCard({
  className,
  onDocumentPress,
}: OrderDocumentsCardProps) {
  const handleDocumentPress = useCallback(
    (documentId: OrderDocumentId) => {
      if (onDocumentPress) {
        onDocumentPress(documentId);
        return;
      }

      Toast.show({
        type: 'info',
        text1: PURCHASE_ORDER_COPY.documentToastTitle,
        text2: PURCHASE_ORDER_COPY.documentToastMessage,
        visibilityTime: 3000,
      });
    },
    [onDocumentPress],
  );

  return (
    <View className={cn('w-full', className)}>
      <Typography variant="roleTitle" className="mb-md text-[16px] text-brand-heading">
        {PURCHASE_ORDER_COPY.documentsHeading}
      </Typography>

      {ORDER_DOCUMENTS.map((document) => (
        <Pressable
          key={document.id}
          onPress={() => handleDocumentPress(document.id)}
          accessibilityRole="button"
          accessibilityLabel={`Download ${document.label}`}
          className="mb-sm flex-row items-center rounded-xl border border-brand-border bg-brand-surface px-md py-md"
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          {getDocumentIcon(document.id)}
          <Typography variant="roleTitle" className="ml-md flex-1 text-[14px] text-brand-heading">
            {document.label}
          </Typography>
          <DownloadIcon size={iconSizes.md} color={brandColors.muted} />
        </Pressable>
      ))}
    </View>
  );
});
