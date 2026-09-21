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
export type { CompanyType, BusinessInformation, KycState, KycActions, KycStore } from '@/types/kyc';
export type {
  HomeBanner,
  PriceTrend,
  WatchlistItem,
  TrendingProduct,
  MarketInsight,
  DeliveryLocation,
  QuickSummaryItem,
  LowestLandedCost,
} from '@/types/home';
export type {
  MarketCategory,
  MarketAvailabilityBadge,
  MarketParentCategoryId,
  MarketProduct,
  ProductTechnicalSpecs,
  StockLevel,
} from '@/types/market';
export type {
  PriceTrendDirection,
  ProductAvailabilityLevel,
  ProductSpec,
  PricingTier,
  ProductPaymentOption,
  ComplianceDocumentType,
  ComplianceDocument,
  LogisticsEstimate,
  SpotPriceInfo,
  RelatedProductCard,
  TrustFeature,
  ProductInfoItem,
  ProductDetails,
  CartItem,
  CartDeliveryLocation,
  CartOrderSummary,
} from '@/types/product';

export type {
  PaymentMethodId,
  PaymentBadgeVariant,
  PaymentMethod,
  PaymentCalculation,
  PaymentComparisonRow,
} from '@/types/payment';

export type {
  NotificationCategoryFilter,
  NotificationCategory,
  NotificationPriority,
  CustomerNotification,
  NotificationDateGroup,
} from '@/types/notifications';

export type {
  CheckoutShippingAddress,
  CheckoutOrderSummary,
  CheckoutProductLine,
} from '@/types/checkout';

export type {
  SavedAddressKind,
  AddressSource,
  SavedDeliveryAddress,
  AddressDraft,
  ResolvedGeoAddress,
  PincodeLocality,
} from '@/types/address';

export type {
  UserRole,
  AuthPayload,
  UserProfilePayload,
  KycPayload,
  AppSettingsPayload,
  CurrentUser,
  LoginResult,
  SessionSnapshot,
} from '@/types/session';
