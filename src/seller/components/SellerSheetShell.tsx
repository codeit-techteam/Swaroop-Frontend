import { memo, type ReactNode } from 'react';

import { Modal, Pressable, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { elevation } from '@/theme/shadows';

type SellerSheetShellProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

export const SellerSheetShell = memo(function SellerSheetShell({
  visible,
  onClose,
  children,
}: SellerSheetShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(16, 52, 96, 0.48)' }}>
        <Pressable
          className="flex-1"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss sheet"
        />
        <View
          className="max-h-[88%] rounded-t-[28px] bg-brand-white px-lg pt-md"
          style={[elevation.xl, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}
        >
          <View className="mb-md h-1.5 w-12 self-center rounded-full bg-brand-border" />
          {children}
        </View>
      </View>
    </Modal>
  );
});
