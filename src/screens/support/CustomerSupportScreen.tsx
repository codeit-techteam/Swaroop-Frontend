import { memo, useCallback, useMemo, useState } from 'react';

import {
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader, PrimaryButton, ScreenWrapper, Typography } from '@/components';
import { SupportReplyPreview } from '@/components/support/SupportReplyPreview';
import { ROUTES } from '@/navigation/routes';
import {
  createCustomerSupportTicket,
  filterCustomerTicketsByTab,
  getCustomerSupportSnapshot,
  refreshCustomerSupportTickets,
} from '@/services/customer-support';
import {
  CUSTOMER_TICKET_CATEGORY_OPTIONS,
  CUSTOMER_TICKET_PRIORITY_OPTIONS,
  type CustomerRaiseTicketInput,
  type CustomerSupportTicket,
  type CustomerTicketCategory,
  type CustomerTicketFilterTab,
  type CustomerTicketPriority,
} from '@/types/customer-support';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

const TAB_OPTIONS: Array<{ label: string; value: CustomerTicketFilterTab }> = [
  { label: 'Open', value: 'open' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  in_progress: 'Pending',
  resolved: 'Resolved',
  closed: 'Closed',
};

function TicketRow({ ticket }: { ticket: CustomerSupportTicket }) {
  return (
    <View className="rounded-2xl border border-brand-border bg-brand-white p-lg">
      <View className="flex-row items-start justify-between gap-sm">
        <View className="flex-1">
          <Typography variant="badge" className="text-[11px] text-brand-primary">
            {ticket.ticketId}
          </Typography>
          <Typography variant="roleTitle" className="mt-xs" numberOfLines={1}>
            {ticket.subject}
          </Typography>
        </View>
        <View
          className={cn(
            'rounded-full px-sm py-xs',
            ticket.awaitingReply ? 'bg-orange-50' : 'bg-sky-50',
          )}
        >
          <Typography
            variant="badge"
            className={cn('text-[10px]', ticket.awaitingReply ? 'text-orange-700' : 'text-sky-700')}
          >
            {ticket.awaitingReply
              ? 'Awaiting your reply'
              : (STATUS_LABEL[ticket.status] ?? ticket.status)}
          </Typography>
        </View>
      </View>
      <Typography variant="legal" className="mt-sm text-brand-body">
        {ticket.categoryLabel} · {ticket.createdDate}
      </Typography>
      <SupportReplyPreview
        resolutionNote={ticket.resolutionNote}
        supportReply={ticket.supportReply}
        awaitingReply={ticket.awaitingReply}
      />
    </View>
  );
}

export const CustomerSupportScreen = memo(function CustomerSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [snapshot, setSnapshot] = useState(() => getCustomerSupportSnapshot());
  const [activeTab, setActiveTab] = useState<CustomerTicketFilterTab>('open');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterCustomerTicketsByTab(snapshot.tickets, activeTab),
    [snapshot.tickets, activeTab],
  );

  const load = useCallback(async () => {
    try {
      const next = await refreshCustomerSupportTickets();
      setSnapshot(next);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

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
      <AppHeader variant="back" title="Help & Support" onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              void load();
            }}
          />
        }
      >
        <Typography variant="subheading" className="mt-md text-brand-body">
          Need help with orders, payments, shipment or account? Raise a ticket and
          our PetroTrade support team will respond.
        </Typography>

        <View className="mt-lg flex-row gap-sm">
          <Pressable
            onPress={() => router.push(ROUTES.CUSTOMER.SUPPORT_RAISE as Href)}
            className="flex-1 items-center rounded-2xl bg-brand-primary px-md py-md"
          >
            <Typography variant="badge" className="text-brand-white">
              Raise Ticket
            </Typography>
          </Pressable>
          <Pressable
            onPress={handleCall}
            className="flex-1 items-center rounded-2xl border border-brand-border bg-brand-white px-md py-md"
          >
            <Typography variant="badge" className="text-brand-heading">
              Call Support
            </Typography>
          </Pressable>
          <Pressable
            onPress={handleEmail}
            className="flex-1 items-center rounded-2xl border border-brand-border bg-brand-white px-md py-md"
          >
            <Typography variant="badge" className="text-brand-heading">
              Email
            </Typography>
          </Pressable>
        </View>

        <View className="mt-xl">
          <Typography
            variant="badge"
            className="text-[11px] uppercase tracking-wide text-brand-body"
          >
            My Recent Tickets
          </Typography>
          <View className="mt-md flex-row gap-sm">
            {TAB_OPTIONS.map((tab) => (
              <Pressable
                key={tab.value}
                onPress={() => setActiveTab(tab.value)}
                className={cn(
                  'rounded-full px-md py-sm',
                  activeTab === tab.value
                    ? 'bg-brand-primary'
                    : 'border border-brand-border bg-brand-white',
                )}
              >
                <Typography
                  variant="badge"
                  className={
                    activeTab === tab.value ? 'text-brand-white' : 'text-brand-body'
                  }
                >
                  {tab.label}
                </Typography>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-md gap-md">
          {isLoading ? (
            <Typography variant="subheading" className="text-brand-body">
              Loading tickets…
            </Typography>
          ) : filtered.length === 0 ? (
            <View className="items-center rounded-2xl border border-dashed border-brand-border bg-brand-white px-lg py-xl">
              <Typography variant="roleTitle">No tickets yet</Typography>
              <Typography
                variant="subheading"
                className="mt-sm text-center text-brand-body"
              >
                Raise a ticket if you need assistance from our team.
              </Typography>
            </View>
          ) : (
            filtered.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} />)
          )}
        </View>

        <View className="mt-xl">
          <Typography
            variant="badge"
            className="text-[11px] uppercase tracking-wide text-brand-body"
          >
            FAQ
          </Typography>
          <View className="mt-md gap-sm">
            {snapshot.faqs.map((faq) => (
              <Pressable
                key={faq.id}
                onPress={() =>
                  setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                }
                className="rounded-2xl border border-brand-border bg-brand-white px-lg py-md"
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
          <PrimaryButton
            label="Raise New Ticket"
            onPress={() => router.push(ROUTES.CUSTOMER.SUPPORT_RAISE as Href)}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
});

export const CustomerRaiseTicketScreen = memo(function CustomerRaiseTicketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<CustomerTicketCategory>('orders');
  const [priority, setPriority] = useState<CustomerTicketPriority>('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!subject.trim() || description.trim().length < 10) {
      setError('Please fill subject and a detailed description (min 10 characters).');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const input: CustomerRaiseTicketInput = {
        category,
        priority,
        subject,
        description,
      };
      const ticket = await createCustomerSupportTicket(input);
      setSuccessId(ticket.ticketId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <AppHeader variant="back" title="Raise Ticket" onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <Typography variant="subheading" className="mt-md text-brand-body">
          Describe your issue and our support team will respond within 24 hours.
        </Typography>

        <View className="mt-lg">
          <Typography variant="badge" className="mb-sm text-[11px] uppercase text-brand-body">
            Category
          </Typography>
          <View className="flex-row flex-wrap gap-sm">
            {CUSTOMER_TICKET_CATEGORY_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setCategory(opt.value)}
                className={cn(
                  'rounded-full px-md py-sm',
                  category === opt.value
                    ? 'bg-brand-primary'
                    : 'border border-brand-border bg-brand-white',
                )}
              >
                <Typography
                  variant="badge"
                  className={
                    category === opt.value ? 'text-brand-white' : 'text-brand-body'
                  }
                >
                  {opt.label}
                </Typography>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-lg">
          <Typography variant="badge" className="mb-sm text-[11px] uppercase text-brand-body">
            Priority
          </Typography>
          <View className="flex-row flex-wrap gap-sm">
            {CUSTOMER_TICKET_PRIORITY_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setPriority(opt.value)}
                className={cn(
                  'rounded-full px-md py-sm',
                  priority === opt.value
                    ? 'bg-brand-primary'
                    : 'border border-brand-border bg-brand-white',
                )}
              >
                <Typography
                  variant="badge"
                  className={
                    priority === opt.value ? 'text-brand-white' : 'text-brand-body'
                  }
                >
                  {opt.label}
                </Typography>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-lg gap-md">
          <View className="rounded-2xl border border-brand-border bg-brand-white px-lg py-md">
            <Typography variant="badge" className="mb-xs text-[11px] text-brand-body">
              Subject
            </Typography>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="Brief summary"
              placeholderTextColor={brandColors.muted}
              className="text-[15px] text-brand-heading"
            />
          </View>
          <View className="rounded-2xl border border-brand-border bg-brand-white px-lg py-md">
            <Typography variant="badge" className="mb-xs text-[11px] text-brand-body">
              Description
            </Typography>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Provide details about your issue"
              placeholderTextColor={brandColors.muted}
              multiline
              className="min-h-[100px] text-[15px] text-brand-heading"
              textAlignVertical="top"
            />
          </View>
        </View>

        {error ? (
          <Typography variant="legal" className="mt-md text-brand-error">
            {error}
          </Typography>
        ) : null}

        {successId ? (
          <View className="mt-lg rounded-2xl border border-emerald-200 bg-emerald-50 px-lg py-md">
            <Typography variant="roleTitle" className="text-emerald-800">
              Ticket {successId} submitted
            </Typography>
            <Typography variant="subheading" className="mt-xs text-emerald-700">
              Our support team will contact you shortly.
            </Typography>
            <View className="mt-md">
              <PrimaryButton
                label="Back to Support"
                onPress={() => router.replace(ROUTES.CUSTOMER.SUPPORT as Href)}
              />
            </View>
          </View>
        ) : (
          <View className="mt-xl">
            <PrimaryButton
              label={isSubmitting ? 'Submitting…' : 'Submit Ticket'}
              onPress={() => void handleSubmit()}
              disabled={isSubmitting}
            />
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
});
