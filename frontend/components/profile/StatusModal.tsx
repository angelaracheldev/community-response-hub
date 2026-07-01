// Filepath = frontend/components/profile/StatusModal.tsx

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export type StatusModalState = {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  buttonText?: string;
  onConfirm?: () => void;
};

interface Props {
  state: StatusModalState;
  onClose: () => void;
}

export const initialStatusModal: StatusModalState = {
  visible: false,
  type: 'success',
  title: '',
  message: '',
  buttonText: undefined,
  onConfirm: undefined,
};

export default function StatusModal({
  state,
  onClose,
}: Props) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={state.visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>

          <View
            style={[
              styles.iconCircle,
              state.type === 'success'
                ? styles.successCircle
                : styles.errorCircle,
            ]}
          >
            <Text
              style={[
                styles.icon,
                {
                  color:
                    state.type === 'success'
                      ? '#16a34a'
                      : '#dc2626',
                },
              ]}
            >
              {state.type === 'success' ? '✓' : '✕'}
            </Text>
          </View>

          <Text style={styles.title}>
            {state.title}
          </Text>

          <Text style={styles.message}>
            {state.message}
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              state.type === 'success'
                ? styles.successButton
                : styles.errorButton,
            ]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>
              {state.buttonText ??
                (state.type === 'success'
                  ? 'Continue'
                  : 'Try Again')}
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },

  iconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  successCircle: {
    backgroundColor: '#dcfce7',
  },

  errorCircle: {
    backgroundColor: '#fee2e2',
  },

  icon: {
    fontSize: 30,
    fontWeight: '700',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },

  message: {
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
    marginBottom: 24,
  },

  button: {
    width: '100%',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
  },

  successButton: {
    backgroundColor: '#16a34a',
  },

  errorButton: {
    backgroundColor: '#dc2626',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});