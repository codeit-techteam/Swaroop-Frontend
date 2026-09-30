import { memo, useEffect, useState } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { apiClient } from '@/api/client';
import { ScreenWrapper, Typography } from '@/components';
import {
  BankIcon,
  BellIcon,
  BuildingIcon,
  ClipboardCheckIcon,
  DocumentFileIcon,
  HeadsetIcon,
  LocationPinIcon,
  LogoutIcon,
  ProfileIcon,
  ShieldCheckIcon,
  StoreIcon,
  TruckIcon,
} from '@/icons';
import { ROUTES } from '@/navigation/routes';
import {
  ProfileHeader,
  ProfileInfoCard,
  ProfileMenuItem,
  SellerBottomNavigation,
} from '@/seller/components';
import { navigateSellerBottomTab } from '@/seller/navigation/useSellerBottomNavigation';
import { getSellerProfile } from '@/seller/services/sellerMockService';
import { useSellerStore } from '@/seller/store/sellerStore';
import { showConfirmDialog } from '@/store/dialog-store';
import { brandColors } from '@/theme/colors';

const PROFILE_ROUTE_MAP = {
  'company-profile': ROUTES.SELLER.PROFILE_COMPANY,
  'business-address': ROUTES.SELLER.PROFILE_ADDRESS,
  'gst-information': ROUTES.SELLER.PROFILE_GST,
  'my-offers': ROUTES.SELLER.OFFERS,
  'my-shipments': ROUTES.SELLER.SHIPMENTS,
  'purchase-requests': ROUTES.SELLER.PURCHASE_REQUESTS,
  'price-revisions': ROUTES.SELLER.PRICE_REVISIONS,
  'vehicle-slots': ROUTES.SELLER.VEHICLE_SLOTS,
  'procurement-workbench': ROUTES.SELLER.PROCUREMENT_WORKBENCH,
  payments: ROUTES.SELLER.PAYMENTS,
  'bank-details': ROUTES.SELLER.PROFILE_BANK,
  'kyc-documents': ROUTES.SELLER.PROFILE_KYC,
  'trade-licenses': ROUTES.SELLER.PROFILE_TRADE_LICENSES,
  'help-support': ROUTES.SELLER.SUPPORT,
  'documents-center': ROUTES.SELLER.PROFILE_DOCUMENTS,
  'app-settings': ROUTES.SELLER.SETTINGS,
  security: ROUTES.SELLER.PROFILE_SECURITY,
} as const;

