import { API_BASE } from './apiConfig';

type SessionUser = {
  first_name?: string;
  last_name?: string;
  email?: string;
};

export async function fetchSessionDisplayName(
  getToken: () => string | null | Promise<string | null>
): Promise<string | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;

    const payload = await response.json();
    const user = (payload?.data ?? payload?.user) as SessionUser | undefined;
    if (!user || typeof user !== 'object') return null;

    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
    if (fullName) return fullName;
    if (user.email) return user.email.split('@')[0];
    return null;
  } catch (error) {
    console.warn('Failed to fetch session profile:', error);
    return null;
  }
}
