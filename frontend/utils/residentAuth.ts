import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'userToken';
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

export async function setResidentToken(token: string): Promise<void> {
  try {
    if (useWebStorage()) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, token);
      } else {
        memoryFallback.token = token;
      }
      return;
    }
    await SecureStore.setItemAsync(STORAGE_KEY, token);
  } catch (error) {
    console.warn('Failed to persist resident token:', error);
  }
}

export async function getResidentToken(): Promise<string | null> {
  try {
    if (useWebStorage()) {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(STORAGE_KEY);
      }
      return memoryFallback.token;
    }
    return await SecureStore.getItemAsync(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to read resident token:', error);
    return null;
  }
}

export async function clearResidentToken(): Promise<void> {
  try {
    if (useWebStorage()) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      memoryFallback.token = null;
      return;
    }
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear resident token:', error);
  }
}
