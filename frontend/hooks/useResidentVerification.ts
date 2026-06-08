import { useCallback, useEffect, useState } from 'react';
import { fetchCurrentUser } from '../utils/userProfile';

export function useResidentVerification() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const profile = await fetchCurrentUser();
    setIsVerified(profile?.is_verified ?? false);
    setFirstName(profile?.first_name ?? '');
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { isVerified, firstName, loading, refresh };
}
