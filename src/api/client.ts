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
import { API_TIMEOUT, STORAGE_KEYS } from '@/constants';
import type { ApiErrorResponse, RefreshTokenResponse } from '@/types';
import type { ApiRequestConfig } from '@/types/api';
import { logger } from '@/utils/logger';
import { getStorageItem, removeStorageItem, setStorageItem } from '@/utils/storage';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

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
    const response = await axios.post<RefreshTokenResponse>(
      `${appConfig.apiBaseUrl}/auth/refresh`,
      { refreshToken },
      { timeout: API_TIMEOUT },
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

    return accessToken;
  } catch (error) {
    logger.error('Token refresh failed', error);
    removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
    removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
    return null;
  }
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
    (InternalAxiosRequestConfig & ApiRequestConfig) | undefined;

  if (!originalRequest) {
    return Promise.reject(error);
  }

  if (error.response?.status === 401 && !originalRequest.skipRefresh) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token: string) => {
          const headers = new AxiosHeaders(originalRequest.headers);
          headers.set('Authorization', `Bearer ${token}`);
          originalRequest.headers = headers;
          resolve(apiClient(originalRequest));
        });

        setTimeout(() => {
          reject(error);
        }, API_TIMEOUT);
      });
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
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
      logger.error('Token refresh interceptor error', refreshError);
    }
  }

  const errorMessage =
    error.response?.data?.message ?? error.message ?? 'An unexpected error occurred';
  logger.error('API Response Error', { status: error.response?.status, message: errorMessage });

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
