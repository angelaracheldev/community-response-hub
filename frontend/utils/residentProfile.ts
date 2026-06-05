import { API_BASE } from './apiConfig';
import { getResidentToken } from './residentAuth';

export type ResidentProfile = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  address: string | null;
  is_verified: boolean;
  is_active: boolean;
};

export async function fetchResidentProfile(): Promise<ResidentProfile | null> {
  const token = await getResidentToken();
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
    const user = payload?.data;
    if (!user || typeof user !== 'object') return null;

    return user as ResidentProfile;
  } catch (error) {
    console.warn('Failed to fetch resident profile:', error);
    return null;
  }
}
