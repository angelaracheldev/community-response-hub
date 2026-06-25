// // Filepath = frontend/components/auth/ChangePasswordStep.tsx
// console.log('>>> ChangePasswordStep.tsx module START');
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
// } from 'react-native';


// import {
//   changeFirstLoginPassword,
// } from '../../utils/firstLoginApi';

// interface Props {
//   onChanged: () => void;
// }

// export default function ChangePasswordStep({
//   onChanged,
// }: Props) {
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleChangePassword = async () => {
//     if (!password.trim()) {
//       setError('Password is required.');
//       return;
//     }

//     if (password.length < 8) {
//       setError('Password must be at least 8 characters.');
//       return;
//     }

//     if (password !== confirmPassword) {
//       setError('Passwords do not match.');
//       return;
//     }

//     try {
//       setLoading(true);
//       setError('');

//       await changeFirstLoginPassword(password);

//       onChanged();
//     } catch (err: any) {
//       setError(
//         err.message ||
//           'Failed to change password.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View>
//       <Text style={styles.title}>
//         Change Password
//       </Text>

//       <Text style={styles.description}>
//         You must change your temporary password
//         before continuing.
//       </Text>

//       <TextInput
//         style={styles.input}
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//         placeholder="New Password"
//       />

//       <TextInput
//         style={styles.input}
//         secureTextEntry
//         value={confirmPassword}
//         onChangeText={setConfirmPassword}
//         placeholder="Confirm Password"
//       />

//       {!!error && (
//         <Text style={styles.error}>
//           {error}
//         </Text>
//       )}

//       <TouchableOpacity
//         style={styles.primaryButton}
//         onPress={handleChangePassword}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.primaryButtonText}>
//             Change Password
//           </Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   title: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 10,
//   },
//   description: {
//     color: '#666',
//     marginBottom: 20,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     marginBottom: 12,
//   },
//   error: {
//     color: '#dc2626',
//     marginBottom: 12,
//   },
//   primaryButton: {
//     backgroundColor: '#2563eb',
//     borderRadius: 8,
//     paddingVertical: 12,
//     alignItems: 'center',
//   },
//   primaryButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
// });

// Filepath = frontend/components/auth/ChangePasswordStep.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { changeFirstLoginPassword } from '../../utils/firstLoginApi';
import { StatusModal } from './VerifyOtpStep';

interface Props {
  onChanged: () => void;
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
  onConfirm: undefined,
};

export default function ChangePasswordStep({
  onChanged,
}: Props) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusModal, setStatusModal] = useState<StatusModalState>(initialStatusModal);

  const showStatus = (
    type: 'success' | 'error',
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setStatusModal({ visible: true, type, title, message, onConfirm });
  };

  const closeStatusModal = () => {
    const confirmCallback = statusModal.onConfirm;
    setStatusModal(initialStatusModal);
    confirmCallback?.();
  };

  const handleChangePassword = async () => {
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await changeFirstLoginPassword(password);

      showStatus(
        'success',
        'Password Changed',
        'Your password has been updated successfully.',
        onChanged
      );
    } catch (err: any) {
      showStatus(
        'error',
        'Password Change Failed',
        err.message || 'Failed to change password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text style={styles.title}>
        Change Password
      </Text>

      <Text style={styles.description}>
        You must change your temporary password
        before continuing.
      </Text>

      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="New Password"
      />

      <TextInput
        style={styles.input}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm Password"
      />

      {!!error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleChangePassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>
            Change Password
          </Text>
        )}
      </TouchableOpacity>

      <StatusModal state={statusModal} onClose={closeStatusModal} />
    </View>
  );
}

const styles = StyleSheet.create({
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
});