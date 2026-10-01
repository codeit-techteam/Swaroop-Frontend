import { View } from 'react-native';

import { Typography } from '@/components';

type SupportReplyPreviewProps = {
  resolutionNote?: string;
  supportReply?: { body: string; senderName: string };
  awaitingReply?: boolean;
};

export function SupportReplyPreview({
  resolutionNote,
  supportReply,
  awaitingReply,
}: SupportReplyPreviewProps) {
  if (resolutionNote) {
    return (
      <View className="mt-sm rounded-xl border border-emerald-200 bg-emerald-50 px-md py-sm">
        <Typography variant="badge" className="text-[10px] uppercase text-emerald-800">
          Resolution from support
        </Typography>
        <Typography variant="legal" className="mt-xs text-emerald-900" numberOfLines={4}>
          {resolutionNote}
        </Typography>
      </View>
    );
  }
  if (!supportReply) return null;
  return (
    <View className="mt-sm rounded-xl border border-sky-200 bg-sky-50 px-md py-sm">
      <Typography variant="badge" className="text-[10px] uppercase text-sky-800">
        {awaitingReply ? 'Support needs your reply' : `Reply from ${supportReply.senderName}`}
      </Typography>
      <Typography variant="legal" className="mt-xs text-sky-900" numberOfLines={4}>
        {supportReply.body}
      </Typography>
    </View>
  );
}
