// Filepath = frontend/components/profile/VerifyCurrentPasswordStep.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { verifyCurrentPassword } from '../../utils/profileApi';
import { StatusModal } from './VerifyEmailOtpStep';

interface Props {
  onVerified: (currentPassword: string) => void;
}

type StatusModalState = {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  onConfirm?: () => void;
};

const initialModal: StatusModalState = {
  visible: false,
  type: 'success',
  title: '',
  message: '',
};

export default function VerifyCurrentPasswordStep({
  onVerified,
}: Props) {
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [status, setStatus] =
    useState<StatusModalState>(initialModal);

  const showStatus = (
    type: 'success' | 'error',
    title: string,
    message: string,
    callback?: () => void
  ) => {
    setStatus({
      visible: true,
      type,
      title,
      message,
      onConfirm: callback,
    });
  };

  const closeStatus = () => {
    const callback = status.onConfirm;

    setStatus(initialModal);

    callback?.();
  };

  async function handleVerify() {
    if (!password.trim()) {
      setError('Current password is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response =
        await verifyCurrentPassword(password);
      console.log("VERIFY RESPONSE =", response);
      if (!response.success) {
        throw new Error(
          response.message ||
            'Password verification failed.'
        );
      }

      showStatus(
        'success',
        'Password Verified',
        'Your password has been verified.',
        () => onVerified(password)
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

  return (
    <View>

      <Text style={styles.title}>
        Verify Current Password
      </Text>

      <Text style={styles.subtitle}>
        Please verify your current password
        before continuing.
      </Text>

      <TextInput
        secureTextEntry
        placeholder="Current Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      {!!error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      <TouchableOpacity
        style={styles.button}
        disabled={loading}
        onPress={handleVerify}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Verify Password
          </Text>
        )}
      </TouchableOpacity>

      <StatusModal
        state={status}
        onClose={closeStatus}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },

  subtitle: {
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
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

  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 14,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

});