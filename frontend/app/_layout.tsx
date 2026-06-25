import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { refreshAccessTokenIfNeeded } from '../utils/authFetch';

export default function RootLayout() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshAccessTokenIfNeeded();
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      {Platform.OS === 'web' ? (
        <Head>
          <title>Community Response Hub</title>
          <meta name="description" content="Report, track, and resolve community complaints" />
        </Head>
      ) : null}
      <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }} />
    </SafeAreaProvider>
  );
}
