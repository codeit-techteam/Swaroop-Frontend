import axios, {
  AxiosError,
  AxiosHeaders,
  create,
  isAxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { appConfig } from '@/config/env';
import { DEVELOPMENT_MODE } from '@/config/development';
import { API_TIMEOUT, STORAGE_KEYS } from '@/constants';
import type { ApiErrorResponse, RefreshTokenResponse } from '@/types';
import type { ApiRequestConfig } from '@/types/api';
import { logger } from '@/utils/logger';
import { getStorageItem, removeStorageItem, setStorageItem } from '@/utils/storage';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

type AuthTokenPayload = {
  accessToken?: string;
  refreshToken?: string;
};

const unwrapTokenPayload = (body: unknown): AuthTokenPayload => {
  if (!body || typeof body !== 'object') {
    return {};
  }
  const root = body as Record<string, unknown>;
  const nested =
    root.data && typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : root;
  return {
    accessToken:
      typeof nested.accessToken === 'string' ? nested.accessToken : undefined,
    refreshToken:
      typeof nested.refreshToken === 'string' ? nested.refreshToken : undefined,
  };
};

const subscribeTokenRefresh = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string): void => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post<RefreshTokenResponse | { data: RefreshTokenResponse }>(
      `${appConfig.apiBaseUrl}/auth/refresh`,
      { refreshToken },
      { timeout: API_TIMEOUT },
    );

    const payload = unwrapTokenPayload(response.data);
    if (!payload.accessToken) {
      throw new Error('Refresh response missing access token');
    }

    setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, payload.accessToken);
    if (payload.refreshToken) {
      setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, payload.refreshToken);
    }

    return payload.accessToken;
  } catch (error) {
    logger.error('Token refresh failed', {
      message: error instanceof Error ? error.message : 'Unknown refresh error',
    });
    removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
    removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
    return null;
  }
};

const recoverAccessToken = async (): Promise<string | null> => {
  const refreshed = await refreshAccessToken();
  if (refreshed) {
    return refreshed;
  }

  if (!DEVELOPMENT_MODE) {
    return null;
  }

  // Stale/missing JWT after local demo OTP login — re-auth against Swaroop-Backend.
  const { recoverDevBackendSession } = await import('@/services/backend-session');
  return recoverDevBackendSession();
};

const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const requestConfig = config as InternalAxiosRequestConfig & ApiRequestConfig;

  if (!requestConfig.skipAuth) {
    const accessToken = getStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (accessToken) {
      const headers = new AxiosHeaders(config.headers);
      headers.set('Authorization', `Bearer ${accessToken}`);
      config.headers = headers;
    }
  }

  logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
};

const requestErrorInterceptor = (error: AxiosError): Promise<never> => {
  logger.error('API Request Error', error.message);
  return Promise.reject(error);
};

const responseInterceptor = (response: AxiosResponse): AxiosResponse => {
  logger.debug(`API Response: ${response.status} ${response.config.url}`);
  return response;
};

const responseErrorInterceptor = async (error: AxiosError<ApiErrorResponse>): Promise<unknown> => {
  const originalRequest = error.config as
    | (InternalAxiosRequestConfig & ApiRequestConfig & { _retry?: boolean })
    | undefined;

  if (!originalRequest || axios.isCancel(error)) {
    return Promise.reject(error);
  }

  if (
    error.response?.status === 401 &&
    !originalRequest.skipRefresh &&
    !originalRequest._retry
  ) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token: string) => {
          const headers = new AxiosHeaders(originalRequest.headers);
          headers.set('Authorization', `Bearer ${token}`);
          originalRequest.headers = headers;
          originalRequest._retry = true;
          resolve(apiClient(originalRequest));
        });

        setTimeout(() => {
          reject(error);
        }, API_TIMEOUT);
      });
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const newToken = await recoverAccessToken();
      isRefreshing = false;

      if (newToken) {
        onTokenRefreshed(newToken);
        const headers = new AxiosHeaders(originalRequest.headers);
        headers.set('Authorization', `Bearer ${newToken}`);
        originalRequest.headers = headers;
        return apiClient(originalRequest);
      }
    } catch (refreshError) {
      isRefreshing = false;
      logger.error('Token refresh interceptor error', {
        message:
          refreshError instanceof Error ? refreshError.message : 'Unknown interceptor error',
      });
    }
  }

  const errorMessage =
    error.response?.data?.message ?? error.message ?? 'An unexpected error occurred';

  // Avoid noisy console errors for expected seller-profile gaps on customer sessions.
  const isExpectedSellerGap =
    error.response?.status === 404 &&
    typeof errorMessage === 'string' &&
    errorMessage.toLowerCase().includes('seller profile not found');

  if (!isExpectedSellerGap) {
    logger.error('API Response Error', {
      status: error.response?.status,
      message: errorMessage,
    });
  }

  return Promise.reject(error);
};

export const apiClient: AxiosInstance = create({
  baseURL: appConfig.apiBaseUrl,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

logger.debug('API client ready', { baseURL: appConfig.apiBaseUrl });

apiClient.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
apiClient.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export const createApiClient = (): AxiosInstance => apiClient;

export const getApiErrorMessage = (error: unknown): string => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
