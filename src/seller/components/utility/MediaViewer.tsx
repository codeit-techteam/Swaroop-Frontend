import { memo, useState } from 'react';

import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components';
import { BackArrowIcon, DownloadIcon, DocumentFileIcon } from '@/icons';
import { brandColors } from '@/theme/colors';

type MediaViewerProps = {
  visible: boolean;
  title: string;
  fileType: 'pdf' | 'image';
  uri: string;
  onClose: () => void;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const MediaViewer = memo(function MediaViewer({
  visible,
  title,
  fileType,
  uri,
  onClose,
}: MediaViewerProps) {
  const insets = useSafeAreaInsets();
  const [scale] = useState(1);

  const handleShare = async () => {
    try {
      await Share.share({ message: `${title}\n${uri}`, title });
    } catch {
      // user cancelled
    }
  };

  const handleDownload = async () => {
    try {
      await Share.share({ message: `Download: ${title}`, title: 'Download Document' });
    } catch {
      // user cancelled
    }
  };

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-brand-navy" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-lg py-md">
          <Pressable onPress={onClose} hitSlop={10} className="h-10 w-10 items-center justify-center">
            <BackArrowIcon color={brandColors.white} />
          </Pressable>
          <Typography variant="roleTitle" className="flex-1 text-center text-brand-white" numberOfLines={1}>
            {title}
          </Typography>
          <View className="flex-row gap-sm">
            <Pressable onPress={handleShare} className="h-10 w-10 items-center justify-center">
              <Typography variant="link" className="text-brand-white">
                Share
              </Typography>
            </Pressable>
            <Pressable onPress={handleDownload} className="h-10 w-10 items-center justify-center">
              <DownloadIcon size={20} color={brandColors.white} />
            </Pressable>
          </View>
        </View>

        {fileType === 'image' ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
            maximumZoomScale={3}
            minimumZoomScale={1}
            centerContent
          >
            <Image
              source={{ uri }}
              style={{
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT * 0.7,
                transform: [{ scale }],
              }}
              resizeMode="contain"
            />
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center px-xl">
            <View className="w-full items-center rounded-[24px] bg-brand-white p-2xl">
              <View className="h-20 w-20 items-center justify-center rounded-2xl bg-brand-primary-light">
                <DocumentFileIcon size={36} color={brandColors.primaryDark} />
              </View>
              <Typography variant="roleTitle" className="mt-lg text-center">
                {title}
              </Typography>
              <Typography variant="subheading" className="mt-sm text-center text-brand-body">
                PDF Preview
              </Typography>
              <Typography variant="legal" className="mt-md text-center text-brand-footer">
                Full PDF rendering will be available with backend integration. Use download or share to access the file.
              </Typography>
              <Pressable
                onPress={handleDownload}
                className="mt-xl flex-row items-center gap-sm rounded-2xl bg-brand-primary px-xl py-md"
              >
                <DownloadIcon size={18} color={brandColors.white} />
                <Typography variant="button" className="text-brand-white">
                  Download PDF
                </Typography>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
});
