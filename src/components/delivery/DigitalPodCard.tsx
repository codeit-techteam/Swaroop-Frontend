import { memo, useState } from 'react';

import { Modal, Pressable, View } from 'react-native';

import { SecondaryButton, Typography } from '@/components/ui';
import {
  DELIVERY_COMPLETED_COPY,
  formatDeliveryDate,
  formatDeliveryTime,
} from '@/constants/deliveryCompleted';
import type { DigitalPodState } from '@/types/delivery';
import { elevation } from '@/theme/shadows';
import { cn } from '@/utils/cn';

type DigitalPodCardProps = {
  pod: DigitalPodState;
  className?: string;
};

export const DigitalPodCard = memo(function DigitalPodCard({
  pod,
  className,
}: DigitalPodCardProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <View
        className={cn('rounded-2xl border border-brand-border bg-brand-white p-lg', className)}
        style={elevation.sm}
      >
        <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
          {DELIVERY_COMPLETED_COPY.podHeading}
        </Typography>

        <View className="mt-lg" style={{ gap: 12 }}>
          <View>
            <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
              {DELIVERY_COMPLETED_COPY.podIdLabel}
            </Typography>
            <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
              {pod.podId}
            </Typography>
          </View>

          <View>
            <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
              {DELIVERY_COMPLETED_COPY.otpVerifiedLabel}
            </Typography>
            <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-success">
              {pod.otpVerified ? 'Yes' : 'No'}
            </Typography>
          </View>

          <View>
            <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
              {DELIVERY_COMPLETED_COPY.timestampLabel}
            </Typography>
            <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
              {formatDeliveryDate(pod.deliveryTimestamp)} ·{' '}
              {formatDeliveryTime(pod.deliveryTimestamp)}
            </Typography>
          </View>

          <View>
            <Typography variant="fieldLabel" className="text-[10px] text-brand-muted">
              {DELIVERY_COMPLETED_COPY.verificationLabel}
            </Typography>
            <View className="mt-sm self-start rounded-full bg-brand-success-light px-sm py-xs">
              <Typography variant="badge" className="text-[10px] text-brand-success">
                {DELIVERY_COMPLETED_COPY.verifiedLabel}
              </Typography>
            </View>
          </View>
        </View>

        <SecondaryButton
          label={DELIVERY_COMPLETED_COPY.viewPodLabel}
          onPress={() => setModalVisible(true)}
          variant="outline"
          className="mt-lg"
        />
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/70 px-lg"
          onPress={() => setModalVisible(false)}
        >
          <Pressable onPress={(event) => event.stopPropagation()} className="w-full">
            <View className="rounded-2xl bg-brand-white p-lg">
              <Typography variant="headingLeft" className="text-[18px] text-brand-heading">
                {DELIVERY_COMPLETED_COPY.podModalTitle}
              </Typography>
              <Typography
                variant="subheadingLeft"
                className="mt-md text-[14px] leading-[22px] text-brand-body"
              >
                {DELIVERY_COMPLETED_COPY.podModalPlaceholder}
              </Typography>
              <Typography variant="roleTitle" className="mt-md text-[13px] text-brand-muted">
                {pod.podId}
              </Typography>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
});
