// Filepath = frontend/components/profile/ProfileSettingsModal.tsx

import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { getMyProfile, UserProfile } from '../../utils/profileApi';
import * as ProfileApi from '../../utils/profileApi';


import ChangePasswordWizard from './ChangePasswordWizard';
import ChangeEmailWizard from './ChangeEmailWizard';

type Screen =
  | 'menu'
  | 'password'
  | 'email';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileSettingsModal({
  visible,
  onClose,
}: Props) {


  const [screen, setScreen] =
    useState<Screen>('menu');

  const [loading, setLoading] =
    useState(true);

  const [profile, setProfile] = useState<UserProfile | null>(null);

  async function loadProfile() {
    try {
      setLoading(true);

      const response = await getMyProfile();

      if (response.success && response.profile) {
        setProfile(response.profile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (visible) {
      setScreen('menu');
      loadProfile();
    }
  }, [visible]);

  async function finishWizard() {
    await loadProfile();
    setScreen('menu');
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>

        <View style={styles.card}>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : screen === 'password' ? (

            <ChangePasswordWizard
              onFinished={finishWizard}
            />

          ) : screen === 'email' ? (

            <ChangeEmailWizard
              onFinished={finishWizard}
            />

          ) : (

            <>
              <Text style={styles.title}>
                Profile Settings
              </Text>


              <View style={styles.section}>
                <Text style={styles.heading}>Profile</Text>

                <Text style={styles.name}>
                  {profile
                    ? `${profile.firstName} ${profile.lastName}`
                    : ''}
                </Text>

                <Text style={styles.role}>Role: 
                  {profile?.role}
                </Text>
              </View>

              <View style={styles.section}>

                <Text style={styles.heading}>
                  Account Security
                </Text>

                <Text style={styles.description}>
                  Update your login password.
                </Text>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() =>
                    setScreen('password')
                  }
                >
                  <Text style={styles.buttonText}>
                    Change Password
                  </Text>
                </TouchableOpacity>

              </View>

              

              <View style={styles.section}>
                <Text style={styles.heading}>Email Address</Text>

                <Text style={styles.email}>
                  {profile?.email}
                </Text>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => setScreen('email')}
                >
                  <Text style={styles.buttonText}>
                    Change Email
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelText}>
                  Close
                </Text>
              </TouchableOpacity>

            </>
          )}

        </View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },

  role: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.45)',
    justifyContent: 'center',
    padding: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },

  section: {
    marginBottom: 28,
  },

  heading: {
    fontWeight: '700',
    fontSize: 18,
  },

  description: {
    color: '#666',
    marginVertical: 8,
  },

  email: {
    fontSize: 16,
    marginVertical: 8,
    color: '#2563eb',
  },

  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },

  cancelButton: {
    marginTop: 8,
    alignItems: 'center',
  },

  cancelText: {
    color: '#666',
    fontWeight: '600',
  },

}); 