import { ADMIN_API_BASE, API_BASE } from './apiConfig';
import { authFetch } from './authFetch';

function apiErrorMessage(
  data: { message?: string; errors?: { msg?: string }[] },
  fallback: string
): string {
  if (data.message) return data.message;
  if (data.errors?.length) return data.errors[0].msg ?? fallback;
  return fallback;
}

// parseJson from github or main latest gitpull
// async function parseJson<T>(response: Response, fallback: string): Promise<T> {
//   const data = await response.json();
//   if (!response.ok) {
//     throw new Error(apiErrorMessage(data, fallback));
//   }
//   return data as T;
// }


// parseJson latest to address the case where response is not json
async function parseJson<T>(response: Response, fallback: string): Promise<T> {
  const text = await response.text();

  try {
    const data = JSON.parse(text);

    if (!response.ok) {
      throw new Error(apiErrorMessage(data, fallback));
    }

    return data as T;
  } catch (err) {
    console.error('Invalid JSON response:', text);
    throw new Error(fallback);
  }
}


export type PaginatedComplaints = {
  complaints: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
};

export type PaginatedUsers = {
  users: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
};

export type PaginatedActivityLogs = {
  logs: Record<string, unknown>[];
  total: number;
  page: number;
};

export type AdminComplaintDetail = Record<string, unknown>;

export type ComplaintActivityLog = {
  activity_log_id: string;
  action_type: string;
  old_value?: string | null;
  new_value?: string | null;
  description?: string | null;
  created_at: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
};

export type AdminUser = {
  user_id: string;
  user_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string | null;
  address?: string | null;
  profile_image_url?: string | null;
  role_id: number;
  role_name: string;
  is_verified: boolean;
  is_active: boolean;
  verification_status?: string;
  verification_type?: string | null;
  document_url?: string | null;
  created_at?: string;
};

export type AdminComplaint = {
  complaint_id: string;
  reference_id: string;
  title: string;
  status: string;
  priority_level: string;
  category_name: string;
  location_text?: string | null;
  description: string;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
  assigned_to_first_name?: string | null;
  assigned_to_last_name?: string | null;
};

export async function fetchAdminComplaints(params: {
  page: number;
  pageSize: number;
  statusGroup?: 'active' | 'closed' | 'resolved';
}): Promise<PaginatedComplaints> {
  const q = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.statusGroup) q.set('statusGroup', params.statusGroup);

  const response = await authFetch(`${API_BASE}/complaints?${q.toString()}`);
  const data = await parseJson<{
    complaints?: Record<string, unknown>[];
    total?: number;
    page?: number;
    pageSize?: number;
  }>(response, 'Failed to load complaints');

  return {
    complaints: data.complaints ?? [],
    total: data.total ?? 0,
    page: data.page ?? params.page,
    pageSize: data.pageSize ?? params.pageSize,
  };
}

// export async function fetchAdminComplaintDetails(
//   complaintId: string
// ): Promise<AdminComplaintDetail> {
//   const response = await authFetch(
//     // `${ADMIN_API_BASE}/admin/complaints/${complaintId}/details`
//     // `${API_BASE}/complaints/${complaintId}/details`
//     `${API_BASE}/complaints/${encodeURIComponent(complaintId)}/details`
//   );
//   return parseJson<AdminComplaintDetail>(response, 'Failed to load complaint details');
// }

export async function fetchAdminComplaintDetails(complaintId: string) {
  const response = await authFetch(
    // `${API_BASE}/complaints/${encodeURIComponent(complaintId)}/details`
    // `${API_BASE}/complaints/${complaintId}/details`
    `${API_BASE}/admin/complaints/${complaintId}/details`
  );

  return parseJson(response, 'Failed to load complaint details');
}

export async function fetchAdminComplaint(complaintId: string): Promise<AdminComplaint | null> {
  const response = await authFetch(`${API_BASE}/complaints/${complaintId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await parseJson<{ data?: AdminComplaint }>(response, 'Failed to load complaint');
  return data.data ?? null;
}

export async function fetchComplaintActivityLogs(
  complaintId: string
): Promise<ComplaintActivityLog[]> {
  const response = await authFetch(`${API_BASE}/activity-logs/complaint/${complaintId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await parseJson<{ logs?: ComplaintActivityLog[] }>(
    response,
    'Failed to load activity logs'
  );
  return data.logs ?? [];
}

export async function fetchUsers(params: {
  roleId: number;
  page: number;
  pageSize: number;
  search?: string;
}): Promise<PaginatedUsers> {
  const q = new URLSearchParams({
    roleId: String(params.roleId),
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.search) q.set('search', params.search);

  const response = await authFetch(`${API_BASE}/users?${q.toString()}`);
  const data = await parseJson<{
    users?: Record<string, unknown>[];
    total?: number;
    page?: number;
    pageSize?: number;
  }>(response, 'Failed to load users');

  return {
    users: data.users ?? [],
    total: data.total ?? 0,
    page: data.page ?? params.page,
    pageSize: data.pageSize ?? params.pageSize,
  };
}

export async function fetchUsersByVerificationStatus(
  status: 'pending' | 'approved' | 'rejected'
): Promise<AdminUser[]> {
  const response = await authFetch(
    `${API_BASE}/users?roleId=1&verificationStatus=${status}`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  const data = await parseJson<{ users?: AdminUser[] }>(
    response,
    'Failed to load verifications'
  );
  return data.users ?? [];
}

export async function fetchUserById(userId: string): Promise<AdminUser | null> {
  const response = await authFetch(`${API_BASE}/users/${userId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await parseJson<{ user?: AdminUser }>(response, 'Unable to load user details');
  return data.user ?? null;
}

export async function reviewUserVerification(
  userId: string,
  verificationStatus: 'approved' | 'rejected',
  remarks?: string
): Promise<void> {
  const body: { verificationStatus: string; remarks?: string } = { verificationStatus };
  if (remarks) body.remarks = remarks;

  const response = await authFetch(`${API_BASE}/users/${userId}/verification/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  await parseJson(response, 'Unable to update verification');
}

export async function setUserActiveStatus(
  userId: string,
  action: 'activate' | 'deactivate'
): Promise<void> {
  const response = await authFetch(`${API_BASE}/users/${userId}/${action}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  await parseJson(response, 'Unable to update user status');
}

export async function fetchActivityLogs(params: {
  mode: 'complaint' | 'user';
  targetId: string;
  page: number;
  pageSize: number;
  sortDir: 'asc' | 'desc';
  description?: string;
  performedBy?: string;
}): Promise<PaginatedActivityLogs> {
  const q = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    sortBy: 'created_at',
    sortDir: params.sortDir,
  });
  if (params.description) q.set('description', params.description);
  if (params.performedBy) q.set('performedBy', params.performedBy);

  const base =
    params.mode === 'complaint'
      ? `${API_BASE}/complaints/${encodeURIComponent(params.targetId)}/activity-logs`
      : `${API_BASE}/users/${encodeURIComponent(params.targetId)}/activity-logs`;

  const response = await authFetch(`${base}?${q.toString()}`);
  const data = await parseJson<{ logs?: Record<string, unknown>[]; total?: number; page?: number }>(
    response,
    'Failed to load activity logs'
  );

  return {
    logs: data.logs ?? [],
    total: data.total ?? 0,
    page: data.page ?? params.page,
  };
}

export async function createUser(payload: {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  role_id: number;
  password?: string;
}): Promise<AdminUser> {
  const response = await authFetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJson<{ user?: AdminUser }>(response, 'Failed to create user');
  if (!data.user) {
    throw new Error('Create user response did not include a user');
  }
  return data.user;
}
