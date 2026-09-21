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
import { HERO_AUTO_SLIDE_MS } from '@/constants/homeBanners';
import { spacing } from '@/theme/spacing';
import type { HomeBanner } from '@/types/home';
import { cn } from '@/utils/cn';

type HeroCarouselProps = {
  banners?: HomeBanner[];
  onActionPress?: (banner: HomeBanner) => void;
  className?: string;
};

export const HeroCarousel = memo(function HeroCarousel({
  banners = [],
  onActionPress,
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
      <View style={{ width: screenWidth }} className="items-center">
        <HeroBanner banner={item} width={bannerWidth} onActionPress={onActionPress} />
      </View>
    ),
    [bannerWidth, onActionPress, screenWidth],
  );

  const keyExtractor = useCallback((item: HomeBanner) => item.id, []);

  return (
    <View className={cn('mt-md', className)}>
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

      <View className="absolute bottom-md right-2xl">
        <BannerIndicator total={banners.length} activeIndex={activeIndex} />
      </View>
    </View>
  );
});
