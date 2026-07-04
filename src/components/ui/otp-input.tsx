import { memo, useCallback, useEffect, useRef } from 'react';

import { Pressable, TextInput, View } from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

const OTP_LENGTH = 6;

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoFocus?: boolean;
  className?: string;
};

export const OtpInput = memo(function OtpInput({
  value,
  onChange,
  error,
  autoFocus = true,
  className,
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const focusScale = useSharedValue(1);
  const digits = value.padEnd(OTP_LENGTH, ' ').slice(0, OTP_LENGTH).split('');
  const activeIndex = Math.min(value.length, OTP_LENGTH - 1);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoFocus]);

  useEffect(() => {
    focusScale.value = withSequence(
      withTiming(1.06, { duration: 120 }),
      withTiming(1, { duration: 120 }),
    );
  }, [activeIndex, focusScale]);

  const handleChange = useCallback(
    (text: string) => {
      const sanitized = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
      onChange(sanitized);
    },
    [onChange],
  );

  const activeBoxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: focusScale.value }],
  }));

  return (
    <View className={cn('w-full items-center', className)}>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        className="w-full flex-row justify-between gap-sm"
        accessibilityRole="keyboardkey"
        accessibilityLabel="OTP input"
      >
        {digits.map((digit, index) => {
          const isActive = index === activeIndex && value.length < OTP_LENGTH;
          const isFilled = digit.trim().length > 0;
          const Box = isActive ? Animated.View : View;

          return (
            <Box
              key={`otp-${index}`}
              className={cn(
                'h-12 w-12 items-center justify-center rounded-md border-2 bg-brand-white',
                isActive || isFilled ? 'border-brand-primary' : 'border-brand-border',
                error && 'border-brand-error',
              )}
              style={isActive ? activeBoxStyle : undefined}
            >
              <Typography variant="headingLeft" className="text-[20px]">
                {digit.trim()}
              </Typography>
            </Box>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={OTP_LENGTH}
        caretHidden
        className="absolute h-px w-px opacity-0"
        style={{ color: brandColors.heading }}
      />

      {error ? (
        <Typography variant="error" className="mt-sm">
          {error}
        </Typography>
      ) : null}
    </View>
  );
});
