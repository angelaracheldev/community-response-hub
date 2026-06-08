import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ACCESS_STORAGE_KEY = 'authToken';
const REFRESH_STORAGE_KEY = 'authRefreshToken';
const LEGACY_STORAGE_KEYS = ['userToken', 'adminAuthToken'];
const memoryFallback: { accessToken: string | null; refreshToken: string | null } = {
  accessToken: null,
  refreshToken: null,
};

function useWebStorage(): boolean {
  return Platform.OS === 'web';
}

export function extractAccessToken(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const root = data as Record<string, unknown>;
  const nested = root.data as Record<string, unknown> | undefined;
  const tokens = nested?.tokens as Record<string, unknown> | undefined;
  if (typeof tokens?.accessToken === 'string') return tokens.accessToken;
  if (typeof root.token === 'string') return root.token;
  return null;
}

export function extractRefreshToken(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const root = data as Record<string, unknown>;
  const nested = root.data as Record<string, unknown> | undefined;
  const tokens = nested?.tokens as Record<string, unknown> | undefined;
  if (typeof tokens?.refreshToken === 'string') return tokens.refreshToken;
  return null;
}

async function readStoredValue(key: string): Promise<string | null> {
  if (useWebStorage()) {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    if (key === ACCESS_STORAGE_KEY) return memoryFallback.accessToken;
    if (key === REFRESH_STORAGE_KEY) return memoryFallback.refreshToken;
    return null;
  }
  return SecureStore.getItemAsync(key);
}

async function writeStoredValue(key: string, value: string): Promise<void> {
  if (useWebStorage()) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    } else if (key === ACCESS_STORAGE_KEY) {
      memoryFallback.accessToken = value;
    } else if (key === REFRESH_STORAGE_KEY) {
      memoryFallback.refreshToken = value;
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function removeStoredValue(key: string): Promise<void> {
  if (useWebStorage()) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    } else if (key === ACCESS_STORAGE_KEY) {
      memoryFallback.accessToken = null;
    } else if (key === REFRESH_STORAGE_KEY) {
      memoryFallback.refreshToken = null;
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

async function migrateLegacyToken(): Promise<string | null> {
  for (const legacyKey of LEGACY_STORAGE_KEYS) {
    const legacyToken = await readStoredValue(legacyKey);
    if (legacyToken) {
      await writeStoredValue(ACCESS_STORAGE_KEY, legacyToken);
      await removeStoredValue(legacyKey);
      return legacyToken;
    }
  }
  return null;
}

export async function setAuthToken(accessToken: string): Promise<void> {
  try {
    await writeStoredValue(ACCESS_STORAGE_KEY, accessToken);
    await Promise.all(LEGACY_STORAGE_KEYS.map((key) => removeStoredValue(key)));
  } catch (error) {
    console.warn('Failed to persist auth token:', error);
  }
}

export async function setRefreshToken(refreshToken: string): Promise<void> {
  try {
    await writeStoredValue(REFRESH_STORAGE_KEY, refreshToken);
  } catch (error) {
    console.warn('Failed to persist refresh token:', error);
  }
}

export async function setAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
  await setAuthToken(accessToken);
  await setRefreshToken(refreshToken);
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const token = await readStoredValue(ACCESS_STORAGE_KEY);
    if (token) return token;
    return migrateLegacyToken();
  } catch (error) {
    console.warn('Failed to read auth token:', error);
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await readStoredValue(REFRESH_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to read refresh token:', error);
    return null;
  }
}

export async function clearAuthToken(): Promise<void> {
  try {
    await removeStoredValue(ACCESS_STORAGE_KEY);
    await removeStoredValue(REFRESH_STORAGE_KEY);
    await Promise.all(LEGACY_STORAGE_KEYS.map((key) => removeStoredValue(key)));
    memoryFallback.accessToken = null;
    memoryFallback.refreshToken = null;
  } catch (error) {
    console.warn('Failed to clear auth token:', error);
  }
}
