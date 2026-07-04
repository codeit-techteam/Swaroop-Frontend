export type ThemeMode = 'light' | 'dark' | 'system';

export type ApiErrorResponse = {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type RefreshTokenResponse = AuthTokens;

export type NetworkStatus = {
  isConnected: boolean;
  isInternetReachable: boolean | null;
};

export type StorageAdapter = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string | number | boolean) => void;
  delete: (key: string) => void;
  clearAll: () => void;
  contains: (key: string) => boolean;
};

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type { ApiRequestConfig, TokenRefreshHandler, ApiClientConfig } from '@/types/api';
export type {
  DocumentId,
  DocumentStatus,
  DocumentFile,
  DocumentItem,
  StepperStepStatus,
  StepperStep,
  TimelineStepStatus,
  TimelineStep,
} from '@/types/document';
export type {
  CompanyType,
  BusinessInformation,
  KycState,
  KycActions,
  KycStore,
} from '@/types/kyc';

