import type { AxiosRequestConfig } from 'axios';

export type ApiRequestConfig = AxiosRequestConfig & {
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

export type TokenRefreshHandler = () => Promise<string | null>;

export type ApiClientConfig = {
  baseURL: string;
  timeout: number;
};
