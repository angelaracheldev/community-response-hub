// Filepath = frontend/components/profile/EnterNewEmailStep.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { requestEmailChange } from '../../utils/profileApi';
import { StatusModal } from './VerifyEmailOtpStep';

interface Props {
  currentPassword: string;
  onOtpSent: (email: string) => void;
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

export default function EnterNewEmailStep({
  currentPassword,
  onOtpSent,
}: Props) {
  const [newEmail, setNewEmail] = useState('');

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

  async function handleContinue() {
    if (!newEmail.trim()) {
      setError('New email is required.');
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(newEmail.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response =
        await requestEmailChange(
          currentPassword,
          newEmail.trim()
        );

      if (!response.success) {
        throw new Error(
          response.message ??
            'Unable to request email change.'
        );
      }

      showStatus(
        'success',
        'OTP Sent',
        'A verification code has been sent to your new email address.',
        () => onOtpSent(newEmail.trim())
      );
    } catch (err: any) {
      showStatus(
        'error',
        'Request Failed',
        err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>

      <Text style={styles.title}>
        Change Email Address
      </Text>

      <Text style={styles.subtitle}>
        Enter your new email address. A verification
        code will be sent to it.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="New Email Address"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={newEmail}
        onChangeText={setNewEmail}
      />

      {!!error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleContinue}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Send Verification Code
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
    paddingVertical: 14,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

});