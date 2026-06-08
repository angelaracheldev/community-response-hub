import { API_BASE } from './apiConfig';
import { authFetch } from './authFetch';

function apiErrorMessage(
  data: { message?: string; errors?: { msg?: string }[] },
  fallback: string
): string {
  if (data.message) return data.message;
  if (data.errors?.length) return data.errors[0].msg ?? fallback;
  return fallback;
}

export type VerificationStatus = 'not_submitted' | 'pending' | 'rejected' | 'approved';

export type MyVerificationDetails = {
  verification_status: VerificationStatus;
  verification_remarks: string;
  verification_address: string;
  verification_type: string;
};

export async function fetchMyVerificationDetails(): Promise<MyVerificationDetails | null> {
  const response = await authFetch(`${API_BASE}/users/me`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.json();
  if (!response.ok || !data.user) return null;

  return {
    verification_status: data.user.verification_status || 'not_submitted',
    verification_remarks: data.user.verification_remarks || '',
    verification_address: data.user.verification_address || '',
    verification_type: data.user.verification_type || 'ID',
  };
}

export async function submitVerification(formData: FormData): Promise<void> {
  const response = await authFetch(`${API_BASE}/users/me/verification`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(apiErrorMessage(data, 'Verification submission failed'));
  }
}
