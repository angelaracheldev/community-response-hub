// Filepath = frontend\utils\apiConfig.ts
function normalizeRoot(url: string): string {
  return url.replace(/\/$/, '');
}

const configuredRoot = process.env.EXPO_PUBLIC_API_URL;
const fallbackHost =
  typeof window !== 'undefined' && window.location?.hostname
    ? window.location.hostname
    : 'localhost';
const fallbackRoot = `http://${fallbackHost}:5000`;

export const API_ROOT = normalizeRoot(configuredRoot || fallbackRoot);
export const API_BASE = `${API_ROOT}/api/v1`;
export const ADMIN_API_BASE = `${API_ROOT}/api`;
export const SOCKET_URL = API_ROOT;
