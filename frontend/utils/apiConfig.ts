const host = typeof window !== 'undefined' && window.location?.hostname ? window.location.hostname : 'localhost';
const protocol = 'http';
const port = 5000;

export const API_ROOT = `${protocol}://${host}:${port}`;
export const API_BASE = `${API_ROOT}/api/v1`;
export const ADMIN_API_BASE = `${API_ROOT}/api`;
export const SOCKET_URL = API_ROOT;
