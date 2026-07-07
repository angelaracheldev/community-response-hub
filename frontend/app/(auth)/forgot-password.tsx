// Filepath = frontend\app\(auth)\forgot-password.tsx
import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
} from '../../utils/forgotPasswordApi';
import { AppIcon } from '../../components/common/AppIcon';
import { IconLabel } from '../../components/common/IconLabel';

type Step = 'email' | 'otp' | 'password';
type FeedbackModal = { type: 'success' | 'error'; title: string; message: string } | null;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackModal>(null);

  // ---- Step 1: request OTP ----
  const handleRequestOtp = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await requestPasswordResetOtp(email.trim().toLowerCase());
      if (data.success) {
        setStep('otp');
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Request OTP error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Step 2: verify OTP (with retry) ----
  const handleVerifyOtp = async () => {
    setError(null);
    if (!otp.trim()) {
      setError('Please enter the one-time password.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await verifyPasswordResetOtp(email.trim().toLowerCase(), otp.trim());
      if (data.success && data.resetToken) {
        setResetToken(data.resetToken);
        setStep('password');
      } else {
        setError(data.message || 'Incorrect code. Please try again.');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtp('');
    setError(null);
    await handleRequestOtp();
  };

  // ---- Step 3: set new password ----
  const handleResetPassword = async () => {
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError('Please fill out both password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await resetPassword(resetToken!, newPassword, confirmPassword);
      if (data.success) {
        setFeedback({
          type: 'success',
          title: 'Password Updated',
          message: 'Your password has been changed successfully. You can now log in.',
        });
      } else {
        setFeedback({
          type: 'error',
          title: 'Reset Failed',
          message: data.message || 'Could not reset password. Please try again.',
        });
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setFeedback({
        type: 'error',
        title: 'Network Error',
        message: 'Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeFeedback = () => {
    const wasSuccess = feedback?.type === 'success';
    setFeedback(null);
    if (wasSuccess) {
      router.replace('/(auth)/login');
    }
  };

  return (
    // Full-screen Modal + dark overlay + centered white card,
    // matching the FirstLoginWizard look & feel.
    <Modal visible animationType="fade" transparent onRequestClose={() => router.back()}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kbAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              {/* Step 1: Email */}
              {step === 'email' && (
                <>
                  <Text style={styles.title}>Forgot Password</Text>
                  <Text style={styles.description}>
                    Enter the email address linked to your account. We'll send you a one-time password.
                  </Text>

                  {error ? (
                    <IconLabel icon="warning-outline" iconColor="#DC2626" textStyle={styles.error}>
                      {error}
                    </IconLabel>
                  ) : null}

                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={(val) => { setEmail(val); setError(null); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleRequestOtp}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Send Code</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.linkButton} onPress={() => router.back()} disabled={isLoading}>
                    <Text style={styles.linkText}>Back to Login</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Step 2: OTP */}
              {step === 'otp' && (
                <>
                  <Text style={styles.title}>Verify Your Email</Text>
                  <Text style={styles.description}>
                    If the email address is valid, you will receive a one-time password via email. Please type it below.
                  </Text>

                  {error ? (
                    <IconLabel icon="warning-outline" iconColor="#DC2626" textStyle={styles.error}>
                      {error}
                    </IconLabel>
                  ) : null}

                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#9ca3af"
                    value={otp}
                    onChangeText={(val) => { setOtp(val); setError(null); }}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!isLoading}
                  />

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleVerifyOtp}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Verify Code</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.linkButton} onPress={handleResendOtp} disabled={isLoading}>
                    <Text style={styles.linkText}>Didn't get a code? Resend</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Step 3: New password */}
              {step === 'password' && (
                <>
                  <Text style={styles.title}>Set New Password</Text>
                  <Text style={styles.description}>
                    Choose a new password for your account. Must be at least 8 characters, with an uppercase letter, a lowercase letter, and a number.
                  </Text>

                  {error ? (
                    <IconLabel icon="warning-outline" iconColor="#DC2626" textStyle={styles.error}>
                      {error}
                    </IconLabel>
                  ) : null}

                  <TextInput
                    style={styles.input}
                    placeholder="New password"
                    placeholderTextColor="#9ca3af"
                    value={newPassword}
                    onChangeText={(val) => { setNewPassword(val); setError(null); }}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!isLoading}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor="#9ca3af"
                    value={confirmPassword}
                    onChangeText={(val) => { setConfirmPassword(val); setError(null); }}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!isLoading}
                  />

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Save New Password</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* Success / Error feedback modal — same pattern as VerifyOtpStep */}
      <Modal visible={!!feedback} transparent animationType="fade" onRequestClose={closeFeedback}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.card}>
            <View
              style={[
                modalStyles.iconCircle,
                feedback?.type === 'success' ? modalStyles.iconCircleSuccess : modalStyles.iconCircleError,
              ]}
            >
              <AppIcon
                name={feedback?.type === 'success' ? 'checkmark' : 'close'}
                size={28}
                color={feedback?.type === 'success' ? '#059669' : '#DC2626'}
              />
            </View>
            <Text style={modalStyles.title}>{feedback?.title}</Text>
            <Text style={modalStyles.message}>{feedback?.message}</Text>
            <TouchableOpacity
              style={[
                modalStyles.button,
                feedback?.type === 'success' ? modalStyles.buttonSuccess : modalStyles.buttonError,
              ]}
              onPress={closeFeedback}
            >
              <Text style={modalStyles.buttonText}>
                {feedback?.type === 'success' ? 'Go to Login' : 'Try Again'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Same overlay/container tokens as FirstLoginWizard
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  kbAvoid: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  description: {
    color: '#666',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  error: {
    color: '#dc2626',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  linkText: {
    color: '#2563eb',
    fontWeight: '600',
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircleSuccess: {
    backgroundColor: '#dcfce7',
  },
  iconCircleError: {
    backgroundColor: '#fee2e2',
  },
  iconText: {
    fontSize: 28,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    width: '100%',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonSuccess: {
    backgroundColor: '#16a34a',
  },
  buttonError: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});