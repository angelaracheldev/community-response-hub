import { API_BASE } from './apiConfig';

export type Notification = {
  notification_id: string;
  user_id: string;
  type: string;
  entity_type: 'complaint' | 'verification';
  entity_id: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export type NotificationListResult = {
  notifications: Notification[];
  count: number;
  page: number;
  limit: number;
};

export type OpenNotificationResult = {
  entity_type: string;
  entity_id: string;
};

function apiErrorMessage(
  data: { message?: string; errors?: { msg?: string }[] },
  fallback: string
): string {
  if (data.message) return data.message;
  if (data.errors?.length) return data.errors[0].msg ?? fallback;
  return fallback;
}

export async function fetchNotifications(
  token: string,
  params?: { page?: number; limit?: number; is_read?: boolean }
): Promise<NotificationListResult> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.is_read !== undefined) query.set('is_read', String(params.is_read));

  const qs = query.toString();
  const url = `${API_BASE}/notifications${qs ? `?${qs}` : ''}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(apiErrorMessage(data, 'Unable to load notifications'));
  }

  return {
    notifications: data.notifications ?? [],
    count: data.count ?? 0,
    page: data.page ?? 1,
    limit: data.limit ?? 20,
  };
}

export async function fetchUnreadCount(token: string): Promise<number> {
  const response = await fetch(`${API_BASE}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(apiErrorMessage(data, 'Unable to load unread count'));
  }

  return data.count ?? 0;
}

export async function openNotification(
  token: string,
  notificationId: string
): Promise<OpenNotificationResult> {
  const response = await fetch(`${API_BASE}/notifications/${notificationId}/open`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(apiErrorMessage(data, 'Unable to open notification'));
  }

  return {
    entity_type: data.entity_type,
    entity_id: data.entity_id,
  };
}

export async function markAllNotificationsRead(token: string): Promise<number> {
  const response = await fetch(`${API_BASE}/notifications/read-all`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(apiErrorMessage(data, 'Unable to mark notifications as read'));
  }

  return data.updatedCount ?? 0;
}
