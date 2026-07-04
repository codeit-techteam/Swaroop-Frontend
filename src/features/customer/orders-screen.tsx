import { memo } from 'react';

import { View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { OrdersTabIcon } from '@/icons';
import { brandColors } from '@/theme/colors';

export const CustomerOrdersScreen = memo(function CustomerOrdersScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-brand-white px-lg" style={{ paddingTop: insets.top + 16 }}>
      <Typography variant="headingLeft" className="text-[22px] text-brand-primary">
        Orders
      </Typography>
      <Typography variant="subheadingLeft" className="mt-sm">
        Track active shipments, invoices, and delivery milestones for your polymer orders.
      </Typography>

      <View className="mt-2xl items-center rounded-xl border border-brand-border bg-brand-primary-tint px-lg py-2xl">
        <OrdersTabIcon color={brandColors.primary} />
        <Typography variant="roleTitle" className="mt-md text-brand-heading">
          2 Orders In Transit
        </Typography>
        <Typography variant="subheading" className="mt-sm px-md">
          Due invoices total ₹14.2L. Open an order to review logistics and payment status.
        </Typography>
      </View>
    </View>
  );
});
