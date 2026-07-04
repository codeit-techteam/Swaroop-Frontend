import { memo, useCallback, useState } from 'react';

import { Pressable, View } from 'react-native';

import * as Clipboard from 'expo-clipboard';

import Toast from 'react-native-toast-message';

import { Typography } from '@/components/ui/typography';
import { CopyIcon } from '@/icons';
import { cn } from '@/utils/cn';

type ReferenceCardProps = {
  referenceId: string;
  className?: string;
};

export const ReferenceCard = memo(function ReferenceCard({
  referenceId,
  className,
}: ReferenceCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(referenceId);
    setCopied(true);
    Toast.show({
      type: 'success',
      text1: 'Copied',
      text2: `Reference ID ${referenceId} copied`,
      visibilityTime: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  }, [referenceId]);

  return (
    <View
      className={cn(
        'w-full flex-row items-center justify-between rounded-lg border border-brand-border bg-brand-white px-lg py-lg',
        className,
      )}
    >
      <View className="flex-1">
        <Typography variant="fieldLabel">Reference ID</Typography>
        <Typography variant="headingLeft" className="mt-xs text-[18px] text-brand-primary">
          {referenceId}
        </Typography>
      </View>
      <Pressable
        onPress={handleCopy}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Copy reference ID"
        className="h-10 w-10 items-center justify-center rounded-md bg-brand-primary-light"
      >
        <CopyIcon />
      </Pressable>
      {copied ? (
        <Typography variant="success" className="absolute right-14 top-3 text-[11px]">
          Copied
        </Typography>
      ) : null}
    </View>
  );
});
