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
  status: string;
  title: string;
  description: string;
  location_text: string;
  category_id: number;
  category_name?: string;
  created_at: string;
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
  complaintId: string,
  assets: ImagePicker.ImagePickerAsset[]
): Promise<void> {
  const token = await getAuthToken();

  for (let i = 0; i < assets.length; i += MEDIA_BATCH_SIZE) {
    const batch = assets.slice(i, i + MEDIA_BATCH_SIZE);
    const formData = await buildComplaintMediaFormData(batch);

    const response = await fetch(`${API_BASE}/complaints/${complaintId}/media`, {
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

export async function deleteFailedComplaint(complaintId: string): Promise<void> {
  const token = await getAuthToken();
  await fetch(`${API_BASE}/complaints/${complaintId}`, {
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

export function formatComplaintStatus(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending Review',
    under_review: 'Under Review',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
  };
  return labels[status] ?? status;
}
