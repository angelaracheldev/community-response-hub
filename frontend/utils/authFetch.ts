import { router } from 'expo-router';
import { connectSocket, disconnectSocket } from '../hooks/useSocket';
import { API_BASE } from './apiConfig';
import {
  clearAuthToken,
  getAuthToken,
  getRefreshToken,
  setAuthToken,
} from './sessionAuth';

const LOGIN_ROUTE = '/(auth)/login' as const;
const TOKEN_REFRESH_BUFFER_SECONDS = 60;

let refreshPromise: Promise<string | null> | null = null;
let redirectInProgress = false;

export class SessionExpiredError extends Error {
  constructor() {
    super('Session expired');
    this.name = 'SessionExpiredError';
  }
}

function mergeAuthHeader(init: RequestInit | undefined, token: string): RequestInit {
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  return { ...init, headers };
}

function decodeJwtExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized)) as { exp?: number };
    return typeof decoded.exp === 'number' ? decoded.exp : null;
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(token: string, bufferSeconds = TOKEN_REFRESH_BUFFER_SECONDS): boolean {
  const exp = decodeJwtExpiry(token);
  if (!exp) return false;
  return Date.now() >= (exp - bufferSeconds) * 1000;
}

async function requestNewAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(`${API_BASE}/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();
  if (!response.ok) return null;

  const accessToken = (data as { data?: { accessToken?: string } })?.data?.accessToken;
  if (typeof accessToken !== 'string') return null;

  await setAuthToken(accessToken);
  void connectSocket();
  return accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function handleSessionExpired(): Promise<never> {
  if (!redirectInProgress) {
    redirectInProgress = true;
    disconnectSocket();
    await clearAuthToken();
    router.replace(LOGIN_ROUTE);
    setTimeout(() => {
      redirectInProgress = false;
    }, 1000);
  }
  throw new SessionExpiredError();
}

export async function refreshAccessTokenIfNeeded(): Promise<string | null> {
  const accessToken = await getAuthToken();
  if (!accessToken) return null;
  if (!isAccessTokenExpired(accessToken)) return accessToken;
  return refreshAccessToken();
}

export async function authFetch(url: string, init?: RequestInit): Promise<Response> {
  let accessToken = await refreshAccessTokenIfNeeded();
  if (!accessToken) {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      return handleSessionExpired();
    }
    accessToken = await refreshAccessToken();
    if (!accessToken) {
      return handleSessionExpired();
    }
  }

  let response = await fetch(url, mergeAuthHeader(init, accessToken));

  if (response.status !== 401) {
    return response;
  }

  const newToken = await refreshAccessToken();
  if (!newToken) {
    return handleSessionExpired();
  }

  response = await fetch(url, mergeAuthHeader(init, newToken));
  if (response.status === 401) {
    return handleSessionExpired();
  }

  return response;
}
