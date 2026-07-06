import { memo, useCallback } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui';
import { BackArrowIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { selectCurrentOrder, useOrderStore } from '@/store/order-store';
import { brandColors } from '@/theme/colors';

export const CustomerDispatchPlanningScreen = memo(function CustomerDispatchPlanningScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const order = useOrderStore(selectCurrentOrder);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(ROUTES.CUSTOMER.PURCHASE_ORDER_GENERATED as Href);
  }, [router]);

  return (
    <View className="flex-1 bg-brand-background">
      <View
        className="border-b border-brand-border bg-brand-white px-lg"
        style={{ paddingTop: insets.top }}
      >
        <View className="h-14 flex-row items-center">
          <Pressable
            onPress={handleBack}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="h-10 w-10 items-center justify-center"
          >
            <BackArrowIcon color={brandColors.heading} />
          </Pressable>
          <Typography variant="roleTitle" className="ml-sm text-[17px] text-brand-heading">
            Dispatch Planning
          </Typography>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: insets.bottom + 24,
          justifyContent: 'center',
        }}
      >
        <Typography variant="headingLeft" className="text-center text-[20px] text-brand-heading">
          Dispatch Planning
        </Typography>
        <Typography
          variant="subheadingLeft"
          className="mt-sm text-center text-[14px] leading-[22px] text-brand-body"
        >
          {order
            ? `Coordinating logistics for ${order.poNumber ?? order.id}. Full dispatch planning UI will be implemented in the next flow step.`
            : 'No active order found.'}
        </Typography>
      </ScrollView>
    </View>
  );
});
