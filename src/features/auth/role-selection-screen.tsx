import { useCallback, useState } from 'react';

import { ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { AppHeader, PrimaryButton, RoleCard, ScreenWrapper, Typography } from '@/components';
import { CartIcon, LockIcon, StoreIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { useAuthStore } from '@/store/auth-store';
import { brandColors } from '@/theme/colors';
import type { UserRole } from '@/types/session';

const BUYER_HIGHLIGHTS = ['Live prices', 'GST invoices', 'Doorstep delivery'];
const SELLER_HIGHLIGHTS = ['List inventory', 'Track orders', 'Fast payouts'];

export const RoleSelectionScreen = () => {
  const router = useRouter();
  const persistRole = useAuthStore((state) => state.setSelectedRole);
  const storedRole = useAuthStore((state) => state.selectedRole);
  const [selectedRole, setSelectedRole] = useState<UserRole>(storedRole ?? 'buyer');

  const handleContinue = useCallback(() => {
    persistRole(selectedRole);
    router.push(
      (selectedRole === 'seller' ? ROUTES.SELLER.LOGIN : ROUTES.AUTH.CUSTOMER_LOGIN) as Href,
    );
  }, [persistRole, router, selectedRole]);

  const continueLabel = selectedRole === 'seller' ? 'CONTINUE AS SELLER' : 'CONTINUE AS BUYER';

  return (
    <ScreenWrapper padded={false} edges={['bottom']} className="bg-brand-background">
      <AppHeader variant="role" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="grow px-xl pt-lg pb-lg"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{ zIndex: 0 }}
      >
        <View className="items-center">
          <View
            className="mb-md rounded-full bg-brand-badge px-md py-sm"
            style={{ alignSelf: 'center' }}
          >
            <Typography variant="badge">Get started</Typography>
          </View>
          <Typography variant="sectionTitle">Choose Your Role</Typography>
          <Typography variant="subheading" className="mt-sm max-w-[300px]">
            Select how you will use PetroTrade so we can open the right workspace.
          </Typography>
        </View>

        <View accessibilityRole="radiogroup" className="mt-2xl gap-md">
          <RoleCard
            title="Buyer"
            description="Purchase industrial materials at live market rates"
            selected={selectedRole === 'buyer'}
            onPress={() => setSelectedRole('buyer')}
            highlights={BUYER_HIGHLIGHTS}
            icon={
              <CartIcon
                size={26}
                color={selectedRole === 'buyer' ? brandColors.white : brandColors.primary}
              />
            }
          />
          <RoleCard
            title="Seller"
            description="List stock, manage orders, and get paid faster"
            selected={selectedRole === 'seller'}
            onPress={() => setSelectedRole('seller')}
            highlights={SELLER_HIGHLIGHTS}
            icon={
              <StoreIcon
                size={26}
                color={selectedRole === 'seller' ? brandColors.white : brandColors.primary}
              />
            }
          />
        </View>
      </ScrollView>

      <View
        className="border-t border-brand-border px-xl pb-lg pt-md"
        style={{ zIndex: 2, backgroundColor: brandColors.background }}
      >
        <View className="mb-md flex-row items-center justify-center gap-xs">
          <LockIcon size={12} color={brandColors.badgeText} />
          <Typography variant="legal">GST invoicing · Verified partners · Secure access</Typography>
        </View>

        <PrimaryButton
          label={continueLabel}
          showArrow
          className="rounded-xl"
          accessibilityLabel={continueLabel}
          onPress={handleContinue}
        />
      </View>
    </ScreenWrapper>
  );
};
