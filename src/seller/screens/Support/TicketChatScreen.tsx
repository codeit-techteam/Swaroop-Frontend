import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { ScreenWrapper, Typography } from '@/components';
import { SendIcon } from '@/icons';
import {
  getTicketById,
  getSupportTicket,
  replySupportTicket,
} from '@/seller/services/supportService';
import { SellerHeader } from '@/seller/components';
import { TICKET_STATUS_LABELS } from '@/seller/mock/support';
import type { SupportTicket, SupportTicketMessage } from '@/seller/types/support';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

function formatMessageTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function senderLabel(message: SupportTicketMessage) {
  if (message.sender === 'AGENT') {
    return `${message.senderName} · PetroTrade Support`;
  }
  if (message.sender === 'SYSTEM') return message.senderName || 'System';
  return 'You';
}

const MessageBubble = memo(function MessageBubble({ message }: { message: SupportTicketMessage }) {
  const isAgent = message.sender === 'AGENT';
  const isSystem = message.sender === 'SYSTEM';
  const isYou = message.sender === 'REQUESTER';

  return (
    <View
      className={cn(
        'mb-md max-w-[88%] rounded-2xl border px-md py-sm',
        isYou && 'self-end border-brand-navy/15 bg-brand-navy',
        isAgent && 'self-start border-sky-200 bg-sky-50',
        isSystem && 'self-center border-dashed border-brand-border bg-brand-surface',
      )}
    >
      <View className="flex-row items-start justify-between gap-sm">
        <Typography
          variant="badge"
          className={cn(
            'text-[10px]',
            isYou ? 'text-white/80' : isAgent ? 'text-sky-800' : 'text-brand-body',
          )}
        >
          {senderLabel(message)}
        </Typography>
        <Typography
          variant="badge"
          className={cn('text-[10px]', isYou ? 'text-white/60' : 'text-brand-footer')}
        >
          {formatMessageTime(message.createdAt)}
        </Typography>
      </View>
      <Typography
        variant="subheading"
        className={cn('mt-xs', isYou ? 'text-white' : 'text-brand-heading')}
      >
        {message.body}
      </Typography>
    </View>
  );
});

export const TicketChatScreen = memo(function TicketChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ticketId } = useLocalSearchParams<{ ticketId?: string }>();
  const listRef = useRef<FlatList<SupportTicketMessage>>(null);

  const [ticket, setTicket] = useState<SupportTicket | null>(() =>
    ticketId ? getTicketById(ticketId) ?? null : null,
  );
  const [loading, setLoading] = useState(true);
  const [replyDraft, setReplyDraft] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!ticketId) {
      setLoading(false);
      return;
    }
    try {
      const next = await getSupportTicket(ticketId);
      setTicket(next);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Could not load conversation',
        text2: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    void load();
  }, [load]);

  const messages = useMemo(() => {
    if (!ticket) return [];
    if (ticket.messages.length > 0) return ticket.messages;
    if (!ticket.description.trim()) return [];
    return [
      {
        id: `${ticket.id}-description`,
        sender: 'REQUESTER' as const,
        senderName: 'You',
        body: ticket.description,
        createdAt: ticket.createdAt,
      },
    ];
  }, [ticket]);

  useEffect(() => {
    if (!messages.length) return;
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 120);
    return () => clearTimeout(timer);
  }, [messages.length]);

  const canReply = ticket != null && ticket.apiStatus !== 'CLOSED';

  const handleSend = async () => {
    if (!ticket || !replyDraft.trim() || sending) return;
    setSending(true);
    try {
      const updated = await replySupportTicket(ticket.id, replyDraft);
      setTicket(updated);
      setReplyDraft('');
      Toast.show({ type: 'success', text1: 'Reply sent to support' });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Could not send reply',
        text2: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSending(false);
    }
  };

  const statusLabel = ticket
    ? ticket.apiStatus === 'WAITING_CUSTOMER'
      ? 'Awaiting your reply'
      : TICKET_STATUS_LABELS[ticket.status] ?? ticket.status
    : '';

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader
        title={ticket?.ticketId ?? 'Support Chat'}
        showBack
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        {ticket ? (
          <View className="border-b border-brand-border bg-brand-white px-lg py-md">
            <Typography variant="roleTitle" numberOfLines={2}>
              {ticket.subject}
            </Typography>
            <View className="mt-xs flex-row flex-wrap items-center gap-sm">
              <View className="rounded-full bg-brand-primary-light px-sm py-xs">
                <Typography variant="badge" className="text-[10px] text-brand-primary">
                  {statusLabel}
                </Typography>
              </View>
              <Typography variant="legal" className="text-brand-body">
                {ticket.categoryLabel}
              </Typography>
            </View>
          </View>
        ) : null}

        {loading && !ticket ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={brandColors.primary} />
          </View>
        ) : !ticket ? (
          <View className="flex-1 items-center justify-center px-xl">
            <Typography variant="roleTitle" className="text-center">
              Conversation not found
            </Typography>
            <Typography variant="subheading" className="mt-sm text-center text-brand-body">
              Go back to Support Center and open a ticket to continue chatting.
            </Typography>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            className="flex-1 px-lg"
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
            renderItem={({ item }) => <MessageBubble message={item} />}
            ListHeaderComponent={
              ticket.resolutionNote &&
              (ticket.apiStatus === 'RESOLVED' || ticket.apiStatus === 'CLOSED') ? (
                <View className="mb-md rounded-2xl border border-emerald-200 bg-emerald-50 px-md py-sm">
                  <Typography variant="badge" className="text-[10px] uppercase text-emerald-800">
                    Resolution from support
                  </Typography>
                  <Typography variant="subheading" className="mt-xs text-emerald-900">
                    {ticket.resolutionNote}
                  </Typography>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <Typography variant="subheading" className="mt-xl text-center text-brand-body">
                No messages yet. Send a reply to start the conversation.
              </Typography>
            }
          />
        )}

        {ticket ? (
          canReply ? (
            <View
              className="border-t border-brand-border bg-brand-white px-lg pt-md"
              style={{ paddingBottom: Math.max(insets.bottom, 12) }}
            >
              <View className="flex-row items-end gap-sm">
                <View className="min-h-[48px] flex-1 rounded-2xl border border-brand-border bg-brand-surface px-md py-sm">
                  <TextInput
                    value={replyDraft}
                    onChangeText={setReplyDraft}
                    placeholder={
                      ticket.apiStatus === 'RESOLVED'
                        ? 'Still facing the issue? Reply to reopen…'
                        : 'Write a reply to support…'
                    }
                    placeholderTextColor={brandColors.footer}
                    multiline
                    maxLength={5000}
                    className="max-h-[120px] font-sans text-[15px] text-brand-heading"
                  />
                </View>
                <Pressable
                  onPress={() => void handleSend()}
                  disabled={!replyDraft.trim() || sending}
                  className={cn(
                    'h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy',
                    (!replyDraft.trim() || sending) && 'opacity-40',
                  )}
                  accessibilityLabel="Send reply"
                >
                  {sending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <SendIcon size={20} color="#fff" />
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            <View
              className="border-t border-brand-border bg-brand-white px-lg py-md"
              style={{ paddingBottom: Math.max(insets.bottom, 12) }}
            >
              <Typography variant="legal" className="text-center text-brand-body">
                This ticket is closed. Raise a new ticket if you still need help.
              </Typography>
            </View>
          )
        ) : null}
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
});
