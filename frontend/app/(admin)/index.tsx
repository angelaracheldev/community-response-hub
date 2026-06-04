import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAdminToken } from '../../utils/authStorage';

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  note: {
    marginTop: 20,
    color: '#6b7280',
    textAlign: 'center',
    fontSize: 14,
  },
  code: {
    fontFamily: 'monospace',
    color: '#111827',
  },
});
