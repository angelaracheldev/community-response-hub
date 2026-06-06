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
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE } from '../../utils/apiConfig';
import { extractAccessToken, setResidentToken } from '../../utils/residentAuth';

export default function LoginScreen() {
  const router = useRouter();

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Resend Verification State
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendPhone, setResendPhone] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationImageUri, setVerificationImageUri] = useState<string | null>(null);
  const [validationPassed, setValidationPassed] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

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
        
        const accessToken = extractAccessToken(data);
        if (accessToken) {
          await setResidentToken(accessToken);
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

  const validateResendVerification = async () => {
    if (!resendEmail || !resendPhone) {
      alert('Please enter both email and phone number');
      return;
    }

    setResendLoading(true);
    setResendMessage('Validating your information...');

    try {
      const response = await fetch(`${API_BASE}/resident/check-verification-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: resendEmail.trim().toLowerCase(),
          phone_number: resendPhone.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.canResend) {
        setValidationPassed(true);
        setResendMessage('Validation successful. Please upload your verification document.');
      } else {
        setResendMessage('');
        alert(data.message || 'Your information does not match any verification requests with failed status.');
      }
    } catch (error) {
      console.error('Validation error:', error);
      setResendMessage('');
      alert('Error validating information. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const pickVerificationImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setVerificationImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      alert('Error picking image. Please try again.');
    }
  };

  const submitResendVerification = async () => {
    if (!verificationImageUri) {
      alert('Please select a verification document image');
      return;
    }

    setResendLoading(true);
    setResendMessage('Uploading verification document...');

    try {
      const formData = new FormData();
      formData.append('email', resendEmail.trim().toLowerCase());
      formData.append('phone_number', resendPhone.trim());
      formData.append('file', {
        uri: verificationImageUri,
        name: `verification_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);

      const response = await fetch(`${API_BASE}/resident/resend-verification`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert('Verification document submitted successfully! Please wait for admin review.');
        // Reset resend modal state
        setShowResendModal(false);
        setResendEmail('');
        setResendPhone('');
        setVerificationImageUri(null);
        setValidationPassed(false);
        setResendMessage('');
      } else {
        alert(data.message || 'Failed to submit verification document.');
      }
    } catch (error) {
      console.error('Submit verification error:', error);
      alert('Error submitting verification document. Please try again.');
    } finally {
      setResendLoading(false);
      setResendMessage('');
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

      {/* Resend Verification Modal */}
      <Modal
        visible={showResendModal}
        animationType="slide"
        onRequestClose={() => !resendLoading && setShowResendModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => !resendLoading && setShowResendModal(false)}
              disabled={resendLoading}
            >
              <Text style={styles.modalCloseText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Resend Verification</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Verify Your Identity</Text>
              <Text style={styles.modalInstructionText}>
                Enter your email and phone number associated with your verification request.
              </Text>
            </View>

            {!validationPassed ? (
              <View style={styles.validationSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#9ca3af"
                    value={resendEmail}
                    onChangeText={setResendEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!resendLoading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+1 (555) 000-0000"
                    placeholderTextColor="#9ca3af"
                    value={resendPhone}
                    onChangeText={setResendPhone}
                    keyboardType="phone-pad"
                    editable={!resendLoading}
                  />
                </View>

                {resendMessage ? (
                  <View style={styles.messageBanner}>
                    <Text style={styles.messageText}>{resendMessage}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[styles.validateBtn, resendLoading && styles.disabledButton]}
                  onPress={validateResendVerification}
                  disabled={resendLoading}
                >
                  {resendLoading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.validateBtnText}>Verify Identity</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadSection}>
                <Text style={styles.sectionSubtitle}>Upload Your Verification Document</Text>

                {verificationImageUri ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: verificationImageUri }}
                      style={styles.previewImage}
                      resizeMode="contain"
                    />
                    <TouchableOpacity
                      style={styles.changeImageBtn}
                      onPress={pickVerificationImage}
                      disabled={resendLoading}
                    >
                      <Text style={styles.changeImageText}>Change Image</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadImageBtn}
                    onPress={pickVerificationImage}
                    disabled={resendLoading}
                  >
                    <Text style={styles.uploadImageText}>📁 Select Document Image</Text>
                  </TouchableOpacity>
                )}

                {resendMessage ? (
                  <View style={styles.messageBanner}>
                    <Text style={styles.messageText}>{resendMessage}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[styles.submitBtn, (resendLoading || !verificationImageUri) && styles.disabledButton]}
                  onPress={submitResendVerification}
                  disabled={resendLoading || !verificationImageUri}
                >
                  {resendLoading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Verification</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => {
                    setValidationPassed(false);
                    setVerificationImageUri(null);
                    setResendMessage('');
                  }}
                  disabled={resendLoading}
                >
                  <Text style={styles.backBtnText}>Back to Identity Verification</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  resendVerificationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  modalCloseText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  modalSection: {
    marginBottom: 32,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  modalInstructionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  validationSection: {
    marginBottom: 24,
  },
  uploadSection: {
    marginBottom: 24,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  messageBanner: {
    backgroundColor: '#ecfdf5',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  messageText: {
    color: '#065f46',
    fontSize: 14,
  },
  validateBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  validateBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  uploadImageBtn: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    marginBottom: 16,
  },
  uploadImageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4f46e5',
  },
  imagePreviewContainer: {
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    marginBottom: 12,
  },
  changeImageBtn: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4f46e5',
  },
  submitBtn: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  backBtn: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4f46e5',
  },
});