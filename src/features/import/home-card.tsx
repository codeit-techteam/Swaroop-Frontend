import { type ComponentProps, memo, useCallback, useRef, useState } from 'react';

import { Pressable, View } from 'react-native';

import { type Href, useFocusEffect, useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { SectionHeader } from '@/components/home/section-header';
import { Typography } from '@/components/ui/typography';
import { fetchImportConfig, fetchImportSummary } from '@/features/import/api';
import { IMPORT_MODES, type ImportMode } from '@/features/import/config';
import type { ImportSummary } from '@/features/import/types';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

const ATTENTION = '#FBBF24';

/** Listing statuses that are visible to the other side of the market. */
const LIVE_STATUSES = ['PUBLISHED', 'MATCHING', 'OFFER_RECEIVED', 'NEGOTIATION', 'MATCHED'];

type IconName = ComponentProps<typeof Ionicons>['name'];
type SideSummary = NonNullable<ImportSummary['buy']>;
type CardState = { status: 'loading' | 'ready' | 'unavailable'; side?: SideSummary };

type ModeContent = {
  badge: string;
  title: string;
  body: string;
  features: { icon: IconName; label: string }[];
  steps: string[];
  primary: { label: string; icon: IconName };
  secondary: { label: string; icon: IconName };
  liveLabel: string;
};

const CONTENT: Record<ImportMode, ModeContent> = {
  customer: {
    badge: 'Global sourcing',
    title: 'Import polymers directly from global sellers',
    body: 'Post what you need with Incoterm, ports and shipment window. Verified sellers send offers, and both sides stay anonymous until the deal is confirmed.',
    features: [
      { icon: 'eye-off-outline', label: 'Blind negotiation' },
      { icon: 'boat-outline', label: 'CFR · CIF · FOB' },
      { icon: 'flash-outline', label: 'Smart matching' },
    ],
    steps: ['Post a buy request', 'Receive seller offers', 'Negotiate & confirm'],
    primary: { label: 'Post buy request', icon: 'add-circle' },
    secondary: { label: 'Browse offers', icon: 'search' },
    liveLabel: 'Live requests',
  },
  seller: {
    badge: 'Export & import desk',
    title: 'Sell import cargo to verified Indian buyers',
    body: 'List material on the water or at origin with Incoterm, ports and shipment window. Matched buyers negotiate blind until the deal is confirmed.',
    features: [
      { icon: 'eye-off-outline', label: 'Blind negotiation' },
      { icon: 'boat-outline', label: 'CFR · CIF · FOB' },
      { icon: 'people-outline', label: 'Matched buyers' },
    ],
    steps: ['Post a sell offer', 'Get matched buy requests', 'Negotiate & confirm'],
    primary: { label: 'Post sell offer', icon: 'add-circle' },
    secondary: { label: 'Buy requests', icon: 'search' },
    liveLabel: 'Live offers',
  },
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

const sumStatuses = (listings: Record<string, number> | undefined, statuses: string[]) =>
  statuses.reduce((total, status) => total + (listings?.[status] ?? 0), 0);

/** Gradient backdrop with a faint globe and a dashed sea-route arc. */
const CardBackdrop = memo(function CardBackdrop() {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="importCardBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#0B2545" />
            <Stop offset="55%" stopColor={brandColors.navy} />
            <Stop offset="100%" stopColor={brandColors.cardBlueDark} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={100} height={100} fill="url(#importCardBg)" />
      </Svg>
      <Svg
        width={190}
        height={190}
        viewBox="0 0 190 190"
        style={{ position: 'absolute', top: -38, right: -46 }}
      >
        <Circle
          cx={95}
          cy={95}
          r={78}
          stroke="#FFFFFF"
          strokeOpacity={0.14}
          strokeWidth={1.2}
          fill="none"
        />
        <Ellipse
          cx={95}
          cy={95}
          rx={34}
          ry={78}
          stroke="#FFFFFF"
          strokeOpacity={0.1}
          strokeWidth={1}
          fill="none"
        />
        <Ellipse
          cx={95}
          cy={95}
          rx={62}
          ry={78}
          stroke="#FFFFFF"
          strokeOpacity={0.08}
          strokeWidth={1}
          fill="none"
        />
        <Path
          d="M17 95 H173 M27 58 H163 M27 132 H163"
          stroke="#FFFFFF"
          strokeOpacity={0.08}
          strokeWidth={1}
        />
        <Path
          d="M40 150 Q95 40 160 70"
          stroke={ATTENTION}
          strokeOpacity={0.55}
          strokeWidth={1.6}
          strokeDasharray="4 5"
          fill="none"
        />
        <Circle cx={40} cy={150} r={3.5} fill={ATTENTION} fillOpacity={0.8} />
        <Circle cx={160} cy={70} r={3.5} fill="#FFFFFF" fillOpacity={0.85} />
      </Svg>
    </View>
  );
});

type StatTileProps = {
  label: string;
  value: number | null;
  highlight?: boolean;
  onPress: () => void;
};

const StatTile = memo(function StatTile({ label, value, highlight, onPress }: StatTileProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={value == null ? label : `${label}: ${value}`}
      className="flex-1 rounded-xl px-sm py-sm"
      style={({ pressed }) => ({
        backgroundColor: highlight ? 'rgba(251, 191, 36, 0.16)' : 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: highlight ? 'rgba(251, 191, 36, 0.45)' : 'rgba(255, 255, 255, 0.12)',
        opacity: pressed ? 0.75 : 1,
      })}
    >
      {value == null ? (
        <View className="h-[26px] w-8 rounded-md bg-white/15" />
      ) : (
        <Typography
          variant="headingLeft"
          className="text-[22px] leading-[26px]"
          style={{ color: highlight ? ATTENTION : '#FFFFFF' }}
        >
          {value}
        </Typography>
      )}
      <Typography
        variant="roleDescription"
        className="mt-xs text-left text-[11px] leading-[14px] text-brand-white/75"
        numberOfLines={1}
      >
        {label}
      </Typography>
    </Pressable>
  );
});

