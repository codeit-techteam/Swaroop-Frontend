import { memo, useEffect, useMemo, useState } from 'react';

import { ActivityIndicator, ScrollView, TextInput, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, ScreenWrapper, SecondaryButton, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import {
  ConfirmationBottomSheet,
  RejectReasonSheet,
} from '@/seller/modules/seller-orders/components';
import type { SellerRejectReason } from '@/seller/modules/seller-orders/types/sellerOrders';
import { useSellerPurchaseRequestsStore } from '@/seller/modules/seller-purchase-requests/store/sellerPurchaseRequestsStore';
import { SellerHeader, SellerSheetShell } from '@/seller/components';
import { brandColors } from '@/theme/colors';

const formatAmount = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

export const SellerPurchaseRequestDetailScreen = memo(
  function SellerPurchaseRequestDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const getById = useSellerPurchaseRequestsStore((state) => state.getById);
    const loadDetail = useSellerPurchaseRequestsStore((state) => state.loadDetail);
    const accept = useSellerPurchaseRequestsStore((state) => state.accept);
    const reject = useSellerPurchaseRequestsStore((state) => state.reject);
    const counter = useSellerPurchaseRequestsStore((state) => state.counter);
    const isSubmitting = useSellerPurchaseRequestsStore((state) => state.isSubmitting);

    const [loading, setLoading] = useState(true);
    const [showAccept, setShowAccept] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [showCounter, setShowCounter] = useState(false);
    const [rejectReason, setRejectReason] =
      useState<SellerRejectReason>('Insufficient Inventory');
    const [rejectRemarks, setRejectRemarks] = useState('');
    const [counterPrice, setCounterPrice] = useState('');
    const [counterQty, setCounterQty] = useState('');

    useEffect(() => {
      if (!id) {
        setLoading(false);
        return;
      }
      let cancelled = false;
      setLoading(true);
      void loadDetail(id).finally(() => {
        if (!cancelled) setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }, [id, loadDetail]);

    const request = useMemo(() => (id ? getById(id) : undefined), [getById, id]);

    if (loading && !request) {
      return (
        <ScreenWrapper className="bg-brand-background items-center justify-center">
          <ActivityIndicator color={brandColors.primary} />
        </ScreenWrapper>
      );
    }

    if (!request) {
      return (
        <ScreenWrapper className="bg-brand-background">
          <SellerHeader title="Purchase Request" showBack onBack={() => router.back()} />
          <Typography variant="roleTitle" className="mt-lg px-lg">
            Request not found.
          </Typography>
        </ScreenWrapper>
      );
    }

    const canAccept =
      request.allowedActions.includes('ACCEPT') ||
      request.status === 'new' ||
      request.status === 'under_review';
    const canReject =
      request.allowedActions.includes('REJECT') ||
      request.status === 'new' ||
      request.status === 'under_review';
    const canCounter =
      request.allowedActions.includes('COUNTER') ||
      request.status === 'new' ||
      request.status === 'under_review' ||
      request.status === 'counter_sent';
    const showActions = canAccept || canReject || canCounter;

    return (
      <ScreenWrapper padded={false} className="bg-brand-background">
        <SellerHeader title="Request Details" showBack onBack={() => router.back()} />

        <ScrollView
          className="flex-1 px-lg"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + (showActions ? 160 : 32) }}
        >
          <Typography variant="fieldLabel">REQUEST</Typography>
          <Typography variant="headingLeft" className="mt-xs text-[28px]">
            #{request.requestNumber}
          </Typography>
          <Typography variant="legal" className="mt-sm text-brand-body">
            {request.buyerLabel} · Received {formatDate(request.receivedAt)}
          </Typography>

          <View className="mt-lg rounded-[22px] border border-brand-border bg-brand-white p-lg">
            <Typography variant="headingLeft" className="text-[20px]">
              {request.productName}
            </Typography>
            <Typography variant="legal" className="mt-xs text-brand-body">
              {request.gradeName}
            </Typography>
            <View className="mt-md flex-row flex-wrap">
              {[
                { label: 'QUANTITY', value: `${request.quantityMt} ${request.unit}` },
                { label: 'TARGET PRICE', value: formatAmount(request.requestedPrice) },
                { label: 'DESTINATION', value: request.deliveryLocation },
                { label: 'PAYMENT', value: request.paymentTerms },
                { label: 'STATUS', value: request.status.replace(/_/g, ' ') },
                { label: 'CATEGORY', value: request.category },
              ].map((item) => (
                <View key={item.label} className="mb-sm w-1/2 pr-sm">
                  <Typography variant="fieldLabel">{item.label}</Typography>
                  <Typography variant="roleTitle" className="mt-0.5 text-[14px]">
                    {item.value}
                  </Typography>
                </View>
              ))}
            </View>
            {request.notes ? (
              <Typography variant="roleDescription" className="mt-md text-left text-brand-body">
                {request.notes}
              </Typography>
            ) : null}
          </View>
        </ScrollView>

        {showActions ? (
          <View
            className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            {canAccept ? (
              <PrimaryButton
                label={isSubmitting ? 'Working…' : 'Accept Request'}
                onPress={() => setShowAccept(true)}
              />
            ) : null}
            <View className="mt-sm flex-row gap-sm">
              {canCounter ? (
                <View className="flex-1">
                  <SecondaryButton
                    label="Counter"
                    variant="outline"
                    onPress={() => {
                      setCounterPrice(String(request.requestedPrice || ''));
                      setCounterQty(String(request.quantityMt || ''));
                      setShowCounter(true);
                    }}
                  />
                </View>
              ) : null}
              {canReject ? (
                <View className="flex-1">
                  <SecondaryButton
                    label="Reject"
                    variant="outline"
                    onPress={() => setShowReject(true)}
                  />
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        <ConfirmationBottomSheet
          visible={showAccept}
          title="Accept this request?"
          message="Confirm you can fulfill this purchase request."
          onCancel={() => setShowAccept(false)}
          onConfirm={() => {
            void accept(request.id).then((ok) => {
              setShowAccept(false);
              if (ok) router.replace(ROUTES.SELLER.PURCHASE_REQUESTS as Href);
            });
          }}
        />

        <RejectReasonSheet
          visible={showReject}
          reason={rejectReason}
          remarks={rejectRemarks}
          onReasonChange={setRejectReason}
          onRemarksChange={setRejectRemarks}
          onCancel={() => {
            setShowReject(false);
            setRejectRemarks('');
          }}
          onReject={() => {
            void reject(request.id, rejectReason, rejectRemarks.trim() || undefined).then((ok) => {
              setShowReject(false);
              setRejectRemarks('');
              if (ok) router.replace(ROUTES.SELLER.PURCHASE_REQUESTS as Href);
            });
          }}
        />

        <SellerSheetShell
          visible={showCounter}
          onClose={() => {
            setShowCounter(false);
            setCounterPrice('');
            setCounterQty('');
          }}
        >
          <Typography variant="headingLeft" className="text-[22px]">
            Counter Offer
          </Typography>
          <View className="mt-lg gap-md">
            <View>
              <Typography variant="fieldLabel">UNIT PRICE (₹)</Typography>
              <TextInput
                value={counterPrice}
                onChangeText={setCounterPrice}
                keyboardType="decimal-pad"
                className="mt-xs rounded-2xl border border-brand-border bg-brand-white px-md py-md font-sans text-[16px] text-brand-heading"
              />
            </View>
            <View>
              <Typography variant="fieldLabel">QUANTITY (MT)</Typography>
              <TextInput
                value={counterQty}
                onChangeText={setCounterQty}
                keyboardType="decimal-pad"
                className="mt-xs rounded-2xl border border-brand-border bg-brand-white px-md py-md font-sans text-[16px] text-brand-heading"
              />
            </View>
          </View>
          <View className="mt-xl flex-row gap-sm">
            <View className="flex-1">
              <SecondaryButton
                label="Cancel"
                variant="outline"
                onPress={() => setShowCounter(false)}
              />
            </View>
            <View className="flex-1">
              <PrimaryButton
                label={isSubmitting ? 'Sending…' : 'Send Counter'}
                onPress={() => {
                  const unitPrice = Number(counterPrice);
                  const quantity = Number(counterQty);
                  if (!Number.isFinite(unitPrice) || unitPrice <= 0) return;
                  if (!Number.isFinite(quantity) || quantity <= 0) return;
                  void counter(request.id, unitPrice, quantity).then((ok) => {
                    setShowCounter(false);
                    if (ok) router.replace(ROUTES.SELLER.PURCHASE_REQUESTS as Href);
                  });
                }}
              />
            </View>
          </View>
        </SellerSheetShell>
      </ScreenWrapper>
    );
  },
);
