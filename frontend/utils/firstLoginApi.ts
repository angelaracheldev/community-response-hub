// Filepath = frontend\utils\firstLoginApi.ts
import { authFetch } from './authFetch';
import { API_BASE } from './apiConfig';

async function parseResponse(response: Response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error('Invalid JSON response from server');
  }
}

// 1. Get onboarding status
export async function getFirstLoginStatus() {
  const res = await authFetch(`${API_BASE}/auth/first-login/status`, {
    method: 'GET',
  });

  const data = await parseResponse(res);

  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch status');
  }

  return data;
}

// 2. Verify OTP
export async function verifyFirstLoginOtp(
  email: string,
  otp: string
) {
  const response = await authFetch(
    `${API_BASE}/auth/first-login/verify-otp`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        otp,
      }),
    }
  );

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'OTP verification failed');
  }

  return data;
}

// 3. Change password
export async function changeFirstLoginPassword(
  newPassword: string
) {
  const res = await authFetch(
    `${API_BASE}/auth/first-login/change-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newPassword }),
    }
  );

  const data = await parseResponse(res);

  if (!res.ok) {
    throw new Error(data.message || 'Password change failed');
  }

  return data;
}

// 4. Resend OTP
export async function resendFirstLoginOtp() {
  const response = await authFetch(
    `${API_BASE}/auth/first-login/resend-otp`,
    {
      method: 'POST',
    }
  );

  // const data = await response.json();
   const data = await parseResponse(response);
  if (!response.ok) throw new Error(data.message);

  return data;
}