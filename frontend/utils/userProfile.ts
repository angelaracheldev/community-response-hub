import { API_BASE } from './apiConfig';
import { authFetch, SessionExpiredError } from './authFetch';
import { getAuthToken } from './sessionAuth';

export type UserProfile = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  address: string | null;
  is_verified: boolean;
  is_active: boolean;
  role_name?: string;
};

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const response = await authFetch(`${API_BASE}/auth/me`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) return null;

    const payload = await response.json();
    const user = payload?.data;
    if (!user || typeof user !== 'object') return null;

    return user as UserProfile;
  } catch (error) {
    if (error instanceof SessionExpiredError) return null;
    console.warn('Failed to fetch current user:', error);
    return null;
  }
}
