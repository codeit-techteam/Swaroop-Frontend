import { memo, useState } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { SellerBottomNavigation, SellerDashboardHeader } from '@/seller/components';
import { SettlementNotificationPanel } from '@/seller/modules/settlement-payout/components';
import { useSettlementStore } from '@/seller/modules/settlement-payout/store/settlementStore';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import { useSellerStore } from '@/seller/store/sellerStore';

const SETTINGS_LINKS = [
  {
    id: 'settlements',
    label: 'Settlement & Payout',
    description: 'View pending releases, history, and tax documents',
    route: ROUTES.SELLER.SETTLEMENTS,
  },
  {
    id: 'documents',
    label: 'Tax & Documents',
    description: 'Invoices, GST reports, and TDS certificates',
    route: ROUTES.SELLER.SETTLEMENT_DOCUMENTS,
  },
  {
    id: 'history',
    label: 'Settlement History',
    description: 'All released payouts and settlement advice',
    route: ROUTES.SELLER.SETTLEMENT_HISTORY,
  },
] as const;

export const SellerSettingsScreen = memo(function SellerSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sellerName = useSellerStore(
    (state) => state.account?.ownerName || state.company.companyName || state.profile.ownerName,
  );
  const companyName = useSellerStore(
    (state) => state.account?.companyName || state.company.companyName,
  );
  const logoutSeller = useSellerStore((state) => state.logoutSeller);
  const notifications = useSettlementStore((state) => state.notifications);
  const markNotificationRead = useSettlementStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useSettlementStore((state) => state.markAllNotificationsRead);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <View className="flex-1">
        <ScrollView
          className="flex-1 px-lg"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 120 }}
        >
          <SellerDashboardHeader
            sellerName={sellerName}
            onNotificationPress={() => setShowNotifications((value) => !value)}
          />

          {showNotifications ? (
            <View className="mt-md">
              <SettlementNotificationPanel
                notifications={notifications}
                onMarkAllRead={markAllNotificationsRead}
                onMarkRead={markNotificationRead}
              />
            </View>
          ) : null}

          <Typography variant="headingLeft" className="mt-lg text-[30px]">
            Profile
          </Typography>
          <Typography variant="subheading" className="mt-xs text-brand-body">
            Account, settlements, and organization settings
          </Typography>

          <View className="mt-lg rounded-[24px] border border-brand-border bg-brand-white px-lg py-lg">
            <Typography variant="roleTitle">{companyName || 'PetroTrade Seller'}</Typography>
            <Typography variant="legal" className="mt-xs text-left text-brand-body">
              Enterprise seller account
            </Typography>
          </View>

          <View className="mt-lg gap-md">
            {SETTINGS_LINKS.map((link) => (
              <Pressable
                key={link.id}
                onPress={() => router.push(link.route as Href)}
                className="rounded-[22px] border border-brand-border bg-brand-white px-lg py-lg"
                style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
              >
                <Typography variant="roleTitle">{link.label}</Typography>
                <Typography variant="legal" className="mt-xs text-left text-brand-body">
                  {link.description}
                </Typography>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => {
              logoutSeller();
              router.replace(ROUTES.AUTH.ROLE_SELECTION as Href);
            }}
            className="mt-xl rounded-2xl bg-brand-surface px-lg py-md"
          >
            <Typography variant="roleTitle" className="text-center text-brand-error">
              Logout
            </Typography>
          </Pressable>
        </ScrollView>

        <SellerBottomNavigation
          active="profile"
          onNavigate={(target) => navigateSellerBottomTab(router, target)}
        />
      </View>
    </ScreenWrapper>
  );
});
