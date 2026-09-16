import { memo, useCallback, useState } from 'react';

import { Modal, Platform, Pressable, View } from 'react-native';

import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { Typography } from '@/components/ui/typography';
import { ChevronDownIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';
import { dayjs, formatDate } from '@/utils/date';

type DatePickerFieldProps = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
  containerClassName?: string;
};

export const DatePickerField = memo(function DatePickerField({
  label,
  value,
  onChange,
  error,
  containerClassName,
}: DatePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  const displayValue = formatDate(value, 'MM/DD/YYYY');

  const openPicker = useCallback(() => {
    setTempDate(value);
    setShowPicker(true);
  }, [value]);

  const closePicker = useCallback(() => {
    setShowPicker(false);
  }, []);

  const handleChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowPicker(false);
        if (event.type === 'set' && selectedDate) {
          onChange(selectedDate);
        }
        return;
      }

      if (selectedDate) {
        setTempDate(selectedDate);
      }
    },
    [onChange],
  );

  const handleConfirm = useCallback(() => {
    onChange(tempDate);
    setShowPicker(false);
  }, [onChange, tempDate]);

  return (
    <View className={cn('w-full', containerClassName)}>
      <Typography variant="fieldLabel" className="mb-sm text-brand-body">
        {label}
      </Typography>

      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${displayValue}`}
        className={cn(
          'min-h-[48px] w-full flex-row items-center justify-between rounded-md border bg-brand-white px-md',
          error ? 'border-brand-error' : 'border-brand-border',
        )}
      >
        <Typography variant="body" className="text-[15px] text-brand-heading">
          {displayValue}
        </Typography>
        <ChevronDownIcon color={brandColors.muted} />
      </Pressable>

      {error ? (
        <Typography variant="error" className="mt-xs">
          {error}
        </Typography>
      ) : null}

      {Platform.OS === 'ios' && showPicker ? (
        <Modal visible transparent animationType="fade" onRequestClose={closePicker}>
          <Pressable
            className="flex-1 justify-end"
            style={{ backgroundColor: 'rgba(16, 52, 96, 0.52)' }}
            onPress={closePicker}
            accessibilityRole="button"
            accessibilityLabel="Close date picker"
          >
            <Pressable
              className="rounded-t-[28px] bg-brand-white px-lg pb-2xl pt-lg"
              onPress={(event) => event.stopPropagation()}
            >
              <View className="mb-md flex-row items-center justify-between">
                <Typography variant="headingLeft" className="text-[18px]">
                  Select Date
                </Typography>
                <Pressable
                  onPress={handleConfirm}
                  accessibilityRole="button"
                  accessibilityLabel="Confirm date"
                  hitSlop={8}
                >
                  <Typography variant="link" className="font-bold">
                    Done
                  </Typography>
                </Pressable>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                maximumDate={dayjs().endOf('day').toDate()}
                onChange={handleChange}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      {Platform.OS === 'android' && showPicker ? (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          maximumDate={dayjs().endOf('day').toDate()}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
});
