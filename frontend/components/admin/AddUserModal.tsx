import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { addUserModalStyles as styles } from '../../styles/admin/addUserModal';
import { API_BASE } from '../../utils/apiConfig';
import { getAuthToken } from '../../utils/sessionAuth';
import { validateAddUserForm, FieldErrors } from '../../utils/validation';
import { colors } from '../../styles/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const ROLES = [
  { label: 'Select Role', value: '' },
  { label: 'Resident', value: 'resident' },
  { label: 'Staff', value: 'admin' },
  { label: 'Responder', value: 'responder' },
];

export function AddUserModal({ visible, onClose, onSuccess }: Props) {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [idFile, setIdFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setFullName('');
    setRole('');
    setEmail('');
    setPassword('');
    setPhone('');
    setAddress('');
    setIdFile(null);
    setErrors({});
    setSuccess(false);
    onClose();
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'application/pdf'],
      });

      if (!result.canceled) {
        setIdFile(result.assets[0]);
        if (errors.idFile) {
          setErrors((prev) => {
            const next = { ...prev };
            delete next.idFile;
            return next;
          });
        }
      }
    } catch (err) {
      console.error('Pick document error', err);
    }
  };

  const handleSubmit = async () => {
    const formErrors = validateAddUserForm({
      fullName,
      role,
      email,
      password,
      phone,
      address,
      hasIdFile: !!idFile,
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const token = await getAuthToken();
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('role', role);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('phoneNumber', phone);
      formData.append('address', address);

      if (idFile) {
        const name = idFile.name;
        const type = idFile.mimeType || 'application/octet-stream';

        if (Platform.OS === 'web') {
          const response = await fetch(idFile.uri);
          const blob = await response.blob();
          formData.append('file', blob, name);
        } else {
          formData.append('file', {
            uri: idFile.uri,
            name,
            type,
          } as any);
        }
      }

      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data', // Fetch sets this automatically for FormData
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const mapped: FieldErrors = {};
          data.errors.forEach((e: any) => {
            mapped[e.path || e.param] = e.msg;
          });
          setErrors(mapped);
        } else {
          Alert.alert('Error', data.message || 'Failed to create user');
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 3000);
    } catch (err) {
      console.error('Create user error', err);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Add New User</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll}>
            {success && (
              <View style={styles.successBox}>
                <Text style={styles.successTitle}>User account created successfully.</Text>
                <Text style={styles.successMessage}>
                  Please provide the login credentials to the user and advise them to change their password immediately after logging in.
                </Text>
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={[styles.input, errors.fullName && styles.inputError]}
                  placeholder="e.g. Juan Dela Cruz"
                  value={fullName}
                  onChangeText={(val) => {
                    setFullName(val);
                    clearError('fullName');
                  }}
                />
                {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Role</Text>
                <View style={[styles.pickerContainer, errors.role && styles.inputError]}>
                  <Picker
                    selectedValue={role}
                    onValueChange={(val) => {
                      setRole(val);
                      clearError('role');
                    }}
                    style={styles.picker}
                  >
                    {ROLES.map((r) => (
                      <Picker.Item key={r.value} label={r.label} value={r.value} />
                    ))}
                  </Picker>
                </View>
                {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="e.g. juan@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    clearError('email');
                  }}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Minimum 8 characters"
                  secureTextEntry
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    clearError('password');
                  }}
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="e.g. 09171234567"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(val) => {
                    setPhone(val);
                    clearError('phone');
                  }}
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea, errors.address && styles.inputError]}
                  placeholder="Complete address"
                  multiline
                  numberOfLines={3}
                  value={address}
                  onChangeText={(val) => {
                    setAddress(val);
                    clearError('address');
                  }}
                />
                {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Valid ID / Proof of Address</Text>
                {idFile ? (
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {idFile.name}
                    </Text>
                    <TouchableOpacity onPress={() => setIdFile(null)}>
                      <Text style={styles.removeFile}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.uploadBox, errors.idFile && styles.uploadBoxError]}
                    onPress={pickDocument}
                  >
                    <Text style={styles.uploadTitle}>+ Select File</Text>
                    <Text style={styles.uploadSubtitle}>JPG, JPEG, PNG, or PDF (Max 5-10MB)</Text>
                  </TouchableOpacity>
                )}
                {errors.idFile && <Text style={styles.errorText}>{errors.idFile}</Text>}
              </View>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleClose} style={styles.cancelBtn} disabled={loading}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>Create User</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
