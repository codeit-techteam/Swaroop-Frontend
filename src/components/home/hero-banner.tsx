import { memo, useMemo } from 'react';

import { Pressable, View } from 'react-native';

import { Image } from 'expo-image';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { images } from '../../../assets';
import { Typography } from '@/components/ui/typography';
import {
  HERO_BANNER_HEIGHT,
  HERO_BANNER_NAVY_HEIGHT,
} from '@/constants/homeBanners';
import { ArrowRightIcon } from '@/icons/arrow-right';
import { brandColors } from '@/theme/colors';
import type { HomeBanner } from '@/types/home';
import { cn } from '@/utils/cn';

type HeroBannerProps = {
  banner: HomeBanner;
  width: number;
  onActionPress?: (banner: HomeBanner) => void;
  onSecondaryPress?: (banner: HomeBanner) => void;
  className?: string;
};

function supportingCopy(banner: HomeBanner): string {
  const subtitle = banner.subtitle?.trim() ?? '';
  const description = banner.description?.trim() ?? '';
  if (description) return description;
  return subtitle;
}

function resolveImageSource(banner: HomeBanner) {
  if (banner.imageSource) return banner.imageSource;
  if (banner.imageUrl?.trim()) return { uri: banner.imageUrl.trim() };
  return images.homeHeroBanner;
}

function hasRemoteOrLocalCreative(banner: HomeBanner): boolean {
  return Boolean(banner.imageSource || banner.imageUrl?.trim());
}

function isNavyEmphasis(banner: HomeBanner): boolean {
  if (banner.layoutVariant === 'NAVY_GRID') return true;
  if (banner.layoutVariant === 'IMAGE_OVERLAY') return false;
  return !hasRemoteOrLocalCreative(banner);
}

/** Left-weighted scrim so headline/CTA stay readable over industrial photography. */
function HeroScrim({
  width,
  height,
  stronger,
}: {
  width: number;
  height: number;
  stronger?: boolean;
}) {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
    >
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="heroLeft" x1="0" y1="0.5" x2="1" y2="0.5">
            <Stop offset="0%" stopColor="#071A33" stopOpacity={stronger ? 0.92 : 0.82} />
            <Stop offset="42%" stopColor="#0B2E59" stopOpacity={stronger ? 0.72 : 0.55} />
            <Stop offset="72%" stopColor="#0B2E59" stopOpacity={stronger ? 0.35 : 0.18} />
            <Stop offset="100%" stopColor="#0B2E59" stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id="heroBottom" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0%" stopColor="#071A33" stopOpacity={0} />
            <Stop offset="55%" stopColor="#071A33" stopOpacity={0.15} />
            <Stop offset="100%" stopColor="#071A33" stopOpacity={0.55} />
          </LinearGradient>
          <LinearGradient id="heroGlow" x1="0" y1="0" x2="0.35" y2="0.5">
            <Stop offset="0%" stopColor="rgba(40,120,255,0.28)" />
            <Stop offset="100%" stopColor="rgba(40,120,255,0)" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#heroLeft)" />
        <Rect x={0} y={0} width={width} height={height} fill="url(#heroBottom)" />
        <Rect x={0} y={0} width={width} height={height} fill="url(#heroGlow)" />
      </Svg>
    </View>
  );
}

function NavyGridOverlay({ width, height }: { width: number; height: number }) {
  const grid = 28;
  const lines = useMemo(() => {
    const vertical: number[] = [];
    const horizontal: number[] = [];
    for (let x = 0; x <= width; x += grid) vertical.push(x);
    for (let y = 0; y <= height; y += grid) horizontal.push(y);
    return { vertical, horizontal };
  }, [width, height]);

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.35 }}
    >
      <Svg width={width} height={height}>
        {lines.vertical.map((x) => (
          <Rect
            key={`v-${x}`}
            x={x}
            y={0}
            width={1}
            height={height}
            fill="rgba(255,255,255,0.12)"
          />
        ))}
        {lines.horizontal.map((y) => (
          <Rect
            key={`h-${y}`}
            x={0}
            y={y}
            width={width}
            height={1}
            fill="rgba(255,255,255,0.12)"
          />
        ))}
      </Svg>
    </View>
  );
}

export const HeroBanner = memo(function HeroBanner({
  banner,
  width,
  onActionPress,
  onSecondaryPress,
  className,
}: HeroBannerProps) {
  const navyEmphasis = isNavyEmphasis(banner);
  const height = navyEmphasis ? HERO_BANNER_NAVY_HEIGHT : HERO_BANNER_HEIGHT;
  const body = supportingCopy(banner);
  const hasSecondary =
    Boolean(banner.secondaryButtonLabel?.trim()) && Boolean(onSecondaryPress);
  const imageSource = resolveImageSource(banner);

  return (
    <View
      className={cn('overflow-hidden rounded-2xl bg-brand-navy', className)}
      style={{
        width,
        height,
        shadowColor: brandColors.navy,
        shadowOpacity: 0.22,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 5,
      }}
      accessibilityRole="summary"
      accessibilityLabel={`${banner.badge}. ${banner.title}`}
    >
      <Image
        source={imageSource}
        style={{ position: 'absolute', width, height }}
        contentFit="cover"
        contentPosition="right center"
        transition={220}
        cachePolicy="memory-disk"
        recyclingKey={banner.id}
        accessibilityIgnoresInvertColors
      />

      <HeroScrim width={width} height={height} stronger={navyEmphasis} />
      {navyEmphasis ? <NavyGridOverlay width={width} height={height} /> : null}

      <View className="absolute inset-0 justify-between px-5 py-4">
        <View style={{ maxWidth: width * 0.72 }}>
          {banner.badge ? (
            <Typography
              variant="badge"
              className="text-[10px] font-bold uppercase tracking-[1.6px] text-brand-white/78"
              numberOfLines={1}
            >
              {banner.badge}
            </Typography>
          ) : null}

          <Typography
            variant="headingLeft"
            className="mt-2 text-[21px] font-bold leading-[27px] text-brand-white"
            numberOfLines={2}
          >
            {banner.title}
          </Typography>

          {body ? (
            <Typography
              variant="caption"
              className="mt-1.5 font-sans text-[12.5px] leading-[17px] normal-case tracking-normal text-brand-white/88"
              numberOfLines={2}
            >
              {body}
            </Typography>
          ) : null}
        </View>

        <View className="mt-3 flex-row flex-wrap items-center gap-2">
          <Pressable
            onPress={() => onActionPress?.(banner)}
            accessibilityRole="button"
            accessibilityLabel={banner.buttonLabel}
            hitSlop={6}
            className="flex-row items-center gap-1.5 self-start rounded-full bg-brand-white px-4 py-2.5"
            style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
          >
            <Typography
              variant="badge"
              className="text-[11px] font-bold tracking-[0.45px] text-brand-navy"
            >
              {banner.buttonLabel}
            </Typography>
            <ArrowRightIcon size={14} color={brandColors.navy} />
          </Pressable>

          {hasSecondary ? (
            <Pressable
              onPress={() => onSecondaryPress?.(banner)}
              accessibilityRole="button"
              accessibilityLabel={banner.secondaryButtonLabel ?? undefined}
              hitSlop={6}
              className="self-start rounded-full border border-white/40 bg-white/10 px-4 py-2.5"
              style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
            >
              <Typography
                variant="badge"
                className="text-[11px] font-semibold tracking-[0.4px] text-brand-white"
              >
                {banner.secondaryButtonLabel}
              </Typography>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
});
