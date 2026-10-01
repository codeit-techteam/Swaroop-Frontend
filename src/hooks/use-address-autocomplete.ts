import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createSessionToken,
  fetchPlaceLocation,
  isAbortError,
  type LocationServiceError,
  type LocationSuggestion,
  type NormalizedLocation,
  searchLocations,
  toLocationError,
} from '@/services/location-search';
import { logger } from '@/utils/logger';

export const AUTOCOMPLETE_DEBOUNCE_MS = 300;
export const AUTOCOMPLETE_MIN_LENGTH = 2;

type Status = 'idle' | 'loading' | 'ready' | 'error';

type SearchResult = {
  key: string;
  suggestions: LocationSuggestion[];
  error: LocationServiceError | null;
};

const EMPTY_RESULT: SearchResult = { key: '', suggestions: [], error: null };

/**
 * Debounced Places autocomplete bound to one billing session: every keystroke
 * and the final details lookup share a token, which is rotated after a pick.
 */
export function useAddressAutocomplete(options?: {
  near?: { latitude: number; longitude: number } | null;
  minLength?: number;
  debounceMs?: number;
  enabled?: boolean;
}) {
  const minLength = options?.minLength ?? AUTOCOMPLETE_MIN_LENGTH;
  const debounceMs = options?.debounceMs ?? AUTOCOMPLETE_DEBOUNCE_MS;
  const enabled = options?.enabled ?? true;
  const nearLat = options?.near?.latitude;
  const nearLng = options?.near?.longitude;

  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult>(EMPTY_RESULT);
  const [selectError, setSelectError] = useState<LocationServiceError | null>(null);
  const [resolvingPlaceId, setResolvingPlaceId] = useState<string | null>(null);

  const sessionTokenRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef(new Map<string, LocationSuggestion[]>());

  const trimmed = query.trim();
  const key = trimmed.toLowerCase();
  const active = enabled && trimmed.length >= minLength;
  const settled = active && result.key === key;

  const endSession = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    sessionTokenRef.current = null;
    cacheRef.current.clear();
  }, []);

  useEffect(() => endSession, [endSession]);

  useEffect(() => {
    if (!active) {
      abortRef.current?.abort();
      return;
    }
    const cached = cacheRef.current.get(key);
    const timer = setTimeout(
      () => {
        abortRef.current?.abort();
        if (cached) {
          setResult({ key, suggestions: cached, error: null });
          return;
        }
        const controller = new AbortController();
        abortRef.current = controller;
        sessionTokenRef.current ??= createSessionToken();

        searchLocations(trimmed, {
          sessionToken: sessionTokenRef.current,
          near:
            nearLat != null && nearLng != null ? { latitude: nearLat, longitude: nearLng } : null,
          signal: controller.signal,
        })
          .then((rows) => {
            if (controller.signal.aborted) return;
            cacheRef.current.set(key, rows);
            setResult({ key, suggestions: rows, error: null });
          })
          .catch((cause: unknown) => {
            if (isAbortError(cause) || controller.signal.aborted) return;
            const failure = toLocationError(cause, 'AUTOCOMPLETE_FAILED');
            logger.warn('Address autocomplete failed', { code: failure.code });
            setResult({ key, suggestions: [], error: failure });
          });
      },
      cached ? 0 : debounceMs,
    );

    return () => clearTimeout(timer);
  }, [active, key, trimmed, debounceMs, nearLat, nearLng]);

  const selectSuggestion = useCallback(
    async (suggestion: LocationSuggestion): Promise<NormalizedLocation> => {
      abortRef.current?.abort();
      setSelectError(null);
      setResolvingPlaceId(suggestion.placeId);
      try {
        const location = await fetchPlaceLocation(suggestion.placeId, {
          sessionToken: sessionTokenRef.current,
          name: suggestion.primaryText,
        });
        endSession();
        setResult(EMPTY_RESULT);
        return location;
      } catch (cause) {
        const failure = toLocationError(cause, 'PLACE_NOT_FOUND');
        logger.warn('Address place selection failed', { code: failure.code });
        setSelectError(failure);
        throw failure;
      } finally {
        setResolvingPlaceId(null);
      }
    },
    [endSession],
  );

  const reset = useCallback(() => {
    endSession();
    setQuery('');
    setResult(EMPTY_RESULT);
    setSelectError(null);
    setResolvingPlaceId(null);
  }, [endSession]);

  const updateQuery = useCallback((value: string) => {
    setSelectError(null);
    setQuery(value);
  }, []);

  const searchError = settled ? result.error : null;
  const status: Status = !active ? 'idle' : !settled ? 'loading' : searchError ? 'error' : 'ready';

  return {
    query,
    setQuery: updateQuery,
    suggestions: active ? result.suggestions : EMPTY_RESULT.suggestions,
    status,
    error: selectError ?? searchError,
    resolvingPlaceId,
    minLength,
    selectSuggestion,
    reset,
  };
}
