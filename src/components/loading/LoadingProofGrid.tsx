import { memo, useState } from 'react';

import { Modal, Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { LOADING_WORKFLOW_COPY } from '@/constants/loadingWorkflow';
import type { LoadingProofItem, LoadingProofItemId } from '@/types/loading';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type LoadingProofGridProps = {
  items: LoadingProofItem[];
  className?: string;
};

const PROOF_PLACEHOLDER_COLORS: Record<LoadingProofItemId, string> = {
  loading_photo: '#4A5568',
  weight_slip: '#718096',
  truck_rear: '#A0AEC0',
  seal_photo: '#2D3748',
};

const ProofPlaceholder = memo(function ProofPlaceholder({
  itemId,
  label,
}: {
  itemId: LoadingProofItemId;
  label: string;
}) {
  return (
    <View
      className="flex-1 overflow-hidden rounded-xl"
      style={{ backgroundColor: PROOF_PLACEHOLDER_COLORS[itemId], minHeight: 120 }}
    >
      <View className="flex-1 items-center justify-center px-sm">
        <View className="h-10 w-10 rounded-full border-2 border-white/30" />
        <View className="mt-sm h-1 w-12 rounded bg-white/20" />
        <View className="mt-xs h-1 w-8 rounded bg-white/15" />
      </View>
      <View className="absolute bottom-0 left-0 right-0 bg-black/45 px-sm py-xs">
        <Typography variant="badge" className="text-[10px] text-brand-white">
          {label}
        </Typography>
      </View>
    </View>
  );
});

export const LoadingProofGrid = memo(function LoadingProofGrid({
  items,
  className,
}: LoadingProofGridProps) {
  const [selectedItem, setSelectedItem] = useState<LoadingProofItem | null>(null);

  const rows: LoadingProofItem[][] = [];
  for (let index = 0; index < items.length; index += 2) {
    rows.push(items.slice(index, index + 2));
  }

  return (
    <>
      <View
        className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
        style={elevation.sm}
      >
        <Typography variant="roleTitle" className="mb-md text-[15px] text-brand-heading">
          {LOADING_WORKFLOW_COPY.completed.proofHeading}
        </Typography>

        <View style={{ gap: 12 }}>
          {rows.map((row) => (
            <View
              key={row.map((item) => item.id).join('-')}
              className="flex-row"
              style={{ gap: 12 }}
            >
              {row.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedItem(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`View ${item.label}`}
                  className="flex-1"
                >
                  <ProofPlaceholder itemId={item.id} label={item.label} />
                </Pressable>
              ))}
              {row.length === 1 ? <View className="flex-1" /> : null}
            </View>
          ))}
        </View>
      </View>

      <Modal
        visible={selectedItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <Pressable
          className="flex-1 items-center justify-center px-lg"
          style={{ backgroundColor: 'rgba(16, 52, 96, 0.72)' }}
          onPress={() => setSelectedItem(null)}
        >
          {selectedItem ? (
            <Pressable onPress={(event) => event.stopPropagation()} className="w-full">
              <View className="overflow-hidden rounded-2xl">
                <ProofPlaceholder itemId={selectedItem.id} label={selectedItem.label} />
              </View>
              <Typography
                variant="roleTitle"
                className="mt-md text-center text-[16px] text-brand-white"
              >
                {selectedItem.label}
              </Typography>
              <Typography
                variant="subheadingLeft"
                className="mt-sm text-center text-[13px] text-brand-white/80"
              >
                Tap anywhere to close
              </Typography>
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
});
