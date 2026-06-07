import { API_BASE } from './apiConfig';
import { getResidentToken } from './residentAuth';
import { buildComplaintMediaFormData } from './complaintUpload';
import * as ImagePicker from 'expo-image-picker';

const MEDIA_BATCH_SIZE = 5;

export type CreateComplaintPayload = {
  categoryId: number;
  title: string;
  description: string;
  locationText: string;
};

export type ComplaintRecord = {
  complaint_id: string;
  reference_id: string;
  reported_by?: string;
  status: string;
  title: string;
  description: string;
  location_text: string;
  category_id: number;
  category_name?: string;
  remarks?: string | null;
  created_at: string;
  updated_at?: string;
  assigned_to?: string | null;
  assigned_to_first_name?: string | null;
  assigned_to_last_name?: string | null;
};

export type ComplaintMedia = {
  media_id: string;
  complaint_id: string;
  uploaded_by: string;
  media_url: string;
  media_type: 'image' | 'video';
  uploaded_at: string;
};

function apiErrorMessage(
  data: { message?: string; errors?: { msg?: string }[] },
  fallback: string
): string {
  if (data.message) return data.message;
  if (data.errors?.length) return data.errors[0].msg ?? fallback;
  return fallback;
}

async function getAuthToken(): Promise<string> {
  const token = await getResidentToken();
  if (!token) throw new Error('You must be logged in to submit a complaint.');
  return token;
}

export function formatComplaintStatus(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    under_review: 'Under Review',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
  };
  return labels[status] ?? status;
}

export function formatAssigneeName(complaint: ComplaintRecord): string {
  if (complaint.assigned_to_first_name) {
    return `${complaint.assigned_to_first_name} ${complaint.assigned_to_last_name ?? ''}`.trim();
  }
  return 'Unassigned';
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export async function createComplaint(payload: CreateComplaintPayload): Promise<ComplaintRecord> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(apiErrorMessage(data, 'Unable to create complaint'));
  }

  return data.data as ComplaintRecord;
}

export async function uploadComplaintMedia(
  referenceId: string,
  assets: ImagePicker.ImagePickerAsset[]
): Promise<void> {
  const token = await getAuthToken();

  for (let i = 0; i < assets.length; i += MEDIA_BATCH_SIZE) {
    const batch = assets.slice(i, i + MEDIA_BATCH_SIZE);
    const formData = await buildComplaintMediaFormData(batch);

    const response = await fetch(`${API_BASE}/complaints/${encodeURIComponent(referenceId)}/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(apiErrorMessage(data, 'Unable to upload evidence'));
    }
  }
}

export async function deleteFailedComplaint(referenceId: string): Promise<void> {
  const token = await getAuthToken();
  await fetch(`${API_BASE}/complaints/${encodeURIComponent(referenceId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchMyComplaints(): Promise<ComplaintRecord[]> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}/complaints/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(apiErrorMessage(data, 'Unable to load complaints'));
  }

  return (data.complaints ?? []) as ComplaintRecord[];
}

export async function fetchComplaintByReferenceId(referenceId: string): Promise<ComplaintRecord> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}/complaints/${encodeURIComponent(referenceId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(apiErrorMessage(data, 'Unable to load complaint'));
  }

  return data.data as ComplaintRecord;
}

export async function fetchComplaintMedia(referenceId: string): Promise<ComplaintMedia[]> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}/complaints/${encodeURIComponent(referenceId)}/media`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(apiErrorMessage(data, 'Unable to load evidence'));
  }

  return (data.data ?? []) as ComplaintMedia[];
}

export async function cancelComplaint(
  referenceId: string,
  cancellationReason: string
): Promise<ComplaintRecord> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}/complaints/${encodeURIComponent(referenceId)}/cancel`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cancellationReason }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(apiErrorMessage(data, 'Unable to cancel complaint'));
  }

  return data.data as ComplaintRecord;
}

export function canCancelComplaint(status: string): boolean {
  return status === 'pending' || status === 'assigned';
}

export function splitComplaintMedia(
  media: ComplaintMedia[],
  reportedBy: string
): { residentEvidence: ComplaintMedia[]; resolutionEvidence: ComplaintMedia[] } {
  const residentEvidence = media.filter((item) => item.uploaded_by === reportedBy);
  const resolutionEvidence = media.filter((item) => item.uploaded_by !== reportedBy);
  return { residentEvidence, resolutionEvidence };
}
