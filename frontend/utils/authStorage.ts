const STORAGE_KEY = 'adminAuthToken';
const fallback: { token: string | null } = { token: null };

function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function setAdminToken(token: string | null): void {
  if (hasLocalStorage()) {
    if (token === null) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, token);
    }
  } else {
    fallback.token = token;
  }
}

export function getAdminToken(): string | null {
  if (hasLocalStorage()) {
    return window.localStorage.getItem(STORAGE_KEY);
  }
  return fallback.token;
}

export function clearAdminToken(): void {
  if (hasLocalStorage()) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  fallback.token = null;
}
