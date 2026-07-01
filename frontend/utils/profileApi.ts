// Filepath = frontend/utils/profileApi.ts

import { API_BASE } from './apiConfig';
import { authFetch } from './authFetch';

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
     phoneNumber?: string;
    address?: string;
    profileImageUrl?: string;
}

export interface UserProfileResponse extends ApiResponse {
  
  profile?: UserProfile;
  
}


export interface VerifyPasswordResponse extends ApiResponse {}

export interface ChangePasswordResponse extends ApiResponse {
  forceLogout?: boolean;
}

export interface RequestEmailChangeResponse extends ApiResponse {
  expiresIn?: number;
}

export interface VerifyEmailOtpResponse extends ApiResponse {}

async function parseResponse<T>(response: Response): Promise<T> {
    console.log("STATUS =", response.status);
  console.log("CONTENT-TYPE =", response.headers.get("content-type"));


  const text = await response.text();

  console.log("RAW RESPONSE =", text);

  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}

/**
 * GET /profile/me
 */
export async function getMyProfile(): Promise<UserProfileResponse> {
  
  const response = await authFetch(
    `${API_BASE}/profile/me`,
    {
      method: 'GET',
    }
  );

  return parseResponse<UserProfileResponse>(response);
}

/**
 * POST /profile/verify-current-password
 */
export async function verifyCurrentPassword(
  currentPassword: string
): Promise<VerifyPasswordResponse> {
  const response = await authFetch(
    `${API_BASE}/profile/verify-current-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword,
      }),
    }
  );

  return parseResponse<VerifyPasswordResponse>(response);
}

/**
 * POST /profile/change-password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<ChangePasswordResponse> {
  const response = await authFetch(
    `${API_BASE}/profile/change-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    }
  );

  return parseResponse<ChangePasswordResponse>(response);
}

/**
 * POST /profile/request-email-change
 */
export async function requestEmailChange(
  currentPassword: string,
  newEmail: string
): Promise<RequestEmailChangeResponse> {
  const response = await authFetch(
    `${API_BASE}/profile/request-email-change`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword,
        newEmail,
      }),
    }
  );

  return parseResponse<RequestEmailChangeResponse>(response);
}

/**
 * POST /profile/verify-email-otp
 */
export async function verifyEmailOtp(
    newEmail: string,
    otp: string
): Promise<VerifyEmailOtpResponse> {

    const response = await authFetch(
        `${API_BASE}/profile/verify-email-otp`,
        {
            method: 'POST',
            headers: {
                'Content-Type':'application/json',
            },
            body: JSON.stringify({
                newEmail,
                otp,
            }),
        }
    );

    return parseResponse(response);
}


/**
 * POST /profile/resend-email-otp
 */
export async function resendEmailOtp(): Promise<ApiResponse> {
  const response = await authFetch(
    `${API_BASE}/profile/resend-email-otp`,
    {
      method: 'POST',
    }
  );

  return parseResponse<ApiResponse>(response);
}