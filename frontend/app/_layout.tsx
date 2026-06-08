import { Stack } from 'expo-router';
import { useSocket } from '../hooks/useSocket';
import { getAuthToken } from '../utils/sessionAuth';

export default function RootLayout() {
  useSocket(getAuthToken);

  return <Stack screenOptions={{ headerShown: false }} />;
}
