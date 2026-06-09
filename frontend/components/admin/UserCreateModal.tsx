import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  ActivityIndicator, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import { colors } from '../../styles/theme';
import { createUser } from '../../utils/adminApi'; // Hooked directly into your API utilities

interface UserCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultRoleId: number; // 1 for Resident, 2 for Responder
}

export function UserCreateModal({ visible, onClose, onSuccess, defaultRoleId }: UserCreateModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset fields when the form visibility changes
  useEffect(() => {
    if (visible) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setErrorMessage(null);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('First name, last name, email, and temporary password are required.');
      return;
    }

    if (password.trim().length < 6) {
      setErrorMessage('Temporary password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      // Execute using your central API configuration rules
      await createUser({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone_number: phone.trim() || null,
        role_id: defaultRoleId,
        password: password.trim(),
      });

      onSuccess();
    } catch (error: any) {
      console.error('Create user structural failure:', error);
      setErrorMessage(error.message || 'Something went wrong. Please check backend logs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            Add New {defaultRoleId === 1 ? 'Resident' : 'Responder'}
          </Text>

          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <ScrollView style={styles.form} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor="#999"
              editable={!submitting}
            />

            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor="#999"
              editable={!submitting}
            />

            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!submitting}
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Optional phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              editable={!submitting}
            />

            <Text style={styles.label}>Temporary Password *</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Temporary password"
              placeholderTextColor="#999"
              secureTextEntry
              editable={!submitting}
            />
          </ScrollView>

          <View style={styles.btnRow}>
            <TouchableOpacity 
              style={[styles.btn, styles.btnCancel]} 
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.btnTextCancel}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btn, styles.btnSubmit]} 
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnTextSubmit}>Save User</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    color: '#111',
  },
  form: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 14,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 85,
  },
  btnCancel: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  btnSubmit: {
    backgroundColor: colors.primary || '#007AFF',
  },
  btnTextCancel: {
    color: '#374151',
    fontWeight: '500',
    fontSize: 14,
  },
  btnTextSubmit: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
});
