// Filepath = frontend\app\(admin)\login.tsx
import { Redirect } from 'expo-router';

export default function AdminLogin() {
  return <Redirect href="/(auth)/login" />;
}
