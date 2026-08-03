import { memo } from 'react';

import { View } from 'react-native';

import { Typography } from '@/components';
import type { DispatchOrder } from '@/seller/modules/dispatch/types/dispatch';

const formatAmount = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export const InvoiceCard = memo(function InvoiceCard({
  order,
}: {
  order: DispatchOrder;
}) {
  return (
    <View className="rounded-[22px] border border-brand-border bg-brand-white p-md">
      <View className="flex-row items-center justify-between">
        <Typography variant="headingLeft" className="text-[22px]">
          {order.invoiceNumber ?? 'Invoice Pending'}
        </Typography>
        <Typography variant="badge" className="text-brand-success">
          GST INCLUDED
        </Typography>
      </View>
      <View className="mt-md flex-row flex-wrap">
        {[
          { label: 'Order ID', value: order.id.replace('PT-', '#') },
          { label: 'Amount', value: formatAmount(order.amount) },
          { label: 'GST', value: formatAmount(order.gstAmount) },
          { label: 'Generated Time', value: order.invoiceGeneratedAt ? 'Just now' : 'Pending' },
        ].map((item) => (
          <View key={item.label} className="mb-md w-1/2 pr-sm">
            <Typography variant="fieldLabel">{item.label}</Typography>
            <Typography variant="roleTitle" className="mt-xs">
              {item.value}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
});