export const SellerProfileScreen = memo(function SellerProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = getSellerProfile();
  const logoutSeller = useSellerStore((state) => state.logoutSeller);

  const navigateProfileRoute = (routeKey: keyof typeof PROFILE_ROUTE_MAP) => {
    router.push(PROFILE_ROUTE_MAP[routeKey] as Href);
  };

  const handleLogout = () => {
    logoutSeller();
    router.replace(ROUTES.AUTH.ROLE_SELECTION as Href);
  };

  const confirmLogout = () => {
    showConfirmDialog({
      title: 'Logout?',
      message: 'You will need to sign in again to access your seller account.',
      confirmLabel: 'Logout',
      cancelLabel: 'Stay signed in',
      variant: 'danger',
      onConfirm: handleLogout,
    });
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <View className="flex-1">
        <View
          className="bg-brand-white px-xl pb-md"
          style={{ paddingTop: Math.max(insets.top, 12) }}
        >
          <View className="min-h-12 flex-row items-center justify-between">
            <View className="flex-row items-center gap-sm">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-primary-light">
                <ProfileIcon size={18} color={brandColors.primaryDark} />
              </View>
              <Typography variant="logo" className="text-[18px] text-brand-heading">
                Account
              </Typography>
            </View>
            <Pressable
              onPress={() => router.push(ROUTES.SELLER.NOTIFICATIONS as Href)}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              className="h-10 w-10 items-center justify-center rounded-full"
              style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
            >
              <BellIcon />
            </Pressable>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-lg"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 120 }}
        >
          <ProfileHeader
            profile={profile}
            onEditProfile={() => router.push(ROUTES.SELLER.PROFILE_EDIT as Href)}
          />
          <AccountManagerCard />

          <ProfileInfoCard title="Company Information">
            <ProfileMenuItem
              icon={<BuildingIcon size={18} color={brandColors.primaryDark} />}
              title="Company Profile"
              subtitle="View entity details"
              onPress={() => navigateProfileRoute('company-profile')}
            />
            <ProfileMenuItem
              icon={<LocationPinIcon size={18} color={brandColors.primaryDark} />}
              title="Business Address"
              subtitle={profile.address}
              onPress={() => navigateProfileRoute('business-address')}
            />
            <ProfileMenuItem
              icon={<DocumentFileIcon size={18} color={brandColors.primaryDark} />}
              title="GST Information"
              subtitle={profile.gst}
              subtitleAccent="primary"
              onPress={() => navigateProfileRoute('gst-information')}
            />
            <ProfileMenuItem
              icon={<StoreIcon size={18} color={brandColors.primaryDark} />}
              title="My Offers"
              subtitle="Manage active listings"
              onPress={() => navigateProfileRoute('my-offers')}
            />
            <ProfileMenuItem
              icon={<TruckIcon size={18} color={brandColors.primaryDark} />}
              title="My Shipments"
              subtitle="Track active deliveries"
              onPress={() => navigateProfileRoute('my-shipments')}
            />
            <ProfileMenuItem
              icon={<StoreIcon size={18} color={brandColors.primaryDark} />}
              title="Purchase Requests"
              subtitle="Accept, reject, or counter"
              onPress={() => navigateProfileRoute('purchase-requests')}
            />
            <ProfileMenuItem
              icon={<DocumentFileIcon size={18} color={brandColors.primaryDark} />}
              title="Price Revisions"
              subtitle="Buyer price negotiations"
              onPress={() => navigateProfileRoute('price-revisions')}
            />
            <ProfileMenuItem
              icon={<TruckIcon size={18} color={brandColors.primaryDark} />}
              title="Vehicle Slots"
              subtitle="Loading bay bookings"
              onPress={() => navigateProfileRoute('vehicle-slots')}
            />
            <ProfileMenuItem
              icon={<ClipboardCheckIcon size={18} color={brandColors.primaryDark} />}
              title="Procurement Workbench"
              subtitle="End-to-end deal pipeline"
              onPress={() => navigateProfileRoute('procurement-workbench')}
            />
            <ProfileMenuItem
              icon={<BankIcon size={18} color={brandColors.primaryDark} />}
              title="Payments & PI"
              subtitle="Payments and proforma invoices"
              onPress={() => navigateProfileRoute('payments')}
              isLast
            />
          </ProfileInfoCard>

          <ProfileInfoCard title="Financial & Compliance">
            <ProfileMenuItem
              icon={<BankIcon size={18} color={brandColors.primaryDark} />}
              title="Bank Details"
              subtitle={profile.bankVerified ? 'Verified' : 'Pending verification'}
              subtitleAccent={profile.bankVerified ? 'success' : 'default'}
              onPress={() => navigateProfileRoute('bank-details')}
            />
            <ProfileMenuItem
              icon={<DocumentFileIcon size={18} color={brandColors.primaryDark} />}
              title="KYC Documents"
              subtitle={`${profile.kycDocumentsCount} files uploaded`}
              onPress={() => navigateProfileRoute('kyc-documents')}
            />
            <ProfileMenuItem
              icon={<ShieldCheckIcon size={18} color={brandColors.primaryDark} />}
              title="Trade Licenses"
              subtitle={`Expires in ${profile.tradeLicenseExpiryDays} days`}
              onPress={() => navigateProfileRoute('trade-licenses')}
              isLast
            />
          </ProfileInfoCard>

          <ProfileInfoCard title="Support & Settings">
            <ProfileMenuItem
              icon={<HeadsetIcon size={18} color={brandColors.primaryDark} />}
              title="Help & Support"
              subtitle="FAQs and direct contact"
              onPress={() => navigateProfileRoute('help-support')}
            />
            <ProfileMenuItem
              icon={<DocumentFileIcon size={18} color={brandColors.primaryDark} />}
              title="Documents Center"
              subtitle="All Seller Documents"
              onPress={() => navigateProfileRoute('documents-center')}
            />
            <ProfileMenuItem
              icon={<ProfileIcon size={18} color={brandColors.primaryDark} />}
              title="App Settings"
              subtitle="Preferences and display"
              onPress={() => navigateProfileRoute('app-settings')}
            />
            <ProfileMenuItem
              icon={<ShieldCheckIcon size={18} color={brandColors.primaryDark} />}
              title="Security"
              subtitle="Password and 2FA"
              onPress={() => navigateProfileRoute('security')}
              isLast
            />
          </ProfileInfoCard>

          <Pressable
            onPress={confirmLogout}
            accessibilityRole="button"
            accessibilityLabel="Log out"
            className="mt-xl flex-row items-center justify-center gap-sm rounded-2xl border border-brand-error/40 bg-brand-white px-lg py-md"
            style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
          >
            <LogoutIcon size={18} color={brandColors.error} />
            <Typography variant="roleTitle" className="text-brand-error">
              Log out
            </Typography>
          </Pressable>

          <Typography variant="legal" className="mt-lg text-center text-brand-footer">
            {profile.appVersion}
          </Typography>
        </ScrollView>

        <SellerBottomNavigation
          active="profile"
          onNavigate={(target) => navigateSellerBottomTab(router, target)}
        />
      </View>
    </ScreenWrapper>
  );
});

const AccountManagerCard = memo(function AccountManagerCard() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void apiClient
      .get('/seller/profile')
      .then((response) => {
        const payload = response.data?.data ?? response.data;
        const managers = Array.isArray(payload?.accountManagers)
          ? payload.accountManagers
          : [];
        const manager =
          managers.find((row: { isPrimary?: boolean }) => row.isPrimary) ?? managers[0];
        if (!manager || cancelled) return;
        const name = manager.name || 'Seller Manager';
        const contact = [manager.phone, manager.email].filter(Boolean).join(' · ');
        setText(contact ? `${name} · ${contact}` : name);
      })
      .catch(() => {
        if (!cancelled) setText(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!text) return null;

  return (
    <View className="mb-md rounded-2xl bg-brand-white p-md">
      <Typography variant="legal" className="text-brand-footer">
        Account Manager
      </Typography>
      <Typography variant="body" className="mt-xs text-brand-heading">
        {text}
      </Typography>
    </View>
  );
});
