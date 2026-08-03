import { memo, useMemo } from 'react';

import { Pressable, View } from 'react-native';

import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { Typography } from '@/components';
import type { RevenueFilterPeriod } from '@/seller/types/analytics';
import { cn } from '@/utils/cn';

const FILTER_OPTIONS: { id: RevenueFilterPeriod; label: string }[] = [
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '3m', label: '3 Months' },
  { id: '1y', label: '1 Year' },
];

const CHART_WIDTH = 320;
const CHART_HEIGHT = 140;
const CHART_PADDING = 12;

const buildPath = (values: number[]): string => {
  if (values.length === 0) {
    return '';
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = (CHART_WIDTH - CHART_PADDING * 2) / Math.max(values.length - 1, 1);

  const points = values.map((value, index) => {
    const x = CHART_PADDING + index * stepX;
    const normalized = (value - min) / range;
    const y = CHART_HEIGHT - CHART_PADDING - normalized * (CHART_HEIGHT - CHART_PADDING * 2);
    return { x, y };
  });

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    const prev = points[index - 1];
    const midX = (prev.x + point.x) / 2;
    return `${path} C ${midX} ${prev.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
  }, '');
};

const buildAreaPath = (linePath: string, values: number[]): string => {
  if (values.length === 0) {
    return '';
  }

  const stepX = (CHART_WIDTH - CHART_PADDING * 2) / Math.max(values.length - 1, 1);
  const lastX = CHART_PADDING + (values.length - 1) * stepX;
  const baseY = CHART_HEIGHT - CHART_PADDING;

  return `${linePath} L ${lastX} ${baseY} L ${CHART_PADDING} ${baseY} Z`;
};

type RevenueChartProps = {
  values: number[];
  selectedPeriod: RevenueFilterPeriod;
  onPeriodChange: (period: RevenueFilterPeriod) => void;
  chartKey: number;
};

export const RevenueChart = memo(function RevenueChart({
  values,
  selectedPeriod,
  onPeriodChange,
  chartKey,
}: RevenueChartProps) {
  const linePath = useMemo(() => buildPath(values), [values]);
  const areaPath = useMemo(() => buildAreaPath(linePath, values), [linePath, values]);

  const lastPoint = useMemo(() => {
    if (values.length === 0) {
      return null;
    }
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const stepX = (CHART_WIDTH - CHART_PADDING * 2) / Math.max(values.length - 1, 1);
    const index = values.length - 1;
    const x = CHART_PADDING + index * stepX;
    const normalized = (values[index] - min) / range;
    const y = CHART_HEIGHT - CHART_PADDING - normalized * (CHART_HEIGHT - CHART_PADDING * 2);
    return { x, y };
  }, [values]);

  return (
    <View className="rounded-2xl border border-brand-border bg-brand-white px-md py-md">
      <View className="flex-row items-center justify-between">
        <Typography variant="roleTitle" className="text-brand-heading">
          Revenue Graph
        </Typography>
        <Typography variant="legal" className="text-brand-body">
          ₹ Lakhs
        </Typography>
      </View>

      <View className="mt-md flex-row flex-wrap gap-xs">
        {FILTER_OPTIONS.map((option) => {
          const active = option.id === selectedPeriod;
          return (
            <Pressable
              key={option.id}
              onPress={() => onPeriodChange(option.id)}
              className={cn(
                'rounded-full px-md py-xs',
                active ? 'bg-[#0B4A8B]' : 'bg-brand-surface',
              )}
            >
              <Typography
                variant="badge"
                className={cn('text-[11px]', active ? 'text-brand-white' : 'text-brand-body')}
              >
                {option.label}
              </Typography>
            </Pressable>
          );
        })}
      </View>

      <Animated.View key={chartKey} entering={FadeIn.duration(450)} className="mt-md items-center">
        <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
          <Defs>
            <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#0B4A8B" stopOpacity="0.25" />
              <Stop offset="1" stopColor="#0B4A8B" stopOpacity="0.02" />
            </LinearGradient>
          </Defs>
          <Path d={areaPath} fill="url(#areaGradient)" />
          <Path d={linePath} stroke="#0B4A8B" strokeWidth={2.5} fill="none" />
          {lastPoint ? <Circle cx={lastPoint.x} cy={lastPoint.y} r={4} fill="#0B4A8B" /> : null}
        </Svg>
      </Animated.View>
    </View>
  );
});
