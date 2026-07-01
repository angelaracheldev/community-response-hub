// Filepath = frontend/components/profile/NewPasswordStep.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { changePassword } from '../../utils/profileApi';
import { StatusModal } from './VerifyEmailOtpStep';
import { router } from 'expo-router';
import { clearAuthToken } from '../../utils/sessionAuth';
import { disconnectSocket } from '../../hooks/useSocket';

interface Props {
  currentPassword: string;
  onFinished: () => void;
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

export default function NewPasswordStep({
  currentPassword,
  onFinished,
}: Props) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

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

  async function handleChangePassword() {
    if (!newPassword.trim()) {
      setError('New password is required.');
      return;
    }

    if (newPassword.length < 12) {
      setError(
        'Password must be at least 12 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setError(
        'Your new password must be different from your current password.'
      );
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await changePassword(
        currentPassword,
        newPassword,
        confirmPassword
      );

      console.log("CHANGE PASSWORD RESPONSE =", response);

      if (!response.success) {
        throw new Error(
          response.message || "Unable to change password."
        );
      }

      showStatus(
        "success",
        "Password Updated",
        response.forceLogout
          ? "Your password has been changed successfully. You will now be signed out."
          : response.message,
        async () => {
          if (response.forceLogout) {
            disconnectSocket();
            await clearAuthToken();
            router.replace("/(auth)/login");
            return;
          }

          onFinished();
        }
      );


    } catch (err: any) {
      showStatus(
        'error',
        'Password Change Failed',
        err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>

      <Text style={styles.title}>
        Create New Password
      </Text>

      <Text style={styles.subtitle}>
        Choose a strong password for your account.
      </Text>

      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {!!error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleChangePassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Change Password
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
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

});