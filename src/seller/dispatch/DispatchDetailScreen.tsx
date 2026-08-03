import { memo, useEffect, useMemo } from 'react';

import { Alert, Image, Pressable, ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { PhoneIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { DocumentCard, Timeline } from '@/seller/components/analytics';
import { SellerCard, SellerHeader, SellerPrimaryButton } from '@/seller/components';
import { DispatchStatusBadge } from '@/seller/modules/dispatch/components';
import { useDispatchStore } from '@/seller/modules/dispatch/store/dispatchStore';
import {
  formatDispatchOrderId,
  getDispatchDetailExtension,
  getDispatchStatusLabel,
  simulateDispatchDocumentDownload,
} from '@/seller/services/dispatchDetailService';

const ChecklistItem = ({ label, done }: { label: string; done: boolean }) => (
  <View className="mb-sm flex-row items-center rounded-xl bg-brand-surface px-md py-sm">
    <View
      className={`mr-sm h-5 w-5 rounded-full ${done ? 'bg-brand-success' : 'bg-brand-border'}`}
    />
    <Typography variant="roleDescription">{label}</Typography>
  </View>
);

export const DispatchDetailScreen = memo(function DispatchDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const orders = useDispatchStore((state) => state.dispatchOrders);
  const documentsMap = useDispatchStore((state) => state.documents);
  const hydrateDispatchState = useDispatchStore((state) => state.hydrateDispatchState);
  const isHydrated = useDispatchStore((state) => state.isHydrated);
  const downloadDocument = useDispatchStore((state) => state.downloadDocument);

  useEffect(() => {
    if (!isHydrated) {
      hydrateDispatchState();
    }
  }, [hydrateDispatchState, isHydrated]);

  const order = useMemo(
    () => orders.find((item) => item.id === orderId),
    [orderId, orders],
  );

  const extension = useMemo(
    () => getDispatchDetailExtension(orderId ?? ''),
    [orderId],
  );

  const documents = order ? documentsMap[order.id] ?? [] : [];

  if (!order) {
    return (
      <ScreenWrapper padded={false} className="bg-brand-background">
        <SellerHeader title="Dispatch Detail" showBack onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-lg">
          <Typography variant="roleTitle">Dispatch not found</Typography>
        </View>
      </ScreenWrapper>
    );
  }

  const handleDownloadAll = async () => {
    const message = await simulateDispatchDocumentDownload('Dispatch document bundle');
    Alert.alert('Download Documents', message);
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader title="Dispatch Detail" showBack onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120, paddingTop: 8 }}
      >
        <SellerCard title="Dispatch Summary">
          <View className="mb-sm">
            <DispatchStatusBadge stage={order.stage} />
          </View>
          <View className="flex-row flex-wrap">
            {[
              { label: 'Order', value: formatDispatchOrderId(order.id) },
              { label: 'Material', value: order.material },
              { label: 'Quantity', value: `${order.quantityMt} MT` },
              { label: 'Dispatch Status', value: getDispatchStatusLabel(order) },
            ].map((row) => (
              <View key={row.label} className="mb-md w-1/2 pr-sm">
                <Typography variant="legal" className="text-left text-brand-body">
                  {row.label}
                </Typography>
                <Typography variant="roleTitle" className="mt-xs">
                  {row.value}
                </Typography>
              </View>
            ))}
          </View>
        </SellerCard>

        <SellerCard title="Vehicle" className="mt-lg">
          <View className="flex-row flex-wrap">
            {[
              { label: 'Vehicle Number', value: order.vehicleNumber ?? 'Not assigned' },
              { label: 'Driver', value: order.driverName ?? 'Not assigned' },
              { label: 'Phone', value: order.driverPhone ?? '—' },
              { label: 'Transport Company', value: extension.transportCompany },
            ].map((row) => (
              <View key={row.label} className="mb-md w-1/2 pr-sm">
                <Typography variant="legal" className="text-left text-brand-body">
                  {row.label}
                </Typography>
                <Typography variant="roleTitle" className="mt-xs">
                  {row.value}
                </Typography>
              </View>
            ))}
          </View>
        </SellerCard>

        <SellerCard title="Dispatch Checklist" className="mt-lg">
          <ChecklistItem label="Invoice" done={extension.checklist.invoice} />
          <ChecklistItem label="LR" done={extension.checklist.lr} />
          <ChecklistItem label="E-way Bill" done={extension.checklist.ewayBill} />
          <ChecklistItem label="Loading Slip" done={extension.checklist.loadingSlip} />
          <ChecklistItem label="Seal Verification" done={extension.checklist.sealVerification} />
        </SellerCard>

        <SellerCard title="Documents" className="mt-lg">
          {documents.length > 0
            ? documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  title={document.name}
                  fileName={document.size}
                  onDownload={() => {
                    const downloaded = downloadDocument(order.id, document.id);
                    Toast.show({
                      type: downloaded ? 'success' : 'info',
                      text1: downloaded ? 'Download ready' : 'Document unavailable',
                    });
                  }}
                />
              ))
            : ['Invoice', 'LR', 'E-way Bill', 'COA', 'Quality Certificate'].map((title) => (
                <DocumentCard
                  key={title}
                  title={title}
                  fileName={`${title.replace(/\s/g, '-')}-${order.id}.pdf`}
                  onDownload={() => void handleDownloadAll()}
                />
              ))}
        </SellerCard>

        {extension.loadingPhotos.length > 0 ? (
          <SellerCard title="Loading Photos" className="mt-lg">
            <View className="flex-row flex-wrap gap-sm">
              {extension.loadingPhotos.map((photo) => (
                <View key={photo.id} className="mb-sm w-[48%] overflow-hidden rounded-xl">
                  <Image source={{ uri: photo.uri }} className="h-24 w-full bg-brand-surface" />
                  <Typography variant="legal" className="mt-xs text-center text-brand-body">
                    {photo.label}
                  </Typography>
                </View>
              ))}
            </View>
          </SellerCard>
        ) : null}

        <SellerCard title="Timeline" className="mt-lg">
          <Timeline steps={extension.timeline} />
        </SellerCard>

        <Pressable
          onPress={() =>
            router.push({
              pathname: ROUTES.SELLER.DISPATCH_MANAGEMENT,
              params: { orderId: order.id },
            } as unknown as Href)
          }
          className="mt-lg rounded-2xl border border-brand-border bg-brand-white px-lg py-md"
        >
          <Typography variant="link" className="text-center">
            Open Dispatch Management →
          </Typography>
        </Pressable>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="flex-row gap-md">
          <Pressable
            onPress={() =>
              Toast.show({
                type: 'info',
                text1: 'Calling driver',
                text2: order.driverPhone ?? 'No phone on file',
              })
            }
            className="flex-1 flex-row items-center justify-center rounded-2xl border border-brand-border bg-brand-white py-md"
          >
            <PhoneIcon size={16} />
            <Typography variant="button" className="ml-sm text-brand-heading">
              Call Driver
            </Typography>
          </Pressable>
          <SellerPrimaryButton
            label="Download Documents"
            className="flex-1"
            onPress={() => void handleDownloadAll()}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
});
