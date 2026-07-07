// Filepath = frontend/components/profile/VerifyEmailOtpStep.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from 'react-native';

import { AppIcon } from '../common/AppIcon';
import {
  verifyEmailOtp,
  resendEmailOtp,
} from '../../utils/profileApi';

interface Props {
  email: string;
  onVerified: () => void;
}

type StatusModalState = {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  onConfirm?: () => void;
};

const initialStatusModal: StatusModalState = {
  visible: false,
  type: 'success',
  title: '',
  message: '',
};

export default function VerifyEmailOtpStep({
  email,
  onVerified,
}: Props) {
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);

  const [resending, setResending] =
    useState(false);

  const [error, setError] = useState('');

  const [statusModal, setStatusModal] =
    useState<StatusModalState>(
      initialStatusModal
    );

  function showStatus(
    type: 'success' | 'error',
    title: string,
    message: string,
    callback?: () => void
  ) {
    setStatusModal({
      visible: true,
      type,
      title,
      message,
      onConfirm: callback,
    });
  }

  function closeStatusModal() {
    const callback = statusModal.onConfirm;

    setStatusModal(initialStatusModal);

    callback?.();
  }

  async function handleVerify() {
    if (!otp.trim()) {
      setError('OTP is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response =
        await verifyEmailOtp(
          email,
          otp.trim()
        );

      if (!response.success) {
        throw new Error(
          response.message ??
            'OTP verification failed.'
        );
      }

      showStatus(
        'success',
        'Email Updated',
        'Your email address has been updated successfully.',
        onVerified
      );
    } catch (err: any) {
      showStatus(
        'error',
        'Verification Failed',
        err.message
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      setResending(true);

      const response =
        await resendEmailOtp();

      if (!response.success) {
        throw new Error(
          response.message ??
            'Unable to resend OTP.'
        );
      }

      showStatus(
        'success',
        'OTP Sent',
        `A new verification code has been sent to ${email}.`
      );
    } catch (err: any) {
      showStatus(
        'error',
        'Resend Failed',
        err.message
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <View>

      <Text style={styles.title}>
        Verify Email Address
      </Text>

      <Text style={styles.description}>
        Enter the verification code sent to

        {'\n\n'}

        <Text style={styles.email}>
          {email}
        </Text>
      </Text>

      <TextInput
        style={styles.input}
        placeholder="6-digit OTP"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />

      {!!error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>
            Verify OTP
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={handleResend}
        disabled={resending}
      >
        <Text style={styles.linkText}>
          {resending
            ? 'Sending...'
            : 'Resend OTP'}
        </Text>
      </TouchableOpacity>

      <StatusModal
        state={statusModal}
        onClose={closeStatusModal}
      />

    </View>
  );
}

/* ---------- Shared Status Modal ---------- */

export function StatusModal({
  state,
  onClose,
}: {
  state: StatusModalState;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={state.visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.card}>

          <View
            style={[
              modalStyles.circle,
              state.type === 'success'
                ? modalStyles.successCircle
                : modalStyles.errorCircle,
            ]}
          >
            <AppIcon
              name={state.type === 'success' ? 'checkmark' : 'close'}
              size={28}
              color={state.type === 'success' ? '#16a34a' : '#dc2626'}
            />
          </View>

          <Text style={modalStyles.title}>
            {state.title}
          </Text>

          <Text style={modalStyles.message}>
            {state.message}
          </Text>

          <TouchableOpacity
            style={[
              modalStyles.button,
              state.type === 'success'
                ? modalStyles.successButton
                : modalStyles.errorButton,
            ]}
            onPress={onClose}
          >
            <Text style={modalStyles.buttonText}>
              {state.type === 'success'
                ? 'Continue'
                : 'Try Again'}
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },

  description: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 22,
  },

  email: {
    fontWeight: '700',
    color: '#2563eb',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },

  error: {
    color: '#dc2626',
    marginBottom: 12,
  },

  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  linkButton: {
    marginTop: 18,
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
    backgroundColor: 'rgba(0,0,0,.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },

  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  successCircle: {
    backgroundColor: '#DCFCE7',
  },

  errorCircle: {
    backgroundColor: '#FEE2E2',
  },

  icon: {
    fontSize: 28,
    fontWeight: '700',
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },

  message: {
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },

  button: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },

  successButton: {
    backgroundColor: '#16A34A',
  },

  errorButton: {
    backgroundColor: '#DC2626',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});