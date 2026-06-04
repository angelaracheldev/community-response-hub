import React, { useState } from 'react';
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
import { Link, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { API_BASE } from '../../utils/apiConfig';

export default function LoginScreen() {
  const router = useRouter();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please fill out all fields');
      return;
    }

    setIsLoading(true);

    try {
      // 2. Exact alignment with Swagger doc path: /auth/login
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(), // Normalize email strings
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login Success Data Matrix:', data);
        
        // 3. Persist JWT Token securely for global authorization headers
        // Adjust 'data.token' based on your exact backend payload response keys (e.g., data.accessToken)
        if (data.token) {
          await SecureStore.setItemAsync('userToken', data.token);
        }

        router.replace('/(resident)/home');
      } else {
        alert(data.message || 'Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('API Network Connectivity Error:', error);
      alert('Network connectivity error. Please check your connection or backend server.');
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.push('/')} 
            style={styles.backButton}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text style={[styles.backButtonText, isLoading && { opacity: 0.5 }]}>← Back</Text>
          </TouchableOpacity>

          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Log in to access your community dashboard and manage complaints.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secureText}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setSecureText(!secureText)}
                  style={styles.toggleButton}
                  disabled={isLoading}
                >
                  <Text style={styles.toggleText}>
                    {secureText ? 'Show' : 'Hide'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => alert('Forgot password functionality coming soon!')}
                style={{ marginTop: 8, alignSelf: 'flex-end' }}
                disabled={isLoading}
              >
                <Text style={[styles.forgotPasswordText, isLoading && { opacity: 0.5 }]}>Forgot?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.button, isLoading && styles.disabledButton]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.buttonText}> Authenticating...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild disabled={isLoading}>
              <TouchableOpacity>
                <Text style={[styles.linkText, isLoading && { opacity: 0.5 }]}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 450, 
    alignSelf: 'center', 
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingRight: 16,
    marginBottom: 24,
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4f46e5',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  toggleButton: {
    paddingHorizontal: 16,
  },
  toggleText: {
    color: '#4f46e5',
    fontWeight: '600',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    boxShadow: '0px 4px 6px -1px rgba(79, 70, 229, 0.2)',
  },
  disabledButton: {
    backgroundColor: '#a5b4fc',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4f46e5',
  },
});