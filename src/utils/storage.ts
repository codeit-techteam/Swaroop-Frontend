import { Platform } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import type { StorageAdapter } from '@/types';
import { logger } from '@/utils/logger';

const SECURE_KEYS = new Set(['swaroop_access_token', 'swaroop_refresh_token']);

const memoryCache = new Map<string, string>();

class SecureStoreAdapter implements StorageAdapter {
  getString(key: string): string | undefined {
    return memoryCache.get(key);
  }

  set(key: string, value: string | number | boolean): void {
    const stringValue = String(value);
    memoryCache.set(key, stringValue);
    if (Platform.OS !== 'web') {
      void SecureStore.setItemAsync(key, stringValue);
    }
  }

  delete(key: string): void {
    memoryCache.delete(key);
    if (Platform.OS !== 'web') {
      void SecureStore.deleteItemAsync(key);
    }
  }

  clearAll(): void {
    SECURE_KEYS.forEach((key) => {
      memoryCache.delete(key);
      if (Platform.OS !== 'web') {
        void SecureStore.deleteItemAsync(key);
      }
    });
  }

  contains(key: string): boolean {
    return memoryCache.has(key);
  }
}

/** Sync API with AsyncStorage persistence (Expo Go compatible). */
class AsyncStorageAdapter implements StorageAdapter {
  getString(key: string): string | undefined {
    return memoryCache.get(key);
  }

  set(key: string, value: string | number | boolean): void {
    const stringValue = String(value);
    memoryCache.set(key, stringValue);
    void AsyncStorage.setItem(key, stringValue);
  }

  delete(key: string): void {
    memoryCache.delete(key);
    void AsyncStorage.removeItem(key);
  }

  clearAll(): void {
    const keys = Array.from(memoryCache.keys()).filter((key) => !SECURE_KEYS.has(key));
    keys.forEach((key) => memoryCache.delete(key));
    void AsyncStorage.multiRemove(keys);
  }

  contains(key: string): boolean {
    return memoryCache.has(key);
  }
}

class AppStorageAdapter implements StorageAdapter {
  private readonly asyncStorage: AsyncStorageAdapter;
  private readonly secure: SecureStoreAdapter;

  constructor() {
    this.asyncStorage = new AsyncStorageAdapter();
    this.secure = new SecureStoreAdapter();
  }

  private getAdapter(key: string): StorageAdapter {
    return SECURE_KEYS.has(key) ? this.secure : this.asyncStorage;
  }

  getString(key: string): string | undefined {
    return this.getAdapter(key).getString(key);
  }

  set(key: string, value: string | number | boolean): void {
    this.getAdapter(key).set(key, value);
  }

  delete(key: string): void {
    this.getAdapter(key).delete(key);
  }

  clearAll(): void {
    this.asyncStorage.clearAll();
    this.secure.clearAll();
  }

  contains(key: string): boolean {
    return this.getAdapter(key).contains(key);
  }
}

export const storage: StorageAdapter = new AppStorageAdapter();

export const hydrateSecureStorage = async (): Promise<void> => {
  try {
    const secureEntries = await Promise.all(
      Array.from(SECURE_KEYS).map(async (key) => {
        if (Platform.OS === 'web') {
          return [key, null] as const;
        }
        const value = await SecureStore.getItemAsync(key);
        return [key, value] as const;
      }),
    );

    secureEntries.forEach(([key, value]) => {
      if (value) {
        memoryCache.set(key, value);
      }
    });

    const asyncKeys = await AsyncStorage.getAllKeys();
    const persistedKeys = asyncKeys.filter((key) => !SECURE_KEYS.has(key));
    if (persistedKeys.length > 0) {
      const pairs = await AsyncStorage.multiGet(persistedKeys);
      pairs.forEach(([key, value]) => {
        if (value != null) {
          memoryCache.set(key, value);
        }
      });
    }
  } catch (error) {
    logger.warn('Failed to hydrate storage', error);
  }
};

export const getStorageItem = (key: string): string | undefined => storage.getString(key);

export const setStorageItem = (key: string, value: string | number | boolean): void => {
  storage.set(key, value);
};

export const removeStorageItem = (key: string): void => {
  storage.delete(key);
};

export const clearStorage = (): void => {
  storage.clearAll();
};