type ImportTradingHomeSectionProps = {
  mode?: ImportMode;
  className?: string;
  /** `false` when the parent screen already applies horizontal padding. */
  inset?: boolean;
  /** Change to force a refetch (e.g. pull-to-refresh on the host screen). */
  refreshKey?: number;
};

/**
 * Home entry point for Import Trading. Counts come from GET /import/summary for
 * the signed-in party; the section is hidden when the feature is switched off.
 */
export function ImportTradingHomeSection({
  mode = 'customer',
  className,
  inset = true,
  refreshKey = 0,
}: ImportTradingHomeSectionProps) {
  const router = useRouter();
  const cfg = IMPORT_MODES[mode];
  const content = CONTENT[mode];
  const [state, setState] = useState<CardState>({ status: 'loading' });
  const requestRef = useRef(0);

  const load = useCallback(async () => {
    const request = ++requestRef.current;
    try {
      const config = await fetchImportConfig();
      if (request !== requestRef.current) return;
      if (!config.enabled) {
        setState({ status: 'unavailable' });
        return;
      }
      const summary = await fetchImportSummary();
      if (request !== requestRef.current) return;
      setState({
        status: 'ready',
        side: cfg.ownSide === 'BUY' ? summary.buy : summary.sell,
      });
    } catch {
      // The card still works without counts; the hub surfaces load errors.
      if (request === requestRef.current) {
        setState((prev) => ({ status: 'ready', side: prev.side }));
      }
    }
  }, [cfg.ownSide]);

  useFocusEffect(
    useCallback(() => {
      void refreshKey;
      void load();
      return () => {
        requestRef.current += 1;
      };
    }, [load, refreshKey]),
  );

  const go = useCallback((route: string) => router.push(route as Href), [router]);

  if (state.status === 'unavailable') return null;

  const side = state.side;
  const countsKnown = state.status === 'ready' && side != null;
  const liveListings = sumStatuses(side?.listings, LIVE_STATUSES);
  const drafts = side?.listings?.DRAFT ?? 0;
  const openNegotiations = side?.openNegotiations ?? 0;
  const pendingDeals = side?.pendingDeals ?? 0;
  const totalListings = Object.values(side?.listings ?? {}).reduce((a, b) => a + b, 0);
  const hasActivity = totalListings > 0 || openNegotiations > 0 || pendingDeals > 0;
  const showStats = state.status === 'loading' || hasActivity;

  return (
    <View className={className}>
      {inset ? (
        <SectionHeader
          title="Import Trading"
          actionLabel="VIEW ALL"
          onActionPress={() => go(cfg.routes.hub)}
        />
      ) : (
        <View className="flex-row items-center justify-between">
          <Typography variant="roleTitle" className="text-[15px]">
            Import Trading
          </Typography>
          <Pressable
            onPress={() => go(cfg.routes.hub)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Open Import Trading"
          >
            <Typography variant="link" className="text-[13px]">
              View all
            </Typography>
          </Pressable>
        </View>
      )}

      <View
        className={cn('mt-md overflow-hidden rounded-2xl', inset && 'mx-lg')}
        style={{
          backgroundColor: brandColors.navy,
          shadowColor: brandColors.navy,
          shadowOpacity: 0.25,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
          elevation: 6,
        }}
      >
        <CardBackdrop />

        <View className="p-lg">
          <View className="flex-row items-center self-start rounded-full border border-white/20 bg-white/10 px-md py-xs">
            <Ionicons name="globe-outline" size={12} color={ATTENTION} />
            <Typography
              variant="badge"
              className="ml-xs text-[9px] tracking-[1px] text-brand-white"
            >
              {content.badge}
            </Typography>
          </View>

          <Typography
            variant="headingLeft"
            className="mt-md pr-2xl text-[21px] leading-[27px] text-brand-white"
          >
            {content.title}
          </Typography>

          {showStats ? (
            <View className="mt-md flex-row gap-sm">
              <StatTile
                label={content.liveLabel}
                value={countsKnown ? liveListings : null}
                onPress={() => go(cfg.routes.mine)}
              />
              <StatTile
                label="Negotiations"
                value={countsKnown ? openNegotiations : null}
                onPress={() => go(cfg.routes.negotiations)}
              />
              <StatTile
                label="To confirm"
                value={countsKnown ? pendingDeals : null}
                highlight={pendingDeals > 0}
                onPress={() => go(cfg.routes.deals)}
              />
            </View>
          ) : (
            <>
              <Typography
                variant="subheadingLeft"
                className="mt-xs text-[13px] leading-[19px] text-brand-white/80"
              >
                {content.body}
              </Typography>

              <View className="mt-md flex-row flex-wrap gap-sm">
                {content.features.map((f) => (
                  <View
                    key={f.label}
                    className="flex-row items-center rounded-full bg-white/10 px-sm py-xs"
                  >
                    <Ionicons name={f.icon} size={13} color="#FFFFFF" />
                    <Typography
                      variant="roleDescription"
                      className="ml-xs text-[11px] text-brand-white/90"
                    >
                      {f.label}
                    </Typography>
                  </View>
                ))}
              </View>

              <View className="mt-lg flex-row items-start">
                {content.steps.map((step, index) => (
                  <View key={step} className="flex-1 flex-row items-start">
                    <View className="flex-1 items-center">
                      <View className="h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/10">
                        <Typography variant="badge" className="text-[11px] text-brand-white">
                          {index + 1}
                        </Typography>
                      </View>
                      <Typography
                        variant="roleDescription"
                        className="mt-xs text-center text-[11px] leading-[15px] text-brand-white/80"
                      >
                        {step}
                      </Typography>
                    </View>
                    {index < content.steps.length - 1 ? (
                      <View className="mt-[13px] h-px w-3 bg-white/30" />
                    ) : null}
                  </View>
                ))}
              </View>
            </>
          )}

          {pendingDeals > 0 ? (
            <Pressable
              onPress={() => go(cfg.routes.deals)}
              accessibilityRole="button"
              className="mt-md flex-row items-center rounded-xl px-md py-sm"
              style={({ pressed }) => ({
                backgroundColor: 'rgba(251, 191, 36, 0.16)',
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Ionicons name="alert-circle" size={16} color={ATTENTION} />
              <Typography
                variant="roleDescription"
                className="ml-sm flex-1 text-[12px] text-brand-white"
              >
                {plural(pendingDeals, 'deal')} awaiting your confirmation
              </Typography>
              <Ionicons name="chevron-forward" size={14} color={ATTENTION} />
            </Pressable>
          ) : drafts > 0 ? (
            <Pressable
              onPress={() => go(cfg.routes.mine)}
              accessibilityRole="button"
              className="mt-md flex-row items-center rounded-xl bg-white/10 px-md py-sm"
              style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
            >
              <Ionicons name="document-text-outline" size={16} color="#FFFFFF" />
              <Typography
                variant="roleDescription"
                className="ml-sm flex-1 text-[12px] text-brand-white"
              >
                {plural(drafts, 'draft')} ready to publish
              </Typography>
              <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
            </Pressable>
          ) : null}

          <View className="mt-lg flex-row gap-sm">
            <Pressable
              onPress={() => go(cfg.routes.form)}
              accessibilityRole="button"
              accessibilityLabel={content.primary.label}
              className="h-11 flex-1 flex-row items-center justify-center rounded-xl bg-brand-white"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <Ionicons name={content.primary.icon} size={17} color={brandColors.navy} />
              <Typography variant="roleTitle" className="ml-xs text-[13px] text-brand-navy">
                {content.primary.label}
              </Typography>
            </Pressable>
            <Pressable
              onPress={() => go(cfg.routes.market)}
              accessibilityRole="button"
              accessibilityLabel={content.secondary.label}
              className="h-11 flex-1 flex-row items-center justify-center rounded-xl border border-white/40"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Ionicons name={content.secondary.icon} size={15} color="#FFFFFF" />
              <Typography variant="roleTitle" className="ml-xs text-[13px] text-brand-white">
                {content.secondary.label}
              </Typography>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
