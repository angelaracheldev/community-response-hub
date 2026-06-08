import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { useSocket } from '../hooks/useSocket';
import { refreshAccessTokenIfNeeded } from '../utils/authFetch';
import { getAuthToken } from '../utils/sessionAuth';

export default function RootLayout() {
  useSocket(getAuthToken);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshAccessTokenIfNeeded();
      }
    });
    return () => subscription.remove();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
