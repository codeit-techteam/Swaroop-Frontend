import { memo, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { Typography } from '@/components/ui/typography';
import { DocumentFileIcon, DownloadIcon } from '@/icons';
import { fetchProductDocumentUrl } from '@/services/catalog';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import type { ComplianceDocument } from '@/types/product';
import { cn } from '@/utils/cn';

type DocumentDownloadsProps = {
  documents: ComplianceDocument[];
  productId?: string;
  className?: string;
};

const isProductTechnicalDoc = (doc: ComplianceDocument): boolean => {
  const title = doc.title.trim().toUpperCase();
  const type = String(doc.type).toLowerCase();
  return (
    type === 'tds' ||
    type === 'msds' ||
    type === 'coa' ||
    type === 'iso' ||
    type === 'test_certificate' ||
    type === 'quality_report' ||
    type === 'technical_specification' ||
    type === 'other' ||
    title.includes('TDS') ||
    title.includes('MSDS') ||
    title.includes('DATA SHEET') ||
    title.includes('CERTIFICATE') ||
    title.includes('SPECIFICATION')
  );
};

export const DocumentDownloads = memo(function DocumentDownloads({
  documents,
  productId,
  className,
}: DocumentDownloadsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const visibleDocuments = useMemo(
    () => documents.filter(isProductTechnicalDoc),
    [documents],
  );

  const handleDownload = useCallback(
    async (doc: ComplianceDocument) => {
      const pid = productId ?? doc.productId;
      if (!pid) {
        Toast.show({
          type: 'error',
          text1: 'Document unavailable',
          visibilityTime: 2000,
        });
        return;
      }
      setLoadingId(doc.id);
      try {
        const { url } = await fetchProductDocumentUrl(pid, doc.id);
        const canOpen = await Linking.canOpenURL(url);
        if (!canOpen) throw new Error('Unable to open document URL');
        await Linking.openURL(url);
        Toast.show({
          type: 'success',
          text1: doc.title,
          text2: 'Verified Product Document',
          visibilityTime: 2000,
        });
      } catch {
        Toast.show({
          type: 'error',
          text1: 'Unable to open document',
          visibilityTime: 2200,
        });
      } finally {
        setLoadingId(null);
      }
    },
    [productId],
  );

  if (visibleDocuments.length === 0) {
    return (
      <View
        className={cn(
          'mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm',
          className,
        )}
      >
        <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
          Technical Documents
        </Typography>
        <Typography
          variant="caption"
          className="mt-sm font-sans text-[12px] normal-case tracking-normal text-brand-muted"
        >
          No technical documents available yet.
        </Typography>
      </View>
    );
  }

  return (
    <View
      className={cn(
        'mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <Typography variant="roleTitle" className="text-[16px] text-brand-heading">
        Technical Documents
      </Typography>
      <Typography
        variant="caption"
        className="mt-xs font-sans text-[12px] normal-case tracking-normal text-brand-muted"
      >
        Verified product documents from PetroTrade
      </Typography>
      <View className="mt-md" style={{ gap: 8 }}>
        {visibleDocuments.map((doc) => (
          <Pressable
            key={doc.id}
            onPress={() => void handleDownload(doc)}
            accessibilityRole="button"
            accessibilityLabel={`Download ${doc.title}`}
            className="flex-row items-center rounded-lg border border-brand-border bg-brand-surface px-md py-md"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <View className="h-9 w-9 items-center justify-center rounded-lg bg-brand-white">
              {loadingId === doc.id ? (
                <ActivityIndicator size="small" color={brandColors.primary} />
              ) : (
                <DocumentFileIcon size={iconSizes.md} color={brandColors.primary} />
              )}
            </View>
            <View className="ml-sm min-w-0 flex-1">
              <Typography
                variant="body"
                className="font-sans text-[14px] text-brand-heading"
                numberOfLines={1}
              >
                {doc.title}
              </Typography>
              <Typography
                variant="caption"
                className="font-sans text-[11px] normal-case tracking-normal text-brand-muted"
                numberOfLines={1}
              >
                {doc.version ? `v${doc.version} · ` : ''}
                {doc.description}
              </Typography>
            </View>
            <DownloadIcon size={iconSizes.sm} color={brandColors.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
});
