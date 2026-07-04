import { memo, type ComponentType, type MemoExoticComponent } from 'react';

export const createMemoComponent = <P extends object>(
  Component: ComponentType<P>,
  displayName?: string,
): MemoExoticComponent<ComponentType<P>> => {
  const Memoized = memo(Component);
  Memoized.displayName = displayName ?? Component.displayName ?? 'MemoizedComponent';
  return Memoized;
};

export const shallowEqual = <T extends Record<string, unknown>>(objA: T, objB: T): boolean => {
  if (objA === objB) return true;

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => objA[key] === objB[key]);
};
