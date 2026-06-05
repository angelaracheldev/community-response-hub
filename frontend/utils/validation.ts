export type FieldErrors = Record<string, string>;

export type StructuredAddress = {
  street: string;
  subdivision: string;
  city: string;
  province: string;
  postalCode: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(?:\+63|0)9\d{9}$/;
const POSTAL_RE = /^\d{4}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim().toLowerCase());
}

export function parseFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? '';
  const lastName = parts.slice(1).join(' ') || 'N/A';
  return { firstName, lastName };
}

export function formatStructuredAddress(address: StructuredAddress): string {
  return [
    address.street.trim(),
    address.subdivision.trim(),
    address.city.trim(),
    address.province.trim(),
    address.postalCode.trim(),
  ]
    .filter(Boolean)
    .join(', ');
}

export function validateRegisterStep1(fields: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.fullName.trim()) {
    errors.fullName = 'Full name is required';
  }

  const email = fields.email.trim();
  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!fields.password) {
    errors.password = 'Password is required';
  } else if (fields.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!fields.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (fields.confirmPassword !== fields.password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
}

export function validateRegisterStep2(fields: {
  phone: string;
  address: StructuredAddress;
}): FieldErrors {
  const errors: FieldErrors = {};

  const phone = fields.phone.trim();
  if (!phone) {
    errors.phone = 'Phone number is required';
  } else if (!PHONE_RE.test(phone.replace(/\s/g, ''))) {
    errors.phone = 'Use a valid PH mobile number (e.g. 09171234567)';
  }

  if (!fields.address.street.trim()) {
    errors.street = 'Street / house no. is required';
  }
  if (!fields.address.subdivision.trim()) {
    errors.subdivision = 'Subdivision / barangay is required';
  }
  if (!fields.address.city.trim()) {
    errors.city = 'City is required';
  }
  if (!fields.address.province.trim()) {
    errors.province = 'Province is required';
  }
  if (!fields.address.postalCode.trim()) {
    errors.postalCode = 'Postal code is required';
  } else if (!POSTAL_RE.test(fields.address.postalCode.trim())) {
    errors.postalCode = 'Enter a valid 4-digit postal code';
  }

  return errors;
}

export function validateRegisterStep3(fields: {
  hasIdFile: boolean;
  addressConfirmed: boolean;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.hasIdFile) {
    errors.idFile = 'Upload a photo of your valid ID';
  }

  if (!fields.addressConfirmed) {
    errors.addressConfirmed = 'Confirm that your ID shows the address you entered';
  }

  return errors;
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
