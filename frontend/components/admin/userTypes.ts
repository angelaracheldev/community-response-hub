export type VerificationUser = {
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
