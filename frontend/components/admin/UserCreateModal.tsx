// Filepath = frontend\components\admin\UserCreateModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { colors } from '../../styles/theme';
import { createUser } from '../../utils/adminApi';

interface UserCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultRoleId: number; // 1 for Resident, 2 for Responder, 3 for Staff
}

export function UserCreateModal({ visible, onClose, onSuccess, defaultRoleId }: UserCreateModalProps) {
  const isResident = defaultRoleId === 1;
  const roleLabel = defaultRoleId === 1 ? 'Resident' : defaultRoleId === 2 ? 'Responder' : 'Staff';

  // Success Modal
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [resultSuccess, setResultSuccess] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [idFile, setIdFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setAddress('');

      setIdFile(null);
      setErrorMessage(null);
    }
  }, [visible]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'application/pdf'],
      });

      if (!result.canceled) {
        setIdFile(result.assets[0]);
        setErrorMessage(null);
      }
    } catch (error) {
      console.error('Pick document error', error);
    }
  };

  const handleSubmit = async () => {
    console.log({
      firstName,
      lastName,
      email,
    });
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setErrorMessage('First name, last name, and email are required.');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('Address is required.');
      return;
    }

    if (isResident) {

      if (!idFile) {
        setErrorMessage('Valid ID document is required for residents.');
        return;
      }
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await createUser({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone_number: phone.trim() || null,
        role_id: Number(defaultRoleId),
        // address: isResident ? address.trim() : null,
        address: address.trim(),
        idFile: isResident && idFile
          ? {
            uri: idFile.uri,
            name: idFile.name,
            type: idFile.mimeType || 'application/octet-stream',
          }
          : null,
      });

      setResultSuccess(true);

      setResultTitle('User Account Created');

      setResultMessage(
        roleLabel === 'Resident'
          ? 'Resident account created successfully.'
          : `User account created successfully.\n\nLogin credentials have been sent to the user's email address.`
      );

      setResultModalVisible(true);
    } catch (error: any) {
console.error('Create user structural failure:', error);

if (error?.response) {
  console.error(
    'Server Response:',
    await error.response.text()
  );
}      // setErrorMessage(error.message || 'Something went wrong. Please check backend logs.');
      setResultSuccess(false);

      setResultTitle('Failed');

      setResultMessage(
        error.message ||
        'Unable to create user. \nEmail delivery failed. \nPlease try again.'
      );

      setResultModalVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New {roleLabel}</Text>

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

            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Complete residential address"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              editable={!submitting}
            />

            {isResident ? (
              <>


                <Text style={styles.label}>Valid ID / Proof of Address *</Text>
                {idFile ? (
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {idFile.name}
                    </Text>
                    <TouchableOpacity onPress={() => setIdFile(null)} disabled={submitting}>
                      <Text style={styles.removeFile}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadBox} onPress={pickDocument} disabled={submitting}>
                    <Text style={styles.uploadTitle}>+ Select File</Text>
                    <Text style={styles.uploadSubtitle}>JPG, JPEG, PNG, or PDF (Max 5-10MB)</Text>
                  </TouchableOpacity>
                )}
              </>

            ) : null}


          </ScrollView>
          <Modal
            visible={resultModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setResultModalVisible(false)}
          >
            <View style={styles.resultOverlay}>
              <View style={styles.resultContainer}>
                <Text
                  style={[
                    styles.resultIcon,
                    {
                      color: resultSuccess
                        ? '#16a34a'
                        : '#dc2626',
                    },
                  ]}
                >
                  {resultSuccess ? '✓' : '✕'}
                </Text>

                <Text style={styles.resultTitle}>
                  {resultTitle}
                </Text>

                <Text style={styles.resultMessage}>
                  {resultMessage}
                </Text>

                <TouchableOpacity
                  style={styles.resultButton}
                  onPress={() => {
                    setResultModalVisible(false);

                    if (resultSuccess) {
                      onSuccess();
                    }
                  }}
                >
                  <Text style={styles.resultButtonText}>
                    OK
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

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

  resultOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  resultContainer: {
    width: 380,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },

  resultIcon: {
    fontSize: 52,
    fontWeight: '700',
    marginBottom: 12,
  },

  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },

  resultMessage: {
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
    lineHeight: 22,
  },

  resultButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
  },

  resultButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary || '#007AFF',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9fafb',
  },
  fileName: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    marginRight: 8,
  },
  removeFile: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '500',
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
