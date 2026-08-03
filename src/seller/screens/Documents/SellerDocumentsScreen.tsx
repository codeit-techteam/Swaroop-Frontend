import { memo, useCallback, useState } from 'react';

import { FlatList, RefreshControl, Share, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper } from '@/components';
import { ROUTES } from '@/navigation/routes';
import {
  SellerDocumentCard,
  DocumentSkeleton,
  EmptyState,
  FilterTabRow,
  ListFooterLoader,
  MediaViewer,
  OfflineScreen,
  SearchBar,
  SellerHeader,
  StatusBottomSheet,
} from '@/seller/components';
import { DOCUMENT_FILTER_LABELS } from '@/seller/mock/documents';
import { useSellerDocuments } from '@/seller/hooks/useSellerDocuments';
import { useSellerOffline } from '@/seller/hooks/useSellerOffline';
import type { DocumentFilterTab, SellerDocumentItem } from '@/seller/types/documents';

const FILTER_OPTIONS = Object.entries(DOCUMENT_FILTER_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const SellerDocumentsScreen = memo(function SellerDocumentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isOffline = useSellerOffline();
  const {
    query,
    setQuery,
    activeTab,
    setActiveTab,
    documents,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    refresh,
    loadMore,
  } = useSellerDocuments();

  const [previewDoc, setPreviewDoc] = useState<SellerDocumentItem | null>(null);
  const [statusSheet, setStatusSheet] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: '',
    message: '',
  });

  const handleDownload = useCallback(async (doc: SellerDocumentItem) => {
    try {
      await Share.share({ message: `Download: ${doc.name}`, title: doc.name });
      setStatusSheet({
        visible: true,
        title: 'Download Started',
        message: `${doc.name} is ready to save or share.`,
      });
    } catch {
      setStatusSheet({
        visible: true,
        title: 'Upload Failed',
        message: 'Could not download the document. Please try again.',
      });
    }
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: SellerDocumentItem; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 40).duration(280)}>
        <SellerDocumentCard
          document={item}
          onPreview={() => setPreviewDoc(item)}
          onDownload={() => void handleDownload(item)}
        />
      </Animated.View>
    ),
    [handleDownload],
  );

  if (isOffline) {
    return (
      <ScreenWrapper padded={false} className="bg-brand-background">
        <OfflineScreen
          onRetry={() => void refresh()}
          onGoHome={() => router.replace(ROUTES.SELLER.DASHBOARD as Href)}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader
        title="Documents Center"
        showBack
        showBell
        onBack={() => router.back()}
        onBellPress={() => router.push(ROUTES.SELLER.NOTIFICATIONS as Href)}
      />

      <View className="flex-1 px-lg" style={{ paddingBottom: insets.bottom }}>
        <View className="mt-md">
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search document..."
          />
        </View>

        <View className="mt-md">
          <FilterTabRow
            options={FILTER_OPTIONS}
            selected={activeTab}
            onSelect={(value) => setActiveTab(value as DocumentFilterTab)}
          />
        </View>

        {isLoading ? (
          <View className="mt-lg">
            <DocumentSkeleton />
          </View>
        ) : (
          <FlatList
            data={documents}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 24, gap: 12 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />}
            onEndReached={() => void loadMore()}
            onEndReachedThreshold={0.3}
            ListEmptyComponent={
              <EmptyState
                variant="no_documents"
                onCtaPress={() => router.push(ROUTES.SELLER.VERIFICATION as Href)}
              />
            }
            ListFooterComponent={hasMore || isLoadingMore ? <ListFooterLoader /> : null}
          />
        )}
      </View>

      {previewDoc ? (
        <MediaViewer
          visible
          title={previewDoc.name}
          fileType={previewDoc.fileType}
          uri={previewDoc.previewUri}
          onClose={() => setPreviewDoc(null)}
        />
      ) : null}

      <StatusBottomSheet
        visible={statusSheet.visible}
        variant={statusSheet.title.includes('Failed') ? 'error' : 'success'}
        title={statusSheet.title}
        message={statusSheet.message}
        onDismiss={() => setStatusSheet((s) => ({ ...s, visible: false }))}
      />
    </ScreenWrapper>
  );
});
