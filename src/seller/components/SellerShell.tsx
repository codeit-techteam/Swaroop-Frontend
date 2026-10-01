import { memo, type ReactNode, useState } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import { ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { SellerCard, SellerSuccessBanner } from '@/seller/components/SellerCards';
import { SellerHeader } from '@/seller/components/SellerHeader';
import { SELLER_MENU_SECTIONS } from '@/seller/constants';
import { useSellerStore } from '@/seller/store/sellerStore';
import type { SellerMenuSection } from '@/seller/types';
import { cn } from '@/utils/cn';

type SellerShellProps = {
  section: SellerMenuSection;
  title: string;
  subtitle: string;
  children?: ReactNode;
};

const SECTION_ROUTES: Record<SellerMenuSection, string> = {
  dashboard: ROUTES.SELLER.DASHBOARD,
  inventory: ROUTES.SELLER.INVENTORY,
  products: ROUTES.SELLER.PRODUCTS,
  orders: ROUTES.SELLER.ORDERS,
  customers: ROUTES.SELLER.CUSTOMERS,
  settlements: ROUTES.SELLER.SETTLEMENTS,
  warehouse: ROUTES.SELLER.WAREHOUSE,
  dispatch: ROUTES.SELLER.DISPATCH,
  analytics: ROUTES.SELLER.ANALYTICS,
  support: ROUTES.SELLER.SUPPORT,
  settings: ROUTES.SELLER.SETTINGS,
};

export const SellerShell = memo(function SellerShell({
  section,
  title,
  subtitle,
  children,
}: SellerShellProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const companyName = useSellerStore(
    (state) => state.account?.companyName || state.company.companyName,
  );
  const logoutSeller = useSellerStore((state) => state.logoutSeller);

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader
        title="Seller Dashboard"
        subtitle={companyName || 'PetroTrade Seller'}
        showMenu
        showBell
        onMenuPress={() => setDrawerOpen(true)}
      />

      <ScrollView className="flex-1 px-xl" contentContainerStyle={{ paddingBottom: 32 }}>
        <SellerSuccessBanner title={title} description={subtitle} className="mt-md" />

        <SellerCard title="Business Snapshot" className="mt-lg">
          <View className="flex-row flex-wrap gap-md">
            <View className="min-w-[46%] flex-1 rounded-2xl bg-brand-surface p-md">
              <Typography variant="legal" className="text-left">
                Open Orders
              </Typography>
              <Typography variant="headingLeft" className="mt-xs text-[24px]">
                18
              </Typography>
            </View>
            <View className="min-w-[46%] flex-1 rounded-2xl bg-brand-surface p-md">
              <Typography variant="legal" className="text-left">
                Collections Due
              </Typography>
              <Typography variant="headingLeft" className="mt-xs text-[24px]">
                Rs 4.2L
              </Typography>
            </View>
          </View>
        </SellerCard>

        <SellerCard title="Module Status" className="mt-lg">
          <Typography variant="body">
            {children ??
              'Dummy seller module content is active and ready for future API integration.'}
          </Typography>
        </SellerCard>
      </ScrollView>

      {drawerOpen ? (
        <View className="absolute inset-0 flex-row">
          <View className="w-[78%] bg-brand-white px-lg pb-xl pt-2xl shadow-lg">
            <Typography variant="headingLeft" className="mb-sm text-[20px]">
              PetroTrade Seller
            </Typography>
            <Typography variant="subheadingLeft" className="mb-lg">
              Enterprise operations workspace
            </Typography>

            {SELLER_MENU_SECTIONS.map((item) => {
              const active = item.id === section;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    setDrawerOpen(false);
                    router.replace(SECTION_ROUTES[item.id] as Href);
                  }}
                  className={cn(
                    'mb-sm rounded-2xl px-md py-md',
                    active ? 'bg-brand-primary-light' : 'bg-transparent',
                  )}
                >
                  <Typography
                    variant="roleTitle"
                    className={active ? 'text-brand-primary' : 'text-brand-heading'}
                  >
                    {item.label}
                  </Typography>
                  <Typography variant="legal" className="mt-xs text-left">
                    {item.blurb}
                  </Typography>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => {
                logoutSeller();
                setDrawerOpen(false);
                router.replace(ROUTES.AUTH.ROLE_SELECTION as Href);
              }}
              className="mt-auto rounded-2xl bg-brand-surface px-md py-md"
            >
              <Typography variant="roleTitle">Logout</Typography>
            </Pressable>
          </View>
          <Pressable className="flex-1 bg-black/25" onPress={() => setDrawerOpen(false)} />
        </View>
      ) : null}
    </ScreenWrapper>
  );
});
