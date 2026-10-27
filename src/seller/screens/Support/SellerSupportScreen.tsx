import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { Linking, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { type Href, useFocusEffect, useRouter } from 'expo-router';
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
  TicketCard,
} from '@/seller/components';
import { useSellerSupport } from '@/seller/hooks/useSellerSupport';
import type { SupportTicket, TicketFilterTab } from '@/seller/types/support';

const TAB_OPTIONS = [
  { label: 'Open', value: 'open' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

function ticketChatHref(ticketId: string): Href {
  return `${ROUTES.SELLER.TICKET_CHAT}?ticketId=${encodeURIComponent(ticketId)}` as Href;
}

export const SellerSupportScreen = memo(function SellerSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    snapshot,
    filteredTickets,
    preferredChatTicket,
    activeTab,
    setActiveTab,
    isLoading,
    isRefreshing,
    refresh,
    reload,
    pullRefresh,
  } = useSellerSupport();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const hasFocused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!hasFocused.current) {
        hasFocused.current = true;
        return;
      }
      void reload().catch(() => undefined);
    }, [reload]),
  );

  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const openTicketChat = useCallback(
    (ticket: SupportTicket) => {
      router.push(ticketChatHref(ticket.id));
    },
    [router],
  );

  const handleChat = useCallback(() => {
    if (preferredChatTicket) {
      openTicketChat(preferredChatTicket);
    }
  }, [openTicketChat, preferredChatTicket]);

  const handleCall = () => {
    const phone = snapshot.contacts.find((c) => c.type === 'phone');
    if (phone) void Linking.openURL(`tel:${phone.value.replace(/\s/g, '')}`);
  };

  const handleEmail = () => {
    const email = snapshot.contacts.find((c) => c.type === 'email');
    if (email) void Linking.openURL(`mailto:${email.value}`);
  };

  const handleContactPress = (type: string, value: string) => {
    if (type === 'phone') void Linking.openURL(`tel:${value.replace(/\s/g, '')}`);
    else if (type === 'email') void Linking.openURL(`mailto:${value}`);
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader
        title="Support Center"
        showBack
        showBell
        onBellPress={() => router.push(ROUTES.SELLER.NOTIFICATIONS as Href)}
      />

      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void pullRefresh()} />}
      >
        <Typography variant="subheading" className="mt-md text-brand-body">
          Get help with orders, payments, dispatch, and account issues.
        </Typography>

        <View className="mt-lg gap-sm">
          <View className="flex-row gap-sm">
            <QuickActionButton
              label="Create Ticket"
              onPress={() => router.push(ROUTES.SELLER.RAISE_TICKET as Href)}
            />
            {preferredChatTicket ? (
              <QuickActionButton
                label="Open ticket chat"
                icon="headset"
                highlight
                onPress={handleChat}
              />
            ) : (
              <QuickActionButton label="Email Support" onPress={handleEmail} />
            )}
          </View>
          <View className="flex-row gap-sm">
            <QuickActionButton label="Call Support" icon="phone" onPress={handleCall} />
            {preferredChatTicket ? (
              <QuickActionButton label="Email Support" onPress={handleEmail} />
            ) : (
              <QuickActionButton
                label="Raise Ticket"
                icon="headset"
                onPress={() => router.push(ROUTES.SELLER.RAISE_TICKET as Href)}
              />
            )}
          </View>
        </View>

        {preferredChatTicket?.awaitingReply ? (
          <Pressable
            onPress={() => openTicketChat(preferredChatTicket)}
            className="mt-lg rounded-2xl border border-orange-200 bg-orange-50 px-lg py-md"
          >
            <Typography variant="badge" className="text-[10px] uppercase text-orange-700">
              Support needs your reply
            </Typography>
            <Typography variant="roleTitle" className="mt-xs" numberOfLines={1}>
              {preferredChatTicket.ticketId} · {preferredChatTicket.subject}
            </Typography>
            <Typography variant="legal" className="mt-xs text-orange-800">
              Tap to open chat and continue the conversation.
            </Typography>
          </Pressable>
        ) : null}

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
              description="Create a support ticket, or reach PolyStoreX by email or phone from the contacts below."
              ctaLabel="Create Ticket"
              onCtaPress={() => router.push(ROUTES.SELLER.RAISE_TICKET as Href)}
            />
          </View>
        ) : (
          <View className="mt-md gap-md">
            {filteredTickets.map((ticket, index) => (
              <Animated.View key={ticket.id} entering={FadeInDown.delay(index * 50).duration(280)}>
                <TicketCard ticket={ticket} onPress={() => openTicketChat(ticket)} />
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
            Contact PolyStoreX
          </Typography>
          <View className="mt-md rounded-[22px] border border-brand-border bg-brand-white px-lg py-lg">
            {snapshot.contacts.map((contact, index) => (
              <Pressable
                key={contact.id}
                onPress={() => handleContactPress(contact.type, contact.value)}
                className={
                  index < snapshot.contacts.length - 1
                    ? 'mb-md border-b border-brand-border pb-md'
                    : undefined
                }
              >
                <Typography variant="roleTitle">{contact.label}</Typography>
                <Typography variant="legal" className="mt-xs text-brand-primary">
                  {contact.value}
                </Typography>
              </Pressable>
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
    </ScreenWrapper>
  );
});
