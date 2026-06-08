import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE } from '../../utils/apiConfig';
import { connectSocket } from '../../hooks/useSocket';
import { extractAccessToken, extractRefreshToken, setAuthTokens } from '../../utils/sessionAuth';
import { fetchCurrentUser } from '../../utils/userProfile';
import { authLoginStyles as styles } from '../../styles/auth/login';

export default function LoginScreen() {
  const router = useRouter();

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Custom User-Friendly Error States
  const [loginError, setLoginError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Resend Verification State
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendPhone, setResendPhone] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationImageUri, setVerificationImageUri] = useState<string | null>(null);
  const [validationPassed, setValidationPassed] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // Helpers to trigger feedback messages
  const triggerLoginError = (msg: string) => {
    setLoginError(msg);
    // Clear after 5 seconds
    setTimeout(() => setLoginError(null), 5000);
  };

  const triggerModalError = (msg: string) => {
    setModalError(msg);
    setTimeout(() => setModalError(null), 5000);
  };

  const triggerSuccessToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 6000);
  };

  const handleLogin = async () => {
    setLoginError(null);

    if (!email || !password) {
      triggerLoginError('Please fill out all fields.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const accessToken = extractAccessToken(data);
        const refreshToken = extractRefreshToken(data);
        if (!accessToken || !refreshToken) {
          triggerLoginError('Login succeeded but session tokens were not returned.');
          return;
        }

        const loginUser = (data as { data?: { user?: { role_name?: string } } })?.data?.user;
        let roleName = loginUser?.role_name;

        await setAuthTokens(accessToken, refreshToken);
        await connectSocket();

        if (!roleName) {
          const profile = await fetchCurrentUser();
          roleName = profile?.role_name;
        }

        if (roleName === 'admin') {
          router.replace('/(admin)/dashboard');
        } else if (roleName === 'responder') {
          router.replace('/(respondent)/dashboard');
        } else if (roleName === 'resident') {
          router.replace('/(resident)/home');
        } else {
          triggerLoginError('This account is not authorized to sign in here.');
        }
      } else {
        triggerLoginError(data.message || 'Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('API Network Connectivity Error:', error);
      triggerLoginError('Network connectivity error. Please check your connection or backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateResendVerification = async () => {
    setModalError(null);

    if (!resendEmail || !resendPhone) {
      triggerModalError('Please enter both email and phone number.');
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
        triggerModalError(data.message || 'Your information does not match any failed verification requests.');
      }
    } catch (error) {
      console.error('Validation error:', error);
      setResendMessage('');
      triggerModalError('Error validating information. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const pickVerificationImage = async () => {
    setModalError(null);
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
      triggerModalError('Error picking image. Please try again.');
    }
  };

  const submitResendVerification = async () => {
    setModalError(null);

    if (!verificationImageUri) {
      triggerModalError('Please select a verification document image.');
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
        // Success Handling without Alert: Close Modal & trigger floating Toast banner
        setShowResendModal(false);
        triggerSuccessToast('Verification document submitted successfully! Please wait for admin review.');
        
        // Reset states
        setResendEmail('');
        setResendPhone('');
        setVerificationImageUri(null);
        setValidationPassed(false);
        setResendMessage('');
      } else {
        triggerModalError(data.message || 'Failed to submit verification document.');
      }
    } catch (error) {
      console.error('Submit verification error:', error);
      triggerModalError('Error submitting verification document. Please try again.');
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
        {/* Floating Global Success Toast */}
        {successToast ? (
          <View style={styles.floatingToastContainer}>
            <Text style={styles.floatingToastText}>✅ {successToast}</Text>
          </View>
        ) : null}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Log in to access your community dashboard and manage complaints.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            
            {/* Inline Login Error Banner */}
            {loginError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️ {loginError}</Text>
              </View>
            ) : null}

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, loginError && styles.inputErrorBorder]}
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={(val) => { setEmail(val); setLoginError(null); }}
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
              <View style={[styles.passwordContainer, loginError && styles.inputErrorBorder]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={(val) => { setPassword(val); setLoginError(null); }}
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
                onPress={() => triggerLoginError('Forgot password functionality coming soon!')}
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

            {/* Inline Modal Error Banner */}
            {modalError ? (
              <View style={styles.modalErrorBanner}>
                <Text style={styles.modalErrorBannerText}>⚠️ {modalError}</Text>
              </View>
            ) : null}

            {!validationPassed ? (
              <View style={styles.validationSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={[styles.input, modalError && styles.inputErrorBorder]}
                    placeholder="you@example.com"
                    placeholderTextColor="#9ca3af"
                    value={resendEmail}
                    onChangeText={(val) => { setResendEmail(val); setModalError(null); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!resendLoading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={[styles.input, modalError && styles.inputErrorBorder]}
                    placeholder="+1 (555) 000-0000"
                    placeholderTextColor="#9ca3af"
                    value={resendPhone}
                    onChangeText={(val) => { setResendPhone(val); setModalError(null); }}
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
                    style={[styles.uploadImageBtn, modalError && styles.inputErrorBorder]}
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
                    setModalError(null);
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

