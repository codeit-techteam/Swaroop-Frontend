import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { PrimaryButton, SecondaryButton, Typography } from '@/components';
import type { SellerPurchaseRequest } from '@/services/seller-purchase-requests';
import { cn } from '@/utils/cn';

const formatAmount = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const STATUS_LABEL: Record<string, string> = {
  new: 'New',
  under_review: 'Under Review',
  counter_sent: 'Counter Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
};

const STATUS_TONE: Record<string, string> = {
  new: 'bg-brand-primary-light text-brand-primary',
  under_review: 'bg-[#FEF3E8] text-[#B45309]',
  counter_sent: 'bg-[#EEF2FF] text-brand-primary',
  accepted: 'bg-brand-success-light text-brand-success',
  rejected: 'bg-[#FEE2E2] text-[#B91C1C]',
  expired: 'bg-brand-surface text-brand-body',
};

export const PurchaseRequestCard = memo(function PurchaseRequestCard({
  request,
  onAccept,
  onReject,
  onViewDetails,
  actionsDisabled,
}: {
  request: SellerPurchaseRequest;
  onAccept: (request: SellerPurchaseRequest) => void;
  onReject: (request: SellerPurchaseRequest) => void;
  onViewDetails: (request: SellerPurchaseRequest) => void;
  actionsDisabled?: boolean;
}) {
  const canAct =
    !actionsDisabled &&
    (request.allowedActions.includes('ACCEPT') ||
      request.allowedActions.includes('REJECT') ||
      request.status === 'new' ||
      request.status === 'under_review');

  const showAccept =
    canAct &&
    (request.allowedActions.includes('ACCEPT') ||
      request.allowedActions.length === 0 ||
      request.status === 'new' ||
      request.status === 'under_review');

  const showReject =
    canAct &&
    (request.allowedActions.includes('REJECT') ||
      request.allowedActions.length === 0 ||
      request.status === 'new' ||
      request.status === 'under_review');

  return (
    <Pressable
      onPress={() => onViewDetails(request)}
      className="rounded-[22px] border border-brand-border bg-brand-white p-lg"
    >
      <View className="flex-row items-start justify-between">
        <Typography variant="badge" className="text-brand-heading">
          #{request.requestNumber}
        </Typography>
        <View className={cn('rounded-full px-sm py-xs', STATUS_TONE[request.status]?.split(' ')[0])}>
          <Typography
            variant="badge"
            className={cn('text-[10px]', STATUS_TONE[request.status]?.split(' ').slice(1).join(' '))}
          >
            {STATUS_LABEL[request.status] ?? request.status}
          </Typography>
        </View>
      </View>

      <Typography variant="headingLeft" className="mt-sm text-[20px]">
        {request.productName}
      </Typography>
      <Typography variant="legal" className="mt-xs text-brand-body">
        {request.buyerLabel}
      </Typography>

      <View className="mt-md flex-row flex-wrap">
        {[
          { label: 'QUANTITY', value: `${request.quantityMt} ${request.unit}` },
          { label: 'DESTINATION', value: request.deliveryLocation },
          { label: 'TARGET', value: formatAmount(request.requestedPrice) },
          { label: 'PAYMENT', value: request.paymentTerms },
        ].map((item) => (
          <View key={item.label} className="mb-sm w-1/2 pr-sm">
            <Typography variant="fieldLabel">{item.label}</Typography>
            <Typography variant="roleTitle" className="mt-0.5 text-[14px]">
              {item.value}
            </Typography>
          </View>
        ))}
      </View>

      {showAccept || showReject ? (
        <View className="mt-md flex-row gap-sm">
          {showAccept ? (
            <View className="flex-1">
              <PrimaryButton
                label="Accept"
                onPress={() => onAccept(request)}
                disabled={actionsDisabled}
              />
            </View>
          ) : null}
          {showReject ? (
            <View className="flex-1">
              <SecondaryButton
                label="Reject"
                variant="outline"
                onPress={() => onReject(request)}
                disabled={actionsDisabled}
              />
            </View>
          ) : null}
        </View>
      ) : (
        <View className="mt-md items-center py-sm">
          <Typography variant="badge" className="text-brand-primary">
            View Details
          </Typography>
        </View>
      )}
    </Pressable>
  );
});
