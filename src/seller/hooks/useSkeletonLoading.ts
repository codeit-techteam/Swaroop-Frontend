/**
 * Skeleton visibility must follow real request/hydrate state.
 * Pass `ready=true` when data is available; skeleton shows while ready is false.
 *
 * Calling with no args returns false (never invents a delay).
 */
export function useSkeletonLoading(ready = true): boolean {
  return !ready;
}

/**
 * When `active` is true, treat as loading. No artificial delay.
 */
export function useDelayedLoading(active: boolean): boolean {
  return active;
}
