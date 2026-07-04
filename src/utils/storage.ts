import * as SecureStore from 'expo-secure-store';

import { createMMKV, type MMKV } from 'react-native-mmkv';

import { appConfig } from '@/config/env';
import type { StorageAdapter } from '@/types';
import { logger } from '@/utils/logger';

const SECURE_KEYS = new Set(['swaroop_access_token', 'swaroop_refresh_token']);

const memoryCache = new Map<string, string>();

class MemoryStorageAdapter implements StorageAdapter {
  getString(key: string): string | undefined {
    return memoryCache.get(key);
  }

  set(key: string, value: string | number | boolean): void {
    memoryCache.set(key, String(value));
  }

  delete(key: string): void {
    memoryCache.delete(key);
  }

  clearAll(): void {
    memoryCache.clear();
  }

  contains(key: string): boolean {
    return memoryCache.has(key);
  }
}

class SecureStoreAdapter implements StorageAdapter {
  getString(key: string): string | undefined {
    return memoryCache.get(key);
  }

  set(key: string, value: string | number | boolean): void {
    const stringValue = String(value);
    memoryCache.set(key, stringValue);
    void SecureStore.setItemAsync(key, stringValue);
  }

  delete(key: string): void {
    memoryCache.delete(key);
    void SecureStore.deleteItemAsync(key);
  }

  clearAll(): void {
    SECURE_KEYS.forEach((key) => {
      memoryCache.delete(key);
      void SecureStore.deleteItemAsync(key);
    });
  }

  contains(key: string): boolean {
    return memoryCache.has(key);
  }
}

class MMKVAdapter implements StorageAdapter {
  private readonly storage: MMKV;

  constructor(id: string) {
    this.storage = createMMKV({ id });
  }

  getString(key: string): string | undefined {
    return this.storage.getString(key);
  }

  set(key: string, value: string | number | boolean): void {
    this.storage.set(key, value);
  }

  delete(key: string): void {
    this.storage.remove(key);
  }

  clearAll(): void {
    this.storage.clearAll();
  }

  contains(key: string): boolean {
    return this.storage.contains(key);
  }
}

class HybridStorageAdapter implements StorageAdapter {
  private readonly mmkv: MMKVAdapter;
  private readonly secure: SecureStoreAdapter;
  private readonly memory: MemoryStorageAdapter;

  constructor() {
    this.mmkv = new MMKVAdapter('swaroop-storage');
    this.secure = new SecureStoreAdapter();
    this.memory = new MemoryStorageAdapter();
  }

  private getAdapter(key: string): StorageAdapter {
    if (SECURE_KEYS.has(key)) {
      return this.secure;
    }
    return this.mmkv;
  }

  getString(key: string): string | undefined {
    return this.getAdapter(key).getString(key) ?? this.memory.getString(key);
  }

  set(key: string, value: string | number | boolean): void {
    this.getAdapter(key).set(key, value);
    this.memory.set(key, value);
  }

  delete(key: string): void {
    this.getAdapter(key).delete(key);
    this.memory.delete(key);
  }

  clearAll(): void {
    this.mmkv.clearAll();
    this.secure.clearAll();
    this.memory.clearAll();
  }

  contains(key: string): boolean {
    return this.getAdapter(key).contains(key) || this.memory.contains(key);
  }
}

class ExpoGoStorageAdapter implements StorageAdapter {
  private readonly secure: SecureStoreAdapter;
  private readonly memory: MemoryStorageAdapter;

  constructor() {
    this.secure = new SecureStoreAdapter();
    this.memory = new MemoryStorageAdapter();
  }

  private getAdapter(key: string): StorageAdapter {
    return SECURE_KEYS.has(key) ? this.secure : this.memory;
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
    this.memory.clearAll();
    this.secure.clearAll();
  }

  contains(key: string): boolean {
    return this.getAdapter(key).contains(key);
  }
}

const createStorage = (): StorageAdapter => {
  if (appConfig.isExpoGo) {
    logger.info('Using Expo Go compatible storage adapter');
    return new ExpoGoStorageAdapter();
  }

  try {
    return new HybridStorageAdapter();
  } catch (error) {
    logger.warn('MMKV unavailable, falling back to Expo Go storage adapter', error);
    return new ExpoGoStorageAdapter();
  }
};

export const storage = createStorage();

export const hydrateSecureStorage = async (): Promise<void> => {
  await Promise.all(
    Array.from(SECURE_KEYS).map(async (key) => {
      const value = await SecureStore.getItemAsync(key);
      if (value) {
        memoryCache.set(key, value);
      }
    }),
  );
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
