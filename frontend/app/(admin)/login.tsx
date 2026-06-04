import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { setAdminToken, getAdminToken } from '../../utils/authStorage';
import { API_BASE } from '../../utils/apiConfig';

const API_URL = `${API_BASE}/auth/login`;

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin123!');
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (token) {
      router.replace('/(admin)/dashboard');
    }
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      alert('Please provide email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Login failed.');
        return;
      }

      setAdminToken(data.data.tokens.accessToken);
      router.replace('/(admin)/dashboard');
    } catch (error) {
      console.error('Admin login error:', error);
      alert('Unable to reach backend. Make sure it is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>Admin Login</Text>
          <Text style={styles.description}>Sign in with your admin credentials to manage users and complaints.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="admin@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry={secureText}
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setSecureText(!secureText)}
                disabled={isLoading}
              >
                <Text style={styles.toggleText}>{secureText ? 'Show' : 'Hide'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/(admin)')} disabled={isLoading}>
            <Text style={styles.linkText}>Back to Admin Landing</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    color: '#6b7280',
    marginBottom: 28,
    lineHeight: 22,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    marginBottom: 8,
    color: '#374151',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#111827',
    fontSize: 16,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleButton: {
    marginLeft: 12,
  },
  toggleText: {
    color: '#2563EB',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  linkButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  linkText: {
    color: '#2563EB',
    fontWeight: '600',
  },
});
