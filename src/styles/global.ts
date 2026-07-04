import { StyleSheet } from 'react-native';

import { borderRadius } from '@/theme/border-radius';
import { spacing } from '@/theme/spacing';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenPadding: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
});

export const layoutStyles = {
  flex1: 'flex-1',
  flexGrow: 'flex-grow',
  itemsCenter: 'items-center',
  justifyCenter: 'justify-center',
  justifyBetween: 'justify-between',
  row: 'flex-row items-center',
  fullWidth: 'w-full',
  fullHeight: 'h-full',
} as const;
