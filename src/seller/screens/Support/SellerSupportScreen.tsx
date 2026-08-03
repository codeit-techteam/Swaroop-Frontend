import { memo, useState } from 'react';

import { Linking, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, ScreenWrapper, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import {
  EmptyState,
  FilterTabRow,
  NotificationSkeleton,
  QuickActionButton,
  SellerHeader,
  StatusBottomSheet,
  TicketCard,
} from '@/seller/components';
import { useSellerSupport } from '@/seller/hooks/useSellerSupport';
import type { TicketFilterTab } from '@/seller/types/support';

const TAB_OPTIONS = [
  { label: 'Open', value: 'open' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

export const SellerSupportScreen = memo(function SellerSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { snapshot, filteredTickets, activeTab, setActiveTab, isLoading, isRefreshing, refresh } =
    useSellerSupport();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [statusSheet, setStatusSheet] = useState(false);

  const handleCall = () => {
    const phone = snapshot.contacts.find((c) => c.type === 'phone');
    if (phone) void Linking.openURL(`tel:${phone.value.replace(/\s/g, '')}`);
  };

  const handleEmail = () => {
    const email = snapshot.contacts.find((c) => c.type === 'email');
    if (email) void Linking.openURL(`mailto:${email.value}`);
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader
        title="Support Center"
        showBack
        showBell
        onBack={() => router.back()}
        onBellPress={() => router.push(ROUTES.SELLER.NOTIFICATIONS as Href)}
      />

      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />}
      >
        <Typography variant="subheading" className="mt-md text-brand-body">
          Get help with orders, payments, dispatch, and account issues.
        </Typography>

        <View className="mt-lg flex-row gap-sm">
          <QuickActionButton
            label="Create Ticket"
            onPress={() => router.push(ROUTES.SELLER.RAISE_TICKET as Href)}
          />
          <QuickActionButton label="Call Support" icon="phone" onPress={handleCall} />
          <QuickActionButton label="Chat Coming Soon" onPress={() => setStatusSheet(true)} disabled />
          <QuickActionButton label="Email Support" onPress={handleEmail} />
        </View>

        <View className="mt-xl">
          <Typography variant="badge" className="text-[11px] uppercase tracking-wide text-brand-body">
            Track Tickets
          </Typography>
          <View className="mt-md">
            <FilterTabRow
              options={TAB_OPTIONS}
              selected={activeTab}
              onSelect={(value) => setActiveTab(value as TicketFilterTab)}
            />
          </View>
        </View>

        {isLoading ? (
          <View className="mt-lg">
            <NotificationSkeleton />
          </View>
        ) : filteredTickets.length === 0 ? (
          <View className="mt-lg">
            <EmptyState
              variant="no_notifications"
              title="No tickets in this category"
              description="Create a support ticket if you need assistance from the PetroTrade team."
              ctaLabel="Create Ticket"
              onCtaPress={() => router.push(ROUTES.SELLER.RAISE_TICKET as Href)}
            />
          </View>
        ) : (
          <View className="mt-md gap-md">
            {filteredTickets.map((ticket, index) => (
              <Animated.View key={ticket.id} entering={FadeInDown.delay(index * 50).duration(280)}>
                <TicketCard ticket={ticket} />
              </Animated.View>
            ))}
          </View>
        )}

        <View className="mt-xl">
          <Typography variant="badge" className="text-[11px] uppercase tracking-wide text-brand-body">
            FAQ
          </Typography>
          <View className="mt-md gap-sm">
            {snapshot.faqs.map((faq) => (
              <Pressable
                key={faq.id}
                onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                className="rounded-[22px] border border-brand-border bg-brand-white px-lg py-md"
              >
                <Typography variant="roleTitle">{faq.question}</Typography>
                {expandedFaq === faq.id ? (
                  <Typography variant="subheading" className="mt-sm text-brand-body">
                    {faq.answer}
                  </Typography>
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-xl">
          <Typography variant="badge" className="text-[11px] uppercase tracking-wide text-brand-body">
            Contact PetroTrade
          </Typography>
          <View className="mt-md rounded-[22px] border border-brand-border bg-brand-white px-lg py-lg">
            {snapshot.contacts.map((contact, index) => (
              <View
                key={contact.id}
                className={index < snapshot.contacts.length - 1 ? 'mb-md border-b border-brand-border pb-md' : undefined}
              >
                <Typography variant="roleTitle">{contact.label}</Typography>
                <Typography variant="legal" className="mt-xs text-brand-primary">
                  {contact.value}
                </Typography>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-xl">
          <PrimaryButton
            label="Raise New Ticket"
            onPress={() => router.push(ROUTES.SELLER.RAISE_TICKET as Href)}
          />
        </View>
      </ScrollView>

      <StatusBottomSheet
        visible={statusSheet}
        variant="success"
        title="Coming Soon"
        message="Live chat support will be available in a future update."
        onDismiss={() => setStatusSheet(false)}
      />
    </ScreenWrapper>
  );
});
