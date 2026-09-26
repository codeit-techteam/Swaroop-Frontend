import { memo, useCallback, useEffect, useRef, useState } from 'react';

import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
  useWindowDimensions,
} from 'react-native';

import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

import { BannerIndicator } from '@/components/home/banner-indicator';
import { HeroBanner } from '@/components/home/hero-banner';
import {
  HERO_AUTO_SLIDE_MS,
  HERO_BANNER_HEIGHT,
  HERO_BANNER_NAVY_HEIGHT,
} from '@/constants/homeBanners';
import { spacing } from '@/theme/spacing';
import type { HomeBanner } from '@/types/home';
import { cn } from '@/utils/cn';

type HeroCarouselProps = {
  banners?: HomeBanner[];
  onActionPress?: (banner: HomeBanner) => void;
  onSecondaryPress?: (banner: HomeBanner) => void;
  onImpression?: (banner: HomeBanner) => void;
  className?: string;
};

function bannerHeight(banner: HomeBanner | undefined): number {
  if (!banner) return HERO_BANNER_HEIGHT;
  if (banner.layoutVariant === 'NAVY_GRID') return HERO_BANNER_NAVY_HEIGHT;
  if (banner.layoutVariant === 'IMAGE_OVERLAY') return HERO_BANNER_HEIGHT;
  return banner.imageUrl ? HERO_BANNER_HEIGHT : HERO_BANNER_NAVY_HEIGHT;
}

export const HeroCarousel = memo(function HeroCarousel({
  banners = [],
  onActionPress,
  onSecondaryPress,
  onImpression,
  className,
}: HeroCarouselProps) {
  const { width: screenWidth } = useWindowDimensions();
  const horizontalPadding = spacing.lg;
  const bannerWidth = screenWidth - horizontalPadding * 2;
  const listRef = useRef<Animated.FlatList<HomeBanner>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const scrollX = useSharedValue(0);
  const isInteracting = useRef(false);
  const activeBanner = banners[activeIndex];
  const trackHeight = bannerHeight(activeBanner);

  const scrollToIndex = useCallback(
    (index: number, animated = true) => {
      listRef.current?.scrollToOffset({
        offset: index * screenWidth,
        animated,
      });
    },
    [screenWidth],
  );

  useEffect(() => {
    const visible = banners[activeIndex];
    if (visible) onImpression?.(visible);
  }, [activeIndex, banners, onImpression]);

  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      if (isInteracting.current) {
        return;
      }

      const nextIndex = (activeIndexRef.current + 1) % banners.length;
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      scrollToIndex(nextIndex, true);
    }, HERO_AUTO_SLIDE_MS);

    return () => clearInterval(timer);
  }, [banners.length, scrollToIndex]);

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / screenWidth);
      const clamped = Math.max(0, Math.min(index, banners.length - 1));
      activeIndexRef.current = clamped;
      setActiveIndex(clamped);
      isInteracting.current = false;
    },
    [banners.length, screenWidth],
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const renderItem = useCallback(
    ({ item }: { item: HomeBanner }) => (
      <View style={{ width: screenWidth }} className="items-center px-0">
        <HeroBanner
          banner={item}
          width={bannerWidth}
          onActionPress={onActionPress}
          onSecondaryPress={onSecondaryPress}
        />
      </View>
    ),
    [bannerWidth, onActionPress, onSecondaryPress, screenWidth],
  );

  const keyExtractor = useCallback((item: HomeBanner) => item.id, []);

  if (!banners.length) return null;

  return (
    <View className={cn('mt-md', className)} style={{ minHeight: trackHeight }}>
      <Animated.FlatList
        ref={listRef}
        data={banners}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        bounces={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          isInteracting.current = true;
        }}
        onMomentumScrollEnd={handleMomentumEnd}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
      />

      {banners.length > 1 ? (
        <View
          className="absolute bottom-3 right-7 rounded-full bg-black/25 px-2 py-1.5"
          pointerEvents="none"
        >
          <BannerIndicator total={banners.length} activeIndex={activeIndex} />
        </View>
      ) : null}
    </View>
  );
});
