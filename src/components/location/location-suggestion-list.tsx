import { memo } from 'react';

import { ActivityIndicator, Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { LocationPinIcon } from '@/icons';
import {
  formatDistance,
  type LocationServiceError,
  type LocationSuggestion,
} from '@/services/location-search';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

type LocationSuggestionListProps = {
  suggestions: LocationSuggestion[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: LocationServiceError | null;
  resolvingPlaceId: string | null;
  onSelect: (suggestion: LocationSuggestion) => void;
  /** Section heading, rendered in the app's existing field-label style. */
  title?: string;
  attribution?: string | null;
};

/** Google place suggestions rendered with the app's existing location-row look. */
export const LocationSuggestionList = memo(function LocationSuggestionList({
  suggestions,
  status,
  error,
  resolvingPlaceId,
  onSelect,
  title = 'SUGGESTIONS',
  attribution = 'Powered by Google',
}: LocationSuggestionListProps) {
  if (status === 'idle' && !suggestions.length) return null;

  return (
    <View className="mb-md">
      <View className="mb-sm flex-row items-center justify-between">
        <Typography variant="fieldLabel" className="text-[11px] tracking-[0.8px] text-brand-muted">
          {title}
        </Typography>
        {status === 'loading' ? (
          <ActivityIndicator size="small" color={brandColors.primary} />
        ) : null}
      </View>

      {suggestions.map((suggestion) => {
        const resolving = resolvingPlaceId === suggestion.placeId;
        const distance = formatDistance(suggestion.distanceMeters);
        return (
          <Pressable
            key={suggestion.placeId}
            onPress={() => onSelect(suggestion)}
            disabled={Boolean(resolvingPlaceId)}
            accessibilityRole="button"
            accessibilityLabel={suggestion.fullText || suggestion.primaryText}
            className={cn(
              'mb-sm flex-row items-center rounded-xl border border-brand-border bg-brand-white px-md py-md',
              resolvingPlaceId && !resolving && 'opacity-60',
            )}
          >
            {resolving ? (
              <ActivityIndicator size="small" color={brandColors.primary} />
            ) : (
              <LocationPinIcon color={brandColors.muted} />
            )}
            <View className="ml-md flex-1">
              <Typography
                variant="roleTitle"
                className="text-[15px] text-brand-heading"
                numberOfLines={1}
              >
                {suggestion.primaryText}
              </Typography>
              {suggestion.secondaryText ? (
                <Typography
                  variant="caption"
                  className="mt-0.5 font-sans text-[12px] normal-case tracking-normal text-brand-muted"
                  numberOfLines={1}
                >
                  {suggestion.secondaryText}
                </Typography>
              ) : null}
            </View>
            {distance ? (
              <Typography
                variant="caption"
                className="ml-sm font-sans text-[11px] normal-case tracking-normal text-brand-muted"
              >
                {distance}
              </Typography>
            ) : null}
          </Pressable>
        );
      })}

      {status === 'ready' && !suggestions.length ? (
        <Typography
          variant="caption"
          className="mb-sm font-sans text-[12px] normal-case tracking-normal text-brand-muted"
        >
          No matching places. Try a nearby landmark or a pincode.
        </Typography>
      ) : null}

      {error ? (
        <Typography
          variant="caption"
          className="mb-sm font-sans text-[12px] normal-case tracking-normal text-brand-error"
        >
          {error.message}
        </Typography>
      ) : null}

      {attribution && (suggestions.length > 0 || status === 'loading') ? (
        <Typography
          variant="caption"
          className="text-right font-sans text-[10px] normal-case tracking-normal text-brand-muted"
        >
          {attribution}
        </Typography>
      ) : null}
    </View>
  );
});
