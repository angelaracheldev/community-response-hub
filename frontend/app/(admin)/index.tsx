import { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAdminToken } from '../../utils/authStorage';
import { adminIndexStyles as styles } from '../../styles/app/adminIndex';

export default function AdminLanding() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    setHasToken(!!token);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Admin Module</Text>
        <Text style={styles.subtitle}>Manage users, complaints, and community incidents.</Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#2563EB' }]}
          onPress={() => router.push('/(admin)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Admin Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#10B981' }]}
          onPress={() => router.push(hasToken ? '/(admin)/dashboard' : '/(admin)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{hasToken ? 'Continue to Dashboard' : 'Go to Dashboard'}</Text>
        </TouchableOpacity>

        <Text style={styles.note}>Use <Text style={styles.code}>admin@example.com</Text> and password <Text style={styles.code}>Admin123!</Text> for local testing.</Text>
      </View>
    </SafeAreaView>
  );
}


