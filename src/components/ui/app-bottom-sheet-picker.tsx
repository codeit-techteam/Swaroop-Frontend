import { memo, useCallback } from 'react';

import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { cn } from '@/utils/cn';

type AppBottomSheetPickerProps = {
  title: string;
  items: readonly string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  visible: boolean;
  onClose: () => void;
};

export const AppBottomSheetPicker = memo(function AppBottomSheetPicker({
  title,
  items,
  selectedValue,
  onSelect,
  visible,
  onClose,
}: AppBottomSheetPickerProps) {
  const handleSelect = useCallback(
    (value: string) => {
      onSelect(value);
      onClose();
    },
    [onClose, onSelect],
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      key={title}
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        className="flex-1 items-center justify-end"
        style={{ backgroundColor: 'rgba(16, 52, 96, 0.52)' }}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={`Close ${title}`}
      >
        <Pressable
          className="max-h-[56%] w-full rounded-t-[28px] bg-brand-white px-xl pb-2xl pt-lg"
          onPress={(event) => event.stopPropagation()}
        >
          <View className="mb-md h-1.5 w-12 self-center rounded-full bg-brand-border" />
          <Typography variant="headingLeft" className="mb-md text-[20px]">
            {title}
          </Typography>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {items.length === 0 ? (
              <Typography variant="body" className="px-md py-md text-brand-muted">
                No options available
              </Typography>
            ) : (
              items.map((item) => {
                const selected = item === selectedValue;
                return (
                  <Pressable
                    key={`${title}-${item}`}
                    onPress={() => handleSelect(item)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={item}
                    className={cn(
                      'mb-sm rounded-2xl border px-md py-md',
                      selected
                        ? 'border-brand-primary bg-brand-primary-light'
                        : 'border-brand-border bg-brand-surface',
                    )}
                  >
                    <Typography
                      variant="body"
                      className={
                        selected ? 'font-semibold text-brand-primary' : 'text-brand-heading'
                      }
                    >
                      {item}
                    </Typography>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
});
