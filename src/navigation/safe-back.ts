import type { Href } from 'expo-router';

/** Minimal subset of the Expo Router instance this helper needs (stable across SDK versions). */
type BackCapableRouter = {
  canGoBack: () => boolean;
  back: () => void;
  replace: (href: Href) => void;
};

/**
 * Pop when there is history; otherwise replace to a stable fallback.
 * Avoids Expo Router's "GO_BACK was not handled" when a screen is the stack root
 * (deep link, splash `replace`, or cold start).
 */
export function safeGoBack(router: BackCapableRouter, fallback: Href): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback);
}
