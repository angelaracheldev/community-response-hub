import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getAuthToken } from '../../utils/sessionAuth';

export default function AdminLanding() {
  const router = useRouter();

  useEffect(() => {
    void (async () => {
      const token = await getAuthToken();
      router.replace(token ? '/(admin)/dashboard' : '/(auth)/login');
    })();
  }, [router]);

  return null;
}
