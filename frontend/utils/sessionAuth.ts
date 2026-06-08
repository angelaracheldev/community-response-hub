import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'authToken';
const LEGACY_STORAGE_KEYS = ['userToken', 'adminAuthToken'];
const memoryFallback: { token: string | null } = { token: null };

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

async function readStoredToken(key: string): Promise<string | null> {
  if (useWebStorage()) {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return key === STORAGE_KEY ? memoryFallback.token : null;
  }
  return SecureStore.getItemAsync(key);
}

async function writeStoredToken(key: string, token: string): Promise<void> {
  if (useWebStorage()) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, token);
    } else if (key === STORAGE_KEY) {
      memoryFallback.token = token;
    }
    return;
  }
  await SecureStore.setItemAsync(key, token);
}

async function removeStoredToken(key: string): Promise<void> {
  if (useWebStorage()) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    } else if (key === STORAGE_KEY) {
      memoryFallback.token = null;
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

async function migrateLegacyToken(): Promise<string | null> {
  for (const legacyKey of LEGACY_STORAGE_KEYS) {
    const legacyToken = await readStoredToken(legacyKey);
    if (legacyToken) {
      await writeStoredToken(STORAGE_KEY, legacyToken);
      await removeStoredToken(legacyKey);
      return legacyToken;
    }
  }
  return null;
}

export async function setAuthToken(token: string): Promise<void> {
  try {
    await writeStoredToken(STORAGE_KEY, token);
    await Promise.all(LEGACY_STORAGE_KEYS.map((key) => removeStoredToken(key)));
  } catch (error) {
    console.warn('Failed to persist auth token:', error);
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const token = await readStoredToken(STORAGE_KEY);
    if (token) return token;
    return migrateLegacyToken();
  } catch (error) {
    console.warn('Failed to read auth token:', error);
    return null;
  }
}

export async function clearAuthToken(): Promise<void> {
  try {
    await removeStoredToken(STORAGE_KEY);
    await Promise.all(LEGACY_STORAGE_KEYS.map((key) => removeStoredToken(key)));
    memoryFallback.token = null;
  } catch (error) {
    console.warn('Failed to clear auth token:', error);
  }
}
