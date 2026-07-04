import { memo, useCallback } from 'react';

import { Alert, Pressable, View } from 'react-native';

import { Image } from 'expo-image';

import Animated, { FadeInDown, FadeOutRight, LinearTransition } from 'react-native-reanimated';

import { CartQuantitySelector } from '@/components/cart/quantity-selector';
import { Typography } from '@/components/ui/typography';
import { formatCartCurrency, formatPricePerMt } from '@/constants/cart';
import { AlertCircleIcon, TrashIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { iconSizes } from '@/theme/icons';
import { elevation } from '@/theme/shadows';
import type { CartItem } from '@/types/product';
import { cn } from '@/utils/cn';

type CartItemCardProps = {
  item: CartItem;
  index: number;
  onIncrease: (itemId: string) => void;
  onDecrease: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  className?: string;
};

export const CartItemCard = memo(function CartItemCard({
  item,
  index,
  onIncrease,
  onDecrease,
  onRemove,
  className,
}: CartItemCardProps) {
  const subtotal = item.unitPricePerMt * item.quantityMt;
  const belowMoq = item.quantityMt < item.moq;

  const handleRemove = useCallback(() => {
    Alert.alert('Remove item', `Remove ${item.name} from your cart?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => onRemove(item.id),
      },
    ]);
  }, [item.id, item.name, onRemove]);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70)
        .duration(360)
        .springify()
        .damping(18)}
      exiting={FadeOutRight.duration(220)}
      layout={LinearTransition.springify().damping(18)}
      className={cn(
        'mx-lg overflow-hidden rounded-2xl border border-brand-border bg-brand-white',
        className,
      )}
      style={elevation.md}
    >
      <View className="p-md">
        <View className="flex-row">
          <View className="h-[72px] w-[72px] overflow-hidden rounded-xl bg-brand-surface">
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={200}
              accessibilityLabel={`${item.name} product image`}
            />
          </View>

          <View className="ml-md flex-1">
            <View className="flex-row items-start justify-between">
              <View className="mr-sm flex-1">
                <View className="self-start rounded-md bg-brand-primary-light/90 px-sm py-xs">
                  <Typography
                    variant="badge"
                    className="text-[10px] tracking-[0.7px] text-brand-badge-text"
                  >
                    {item.productType}
                  </Typography>
                </View>

                <Typography
                  variant="roleTitle"
                  className="mt-sm text-[15px] leading-[20px] text-brand-heading"
                  numberOfLines={2}
                >
                  {item.name}
                </Typography>

                <Typography variant="roleTitle" className="mt-xs text-[15px] text-brand-primary">
                  {formatPricePerMt(item.unitPricePerMt)}
                </Typography>
              </View>

              <Pressable
                onPress={handleRemove}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.name}`}
                className="h-8 w-8 items-center justify-center rounded-full bg-brand-surface"
              >
                <TrashIcon size={iconSizes.md} color={brandColors.muted} />
              </Pressable>
            </View>
          </View>
        </View>

        <View className="mt-md flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Typography
              variant="fieldLabel"
              className="mr-sm text-[11px] tracking-[0.4px] text-brand-body"
            >
              Quantity
            </Typography>
            <CartQuantitySelector
              quantityMt={item.quantityMt}
              increment={1}
              onIncrement={() => onIncrease(item.id)}
              onDecrement={() => onDecrease(item.id)}
            />
          </View>

          <View className="items-end">
            <Typography
              variant="fieldLabel"
              className="text-[10px] tracking-[0.4px] text-brand-muted"
            >
              Subtotal
            </Typography>
            <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
              {formatCartCurrency(subtotal)}
            </Typography>
          </View>
        </View>
      </View>

      {belowMoq ? (
        <View className="flex-row items-center border-t border-brand-error/20 bg-brand-error-light px-md py-sm">
          <AlertCircleIcon size={iconSizes.sm} color={brandColors.error} />
          <Typography variant="error" className="ml-sm flex-1 text-[12px] text-brand-error">
            Minimum Order Quantity is {item.moq} MT
          </Typography>
        </View>
      ) : null}
    </Animated.View>
  );
});
