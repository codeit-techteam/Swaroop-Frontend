import { memo } from 'react';

import { Image, View } from 'react-native';

import { Typography } from '@/components';
import { LocationPinIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import type { SellerOrder } from '@/seller/modules/seller-orders/types/sellerOrders';

const MAP_PLACEHOLDER =
  'https://images.unsplash.com/photo-1494412574643-ff11d0e5c35c?auto=format&fit=crop&w=800&q=80';

export const DestinationCard = memo(function DestinationCard({ order }: { order: SellerOrder }) {
  return (
    <View className="overflow-hidden rounded-[20px] border border-brand-border bg-brand-white">
      <View className="flex-row items-center justify-between p-lg pb-md">
        <Typography variant="headingLeft" className="text-[18px]">
          Destination
        </Typography>
        <LocationPinIcon size={18} color={brandColors.primaryDark} />
      </View>

      <View className="px-lg pb-md">
        <Typography variant="roleTitle">{order.city}</Typography>
        <Typography variant="roleDescription" className="mt-xs text-left text-brand-body">
          {order.port}
        </Typography>
        <Typography variant="legal" className="mt-xs text-left text-brand-body">
          {order.warehouse}
        </Typography>
      </View>

      <Image
        source={{ uri: MAP_PLACEHOLDER }}
        className="h-[140px] w-full"
        resizeMode="cover"
        accessibilityLabel="Destination map placeholder"
      />
    </View>
  );
});
