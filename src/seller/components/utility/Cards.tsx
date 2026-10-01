import { memo } from 'react';

import { Pressable, View } from 'react-native';

import { Typography } from '@/components';
import { SupportReplyPreview } from '@/components/support/SupportReplyPreview';
import { LockIcon, PhoneIcon } from '@/icons';
import { DEVICE_TYPE_LABELS } from '@/seller/mock/security';
import { TICKET_STATUS_LABELS } from '@/seller/mock/support';
import type { SupportTicket, TicketStatus } from '@/seller/types/support';
import type { ActiveSession, TrustedDevice } from '@/seller/types/security';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

const TICKET_STATUS_STYLES: Record<TicketStatus, { bg: string; text: string }> = {
  open: { bg: 'bg-brand-primary-light', text: 'text-brand-primary' },
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-700' },
  resolved: { bg: 'bg-green-50', text: 'text-brand-success' },
  closed: { bg: 'bg-brand-surface', text: 'text-brand-body' },
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-brand-body',
  medium: 'text-brand-primary',
  high: 'text-amber-700',
  urgent: 'text-brand-error',
};

type TicketCardProps = {
  ticket: SupportTicket;
  onPress?: () => void;
};

export const TicketCard = memo(function TicketCard({ ticket, onPress }: TicketCardProps) {
  const statusStyle = TICKET_STATUS_STYLES[ticket.status];

  return (
    <Pressable
      onPress={onPress}
      className="rounded-[22px] border border-brand-border bg-brand-white p-lg"
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <View className="flex-row items-start justify-between gap-sm">
        <View className="flex-1">
          <Typography variant="badge" className="text-[11px] text-brand-primary">
            {ticket.ticketId}
          </Typography>
          <Typography variant="roleTitle" className="mt-xs" numberOfLines={1}>
            {ticket.subject}
          </Typography>
        </View>
        <View className={cn('rounded-full px-sm py-xs', statusStyle.bg)}>
          <Typography variant="badge" className={cn('text-[10px]', statusStyle.text)}>
            {TICKET_STATUS_LABELS[ticket.status]}
          </Typography>
        </View>
      </View>

      <View className="mt-sm flex-row flex-wrap items-center gap-md">
        <Typography variant="legal" className="text-brand-body">
          {ticket.categoryLabel}
        </Typography>
        <Typography variant="legal" className={cn(PRIORITY_COLORS[ticket.priority])}>
          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
        </Typography>
        <Typography variant="legal" className="text-brand-body">
          {ticket.createdDate}
        </Typography>
      </View>

      <SupportReplyPreview
        resolutionNote={ticket.resolutionNote}
        supportReply={ticket.supportReply}
        awaitingReply={ticket.awaitingReply}
      />
    </Pressable>
  );
});

type SessionCardProps = {
  session: ActiveSession;
  onLogout?: () => void;
};

export const SessionCard = memo(function SessionCard({ session, onLogout }: SessionCardProps) {
  return (
    <View className="rounded-[22px] border border-brand-border bg-brand-white p-lg">
      <View className="flex-row items-start justify-between gap-sm">
        <View className="flex-1">
          <View className="flex-row items-center gap-sm">
            <Typography variant="roleTitle">{session.device}</Typography>
            {session.isCurrent ? (
              <View className="rounded-full bg-brand-primary-light px-sm py-0.5">
                <Typography variant="badge" className="text-[10px] text-brand-primary">
                  Current Session
                </Typography>
              </View>
            ) : null}
          </View>
          <Typography variant="legal" className="mt-xs text-left text-brand-body">
            {session.location}
          </Typography>
          <Typography variant="legal" className="mt-0.5 text-left text-brand-footer">
            Last login: {session.lastLogin}
          </Typography>
        </View>
        {!session.isCurrent && onLogout ? (
          <Pressable
            onPress={onLogout}
            className="rounded-xl border border-brand-error px-sm py-xs"
            style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
          >
            <Typography variant="badge" className="text-brand-error">
              Revoke
            </Typography>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

type TrustedDeviceCardProps = {
  device: TrustedDevice;
  onRemove?: () => void;
};

export const TrustedDeviceCard = memo(function TrustedDeviceCard({
  device,
  onRemove,
}: TrustedDeviceCardProps) {
  return (
    <View className="flex-row items-center justify-between rounded-[22px] border border-brand-border bg-brand-white px-lg py-md">
      <View className="flex-row items-center gap-md">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-primary-light">
          <LockIcon size={18} color={brandColors.primaryDark} />
        </View>
        <View>
          <Typography variant="roleTitle">{device.name}</Typography>
          <Typography variant="legal" className="text-brand-body">
            {DEVICE_TYPE_LABELS[device.type]} · {device.lastActive}
          </Typography>
        </View>
      </View>
      {device.isCurrent ? (
        <Typography variant="badge" className="text-brand-success">
          This device
        </Typography>
      ) : onRemove ? (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Typography variant="badge" className="text-brand-error">
            Remove
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
});

type QuickActionButtonProps = {
  label: string;
  icon?: 'phone' | 'default';
  onPress: () => void;
  disabled?: boolean;
};

export const QuickActionButton = memo(function QuickActionButton({
  label,
  icon = 'default',
  onPress,
  disabled = false,
}: QuickActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        'flex-1 items-center rounded-2xl border border-brand-border bg-brand-white px-sm py-md',
        disabled && 'opacity-50',
      )}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : disabled ? 0.5 : 1 })}
    >
      {icon === 'phone' ? <PhoneIcon size={20} color={brandColors.primaryDark} /> : null}
      <Typography variant="badge" className="mt-xs text-center text-[11px] text-brand-heading">
        {label}
      </Typography>
    </Pressable>
  );
});
