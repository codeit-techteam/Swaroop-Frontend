import { memo, useCallback, useEffect, useRef } from 'react';

import {
  Platform,
  Pressable,
  TextInput,
  View,
  type TextInputInstance,
  type TextStyle,
} from 'react-native';

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
      pointerEvents="none"
    >
      <Typography variant="headingLeft" className="text-[20px]">
        {digit}
      </Typography>
    </Animated.View>
  );
});

/** Full-size transparent input over the digit boxes — Android needs a real hit target to open IME. */
const overlayInputStyle: TextStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  opacity: 0.02,
  color: brandColors.heading,
  fontSize: 1,
  zIndex: 2,
};

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

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!autoFocus) return undefined;
    // Android 16 / Expo: focus after the screen transition settles.
    const delay = Platform.OS === 'android' ? 400 : 200;
    const timer = setTimeout(focusInput, delay);
    return () => clearTimeout(timer);
  }, [autoFocus, focusInput]);

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
        onPress={focusInput}
        className="relative w-full flex-row justify-between gap-sm"
        accessibilityRole="keyboardkey"
        accessibilityLabel="OTP input"
        accessibilityHint="Enter the 6-digit verification code"
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

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          onPressIn={focusInput}
          keyboardType="number-pad"
          inputMode="numeric"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          importantForAutofill="yes"
          maxLength={OTP_LENGTH}
          caretHidden
          showSoftInputOnFocus
          autoCorrect={false}
          autoCapitalize="none"
          blurOnSubmit={false}
          style={overlayInputStyle}
          accessibilityLabel="One-time password"
        />
      </Pressable>

      {error ? (
        <Typography variant="error" className="mt-sm">
          {error}
        </Typography>
      ) : null}
    </View>
  );
});
