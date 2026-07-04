export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
};

export type AuthActions = {
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  setHydrated: (hydrated: boolean) => void;
};

export type AuthStore = AuthState & AuthActions;

export type ThemeState = {
  mode: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
};

export type ThemeActions = {
  setMode: (mode: ThemeState['mode']) => void;
  setResolvedTheme: (theme: 'light' | 'dark') => void;
};

export type ThemeStore = ThemeState & ThemeActions;

export type NetworkState = {
  isConnected: boolean;
  isInternetReachable: boolean | null;
};

export type NetworkActions = {
  setNetworkStatus: (status: NetworkState) => void;
};

export type NetworkStore = NetworkState & NetworkActions;
