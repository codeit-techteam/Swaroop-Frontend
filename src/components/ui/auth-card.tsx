import { memo, type ReactNode } from 'react';

import { View } from 'react-native';

import { cn } from '@/utils/cn';

type AuthCardProps = {
  children: ReactNode;
  className?: string;
};

export const AuthCard = memo(function AuthCard({ children, className }: AuthCardProps) {
  return (
    <View className={cn('w-full rounded-2xl bg-brand-white px-xl py-2xl shadow-sm', className)}>
      {children}
    </View>
  );
});
