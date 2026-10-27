import { memo, useCallback, useEffect, useRef } from 'react';

import { Pressable, TextInput, View, type TextInputInstance } from 'react-native';

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

type OtpBoxProps = {
  digit: string;
  isActive: boolean;
  isFilled: boolean;
  hasError: boolean;
};

/**
 * Each cell is always the same `Animated.View` and owns its shared value, so the
 * active cell never swaps component type (unmount/remount) while a Reanimated
 * `withSequence` is still writing to it — the source of
 * "synchronouslyUpdateUIProps failed for tag …" (N-04).
 */
const OtpBox = memo(function OtpBox({ digit, isActive, isFilled, hasError }: OtpBoxProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!isActive) {
      scale.value = withTiming(1, { duration: 80 });
      return;
    }
    scale.value = withSequence(
      withTiming(1.06, { duration: 120 }),
      withTiming(1, { duration: 120 }),
    );
  }, [isActive, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      className={cn(
        'h-12 w-12 items-center justify-center rounded-md border-2 bg-brand-white',
        isActive || isFilled ? 'border-brand-primary' : 'border-brand-border',
        hasError && 'border-brand-error',
      )}
      style={animatedStyle}
    >
      <Typography variant="headingLeft" className="text-[20px]">
        {digit}
      </Typography>
    </Animated.View>
  );
});

export const OtpInput = memo(function OtpInput({
  value,
  onChange,
  error,
  autoFocus = true,
  className,
}: OtpInputProps) {
  const inputRef = useRef<TextInputInstance>(null);
  const digits = value.padEnd(OTP_LENGTH, ' ').slice(0, OTP_LENGTH).split('');
  const activeIndex = Math.min(value.length, OTP_LENGTH - 1);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoFocus]);

  const handleChange = useCallback(
    (text: string) => {
      const sanitized = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
      onChange(sanitized);
    },
    [onChange],
  );

  return (
    <View className={cn('w-full items-center', className)}>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        className="w-full flex-row justify-between gap-sm"
        accessibilityRole="keyboardkey"
        accessibilityLabel="OTP input"
      >
        {digits.map((digit, index) => (
          <OtpBox
            key={`otp-${index}`}
            digit={digit.trim()}
            isActive={index === activeIndex && value.length < OTP_LENGTH}
            isFilled={digit.trim().length > 0}
            hasError={Boolean(error)}
          />
        ))}
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
