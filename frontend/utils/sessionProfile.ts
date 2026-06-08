import { fetchCurrentUser } from './userProfile';

export async function fetchSessionDisplayName(
  getToken: () => string | null | Promise<string | null>
): Promise<string | null> {
  const token = await getToken();
  if (!token) return null;

  const user = await fetchCurrentUser();
  if (!user) return null;

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  if (fullName) return fullName;
  if (user.email) return user.email.split('@')[0];
  return null;
}
