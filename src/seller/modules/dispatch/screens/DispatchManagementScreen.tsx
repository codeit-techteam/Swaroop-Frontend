import { memo, useEffect, useMemo } from 'react';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { PhoneIcon } from '@/icons';
import { SellerHeader } from '@/seller/components/SellerHeader';
import {
  DispatchChecklist,
  DispatchDocumentCard,
  DispatchProgress,
  DispatchStatusBadge,
  VehicleCard,
} from '@/seller/modules/dispatch/components';
import { useDispatchStore } from '@/seller/modules/dispatch/store/dispatchStore';

const formatOrderId = (value: string): string => value.replace('PT-', '#');

export const DispatchManagementScreen = memo(function DispatchManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const orders = useDispatchStore((state) => state.dispatchOrders);
  const selectedDispatchId = useDispatchStore((state) => state.selectedDispatchId);
  const documentsMap = useDispatchStore((state) => state.documents);
  const checklistMap = useDispatchStore((state) => state.dispatchChecklist);
  const selectDispatch = useDispatchStore((state) => state.selectDispatch);
  const generateInvoice = useDispatchStore((state) => state.generateInvoice);
  const completeLoading = useDispatchStore((state) => state.completeLoading);
  const markDispatched = useDispatchStore((state) => state.markDispatched);
  const downloadDocument = useDispatchStore((state) => state.downloadDocument);
  const hydrateDispatchState = useDispatchStore((state) => state.hydrateDispatchState);
  const isHydrated = useDispatchStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) {
      hydrateDispatchState();
    }
  }, [hydrateDispatchState, isHydrated]);

  useEffect(() => {
    if (orderId) {
      selectDispatch(orderId);
    }
  }, [orderId, selectDispatch]);

  const order = useMemo(
    () => orders.find((item) => item.id === (orderId ?? selectedDispatchId)) ?? null,
    [orderId, orders, selectedDispatchId],
  );

  const checklist = order ? checklistMap[order.id] ?? [] : [];
  const documents = order ? documentsMap[order.id] ?? [] : [];

  const handleGenerateInvoice = () => {
    if (!order) {
      return;
    }
    generateInvoice(order.id);
    router.push({ pathname: ROUTES.SELLER.INVOICE_GENERATED, params: { orderId: order.id } } as unknown as Href);
  };

  const handleAssignVehicle = () => {
    if (!order) {
      return;
    }
    router.push({ pathname: ROUTES.SELLER.ASSIGN_VEHICLE, params: { orderId: order.id } } as unknown as Href);
  };

  const handleCompleteLoading = () => {
    if (!order) {
      return;
    }
    completeLoading(order.id);
    router.push({ pathname: ROUTES.SELLER.DISPATCH_READY, params: { orderId: order.id } } as unknown as Href);
  };

  const handleMarkDispatched = () => {
    if (!order) {
      return;
    }
    markDispatched(order.id);
    router.push({ pathname: ROUTES.SELLER.DISPATCH_SUCCESS, params: { orderId: order.id } } as unknown as Href);
  };

  const handleTrackShipment = () => {
    if (!order) {
      return;
    }
    router.push({ pathname: ROUTES.CUSTOMER.SHIPMENT_TRACKING, params: { orderId: order.id } } as unknown as Href);
  };

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-background px-lg">
        <Typography variant="roleTitle">Dispatch order not found.</Typography>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-background">
      <SellerHeader title="Dispatch Management" showBack onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 132 }}
      >
        <Typography variant="badge" className="text-brand-body">
          ORDERS &gt; DISPATCH MANAGEMENT
        </Typography>
        <View className="mt-sm">
          <DispatchStatusBadge stage={order.stage} />
        </View>

        <View className="mt-lg rounded-[24px] border border-brand-border bg-brand-white p-lg">
          <Typography variant="fieldLabel">ORDER ID</Typography>
          <Typography variant="headingLeft" className="mt-xs text-[30px]">
            {formatOrderId(order.id)}
          </Typography>
          <View className="mt-lg flex-row flex-wrap">
            <View className="mb-md w-1/2 pr-sm">
              <Typography variant="fieldLabel">Material</Typography>
              <Typography variant="roleTitle" className="mt-xs">
                {order.material}
              </Typography>
            </View>
            <View className="mb-md w-1/2 pr-sm">
              <Typography variant="fieldLabel">Quantity</Typography>
              <Typography variant="roleTitle" className="mt-xs">
                {order.quantityMt} MT
              </Typography>
            </View>
          </View>
          <DispatchProgress value={order.progress} />
        </View>

        <View className="mt-lg">
          <VehicleCard order={order} />
          <View className="mt-md flex-row gap-sm">
            <Pressable
              onPress={() =>
                Toast.show({ type: 'info', text1: 'Call mocked', text2: 'Frontend placeholder action.' })
              }
              className="flex-1 flex-row items-center justify-center rounded-xl bg-brand-surface px-md py-md"
            >
              <PhoneIcon size={15} />
              <Typography variant="roleTitle" className="ml-sm">
                Call
              </Typography>
            </Pressable>
            <Pressable
              onPress={() =>
                Toast.show({ type: 'info', text1: 'Chat mocked', text2: 'Frontend placeholder action.' })
              }
              className="flex-1 items-center justify-center rounded-xl bg-brand-surface px-md py-md"
            >
              <Typography variant="roleTitle">Chat</Typography>
            </Pressable>
          </View>
        </View>

        <View className="mt-lg">
          <Typography variant="badge" className="mb-sm text-brand-body">
            DISPATCH CHECKLIST
          </Typography>
          <DispatchChecklist items={checklist} />
        </View>

        <View className="mt-lg rounded-[22px] border border-brand-border bg-brand-white p-md">
          <Typography variant="badge" className="text-brand-body">
            DOCUMENT STATUS
          </Typography>
          <View className="mt-md flex-row flex-wrap gap-sm">
            {documents.map((document) => (
              <View
                key={document.id}
                className={`rounded-full px-sm py-xs ${document.status === 'ready' ? 'bg-brand-success-light' : 'bg-brand-error-light'}`}
              >
                <Typography
                  variant="badge"
                  className={document.status === 'ready' ? 'text-brand-success' : 'text-brand-error'}
                >
                  {document.type.replace(/_/g, ' ').toUpperCase()}:{' '}
                  {document.status === 'ready' ? 'READY' : 'PENDING'}
                </Typography>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-lg">
          <Typography variant="badge" className="mb-sm text-brand-body">
            ATTACHED DOCUMENTS
          </Typography>
          <View className="gap-sm">
            {documents.map((document) => (
              <DispatchDocumentCard
                key={document.id}
                document={document}
                onDownload={(item) => {
                  const downloaded = downloadDocument(order.id, item.id);
                  Toast.show({
                    type: downloaded ? 'success' : 'info',
                    text1: downloaded ? 'Download ready' : 'Document unavailable',
                    text2: downloaded ? `${downloaded.name} prepared.` : 'Complete the workflow to enable it.',
                  });
                }}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="gap-sm">
          {!order.invoiceNumber ? (
            <Pressable onPress={handleGenerateInvoice} className="rounded-2xl bg-brand-navy px-lg py-md">
              <Typography variant="button" className="text-center text-brand-white">
                Generate Invoice
              </Typography>
            </Pressable>
          ) : null}

          {!order.vehicleNumber ? (
            <Pressable onPress={handleAssignVehicle} className="rounded-2xl border border-brand-border bg-brand-white px-lg py-md">
              <Typography variant="button" className="text-center text-brand-heading">
                Assign Vehicle
              </Typography>
            </Pressable>
          ) : null}

          {order.invoiceNumber && order.vehicleNumber && !order.loadingCompletedAt ? (
            <Pressable onPress={handleCompleteLoading} className="rounded-2xl bg-brand-navy px-lg py-md">
              <Typography variant="button" className="text-center text-brand-white">
                Loading Completed
              </Typography>
            </Pressable>
          ) : null}

          {order.stage === 'dispatch_ready' ? (
            <Pressable onPress={handleMarkDispatched} className="rounded-2xl bg-brand-navy px-lg py-md">
              <Typography variant="button" className="text-center text-brand-white">
                Mark As Dispatched
              </Typography>
            </Pressable>
          ) : null}

          {order.stage === 'in_transit' ||
          order.stage === 'dispatched' ||
          order.stage === 'delivered' ||
          order.stage === 'delayed' ? (
            <Pressable onPress={handleTrackShipment} className="rounded-2xl border border-brand-border bg-brand-white px-lg py-md">
              <Typography variant="button" className="text-center text-brand-heading">
                {order.stage === 'delivered' ? 'View Delivery' : 'Track Shipment'}
              </Typography>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
});
