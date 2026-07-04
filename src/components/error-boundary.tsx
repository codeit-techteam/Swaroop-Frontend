import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Text, View } from 'react-native';

import { logger } from '@/utils/logger';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('ErrorBoundary caught an error', { error: error.message, errorInfo });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center bg-background p-4">
          <Text className="font-semibold text-lg text-foreground">Something went wrong</Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}
