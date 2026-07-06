import { memo, useCallback } from 'react';

import { Pressable, View } from 'react-native';

import { useRouter } from 'expo-router';

import Toast from 'react-native-toast-message';

import { AppHeader, ScreenWrapper, Typography } from '@/components';
import { useProfile } from '@/hooks/useProfile';
import { DownloadIcon } from '@/icons';
import { brandColors } from '@/theme/colors';

export const TaxDocumentsScreen = memo(function TaxDocumentsScreen() {
  const router = useRouter();
  const { profile } = useProfile();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleDownload = useCallback((title: string) => {
    Toast.show({
      type: 'info',
      text1: 'Download',
      text2: `${title} download will be available soon.`,
      visibilityTime: 2000,
    });
  }, []);

  return (
    <ScreenWrapper scrollable className="bg-brand-background" contentClassName="pb-xl">
      <AppHeader variant="back" title="Tax Documents" onBack={handleBack} />

      <View className="mt-lg gap-md">
        {profile.taxDocuments.map((document) => (
          <View
            key={document.id}
            className="flex-row items-center justify-between rounded-2xl border border-brand-border bg-brand-white p-lg"
          >
            <View className="mr-md flex-1">
              <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
                {document.title}
              </Typography>
              <Typography
                variant="caption"
                className="mt-xs font-sans normal-case tracking-normal text-brand-muted"
              >
                {document.subtitle}
              </Typography>
            </View>

            <Pressable
              onPress={() => handleDownload(document.title)}
              accessibilityRole="button"
              accessibilityLabel={`Download ${document.title}`}
              className="h-10 w-10 items-center justify-center rounded-lg bg-brand-primary-tint"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <DownloadIcon color={brandColors.primary} />
            </Pressable>
          </View>
        ))}
      </View>
    </ScreenWrapper>
  );
});
