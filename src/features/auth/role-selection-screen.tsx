import { useCallback, useState } from 'react';

import { View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { AppHeader, PrimaryButton, RoleCard, ScreenWrapper, SectionTitle } from '@/components';
import { CartIcon, IndustrialTanks, StoreIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { useAuthStore } from '@/store/auth-store';
import { brandColors } from '@/theme/colors';
import type { UserRole } from '@/types/session';
import { wp } from '@/utils/responsive';

export const RoleSelectionScreen = () => {
  const router = useRouter();
  const persistRole = useAuthStore((state) => state.setSelectedRole);
  const storedRole = useAuthStore((state) => state.selectedRole);
  const [selectedRole, setSelectedRole] = useState<UserRole>(storedRole ?? 'buyer');

  const handleContinue = useCallback(() => {
    if (selectedRole !== 'buyer') {
      return;
    }
    persistRole(selectedRole);
    router.push(ROUTES.AUTH.CUSTOMER_LOGIN as Href);
  }, [persistRole, router, selectedRole]);

  return (
    <ScreenWrapper padded={false} edges={['bottom']} className="bg-brand-surface">
      <AppHeader variant="role" />

      <View className="flex-1 px-xl pt-2xl">
        <SectionTitle
          title="Choose Your Role"
          subtitle="Select how you will use PetroTrade to get started."
        />

        <View className="relative mt-2xl flex-1">
          <View className="absolute bottom-16 left-0 right-0 items-center">
            <IndustrialTanks width={wp(100)} height={wp(42)} />
          </View>

          <View className="gap-md">
            <RoleCard
              title="Buyer"
              description="Purchase industrial materials"
              selected={selectedRole === 'buyer'}
              onPress={() => setSelectedRole('buyer')}
              icon={
                <CartIcon
                  color={selectedRole === 'buyer' ? brandColors.primary : brandColors.body}
                />
              }
            />
            <RoleCard
              title="Seller"
              description="Sell & manage inventory"
              selected={selectedRole === 'seller'}
              onPress={() => setSelectedRole('seller')}
              icon={
                <StoreIcon
                  color={selectedRole === 'seller' ? brandColors.primary : brandColors.body}
                />
              }
            />
          </View>
        </View>

        <View className="pb-xl pt-lg">
          <PrimaryButton
            label="CONTINUE"
            showArrow
            onPress={handleContinue}
            disabled={selectedRole !== 'buyer'}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};
