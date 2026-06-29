// Filepath = frontend/utils/forgotPasswordApi.ts
import { API_BASE } from './apiConfig';

type ApiResponse<T = {}> = { success: boolean; message?: string } & T;

export async function requestPasswordResetOtp(email: string): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE}/auth/forgot-password/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return response.json();
}

export async function verifyPasswordResetOtp(
  email: string,
  otp: string
): Promise<ApiResponse<{ resetToken?: string }>> {
  const response = await fetch(`${API_BASE}/auth/forgot-password/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  return response.json();
}

export async function resetPassword(
  resetToken: string,
  newPassword: string,
  confirmPassword: string
): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE}/auth/forgot-password/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resetToken, newPassword, confirmPassword }),
  });
  return response.json();
}