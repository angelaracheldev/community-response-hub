// Filepath = frontend/components/profile/ProfileSettingsModal.tsx
// Filepath = frontend/components/profile/ProfileSettingsModal.tsx

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../common/AppIcon';

import { useAppLayout } from '../../hooks/useAppLayout';


import {
  getMyProfile,
  UserProfile,
} from '../../utils/profileApi';

import ProfileDetailField from './ProfileDetailField';

import ChangePasswordWizard from './ChangePasswordWizard';
import ChangeEmailWizard from './ChangeEmailWizard';

import {
  profileSettingsModalStyles as s,
} from '../../styles/profile/profileSettingsModal';



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

  const layout = useAppLayout();


  const { height: windowHeight } = useWindowDimensions();

  const desktopScrollMaxHeight =
    Math.max(windowHeight * 0.90 - 120, 300);

  const isDesktop = layout.isDesktop;

  const [screen, setScreen] =
    useState<Screen>('menu');

  const [loading, setLoading] =
    useState(true);

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  async function loadProfile() {
    try {

      setLoading(true);

      const response =
        await getMyProfile();

      if (
        response.success &&
        response.profile
      ) {
        setProfile(response.profile);
      }

    } catch (err) {

      console.error(
        'Failed loading profile',
        err
      );

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

  /**
   * ------------------------------------------------------------------
   * Wizard Screens
   * ------------------------------------------------------------------
   */



  /**
   * ------------------------------------------------------------------
   * Loading
   * ------------------------------------------------------------------
   */


  /**
 * ------------------------------------------------------------------
 * Profile Content
 * ------------------------------------------------------------------
 */

  const profileContent = (
    <>
      {/* ============================================================ */}
      {/* Profile */}
      {/* ============================================================ */}

      <View style={s.card}>

        <Text style={s.sectionTitle}>
          Profile
        </Text>

        <View style={s.detailGrid}>

          {/* <ProfileDetailField
            label="User Code"
            value={'Coming Soon'}
          /> */}

          <ProfileDetailField
            label="Full Name"
            value={`${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`}
          />

          <ProfileDetailField
            label="Email"
            value={profile?.email}
          />

          <ProfileDetailField
            label="Role"
            value={profile?.role}
          />

          <ProfileDetailField
            label="Phone"
            value={
              profile?.phoneNumber || '-'
            }
          />

        </View>

        <View style={s.badge}>
          <Text style={s.badgeText}>
            {profile?.role}
          </Text>
        </View>

      </View>

      {/* ============================================================ */}
      {/* Account Security */}
      {/* ============================================================ */}

      <View style={s.card}>

        <Text style={s.sectionTitle}>
          Account Security
        </Text>

        <View style={s.actionCard}>

          <TouchableOpacity
            style={s.actionRow}
            onPress={() =>
              setScreen('password')
            }
          >

            <View style={s.actionLeft}>

              <AppIcon name="lock-closed-outline" size={22} color="#6366F1" />

              <View>

                <Text style={s.actionTitle}>
                  Change Password
                </Text>

                <Text style={s.actionSubtitle}>
                  Update your login password.
                </Text>

              </View>

            </View>

            <AppIcon name="chevron-forward" size={18} color="#9CA3AF" />

          </TouchableOpacity>

        </View>

      </View>

      {/* ============================================================ */}
      {/* Email */}
      {/* ============================================================ */}

      <View style={s.card}>

        <Text style={s.sectionTitle}>
          Email Address
        </Text>

        <View style={s.actionCard}>

          <TouchableOpacity
            style={s.actionRow}
            onPress={() =>
              setScreen('email')
            }
          >

            <View style={s.actionLeft}>

              <AppIcon name="mail-outline" size={22} color="#6366F1" />

              <View>

                <Text style={s.actionTitle}>
                  Change Email
                </Text>

                <Text style={s.actionSubtitle}>
                  {profile?.email}
                </Text>

              </View>

            </View>

            <AppIcon name="chevron-forward" size={18} color="#9CA3AF" />

          </TouchableOpacity>

        </View>

      </View>
    </>
  );

  /**
 * ------------------------------------------------------------------
 * Render
 * ------------------------------------------------------------------
 */

  return (
    <Modal
      visible={visible}
      transparent={isDesktop}
      animationType={isDesktop ? 'fade' : 'slide'}
      onRequestClose={onClose}
    >
      {isDesktop ? (
        <View style={s.backdrop}>
          <View style={s.dialog}>

            {/* ------------------------------------------------------ */}
            {/* Header */}
            {/* ------------------------------------------------------ */}

            <View style={s.header}>

    {screen !== 'menu' && (
        <TouchableOpacity
            style={s.backButton}
            onPress={() => setScreen('menu')}
        >
            <Text style={s.backButtonText}>
                ←
            </Text>
        </TouchableOpacity>
    )}

    <View style={s.headerText}>

        <Text style={s.title}>
            {screen === 'menu'
                ? 'Profile Settings'
                : screen === 'password'
                ? 'Change Password'
                : 'Change Email'}
        </Text>

        <Text style={s.subtitle}>
            {screen === 'menu'
                ? 'View your account information and manage your security settings.'
                : screen === 'password'
                ? 'Update your account password.'
                : 'Change your login email.'}
        </Text>

    </View>

</View>

            {/* ------------------------------------------------------ */}
            {/* Body */}
            {/* ------------------------------------------------------ */}

            <ScrollView
              style={s.scroll}
              contentContainerStyle={s.scrollContent}
              showsVerticalScrollIndicator={false}
            >

              {loading ? (

                <View style={s.loading}>
                  <ActivityIndicator size="large" />
                </View>

              ) : (

                <>
                  {screen === 'menu' && profileContent}

                  {screen === 'password' && (
                    <ChangePasswordWizard
                      onFinished={finishWizard}
                    />
                  )}

                  {screen === 'email' && (
                    <ChangeEmailWizard
                      onFinished={finishWizard}
                    />
                  )}
                </>

              )}

            </ScrollView>

            {/* ------------------------------------------------------ */}
            {/* Footer */}
            {/* ------------------------------------------------------ */}

            {screen === 'menu' && (
              <View style={s.footer}>

                <TouchableOpacity
                  style={s.closeFooterButton}
                  onPress={onClose}
                >
                  <Text style={s.closeFooterText}>
                    Close
                  </Text>
                </TouchableOpacity>

              </View>
            )}

          </View>
        </View>
      ) : (
        <SafeAreaView style={s.mobileScreen}>

          {/* ------------------------------------------------------ */}
          {/* Mobile Header */}
          {/* ------------------------------------------------------ */}

          <View style={s.mobileHeader}>

            <Text style={s.mobileTitle}>
              {
                screen === 'menu'
                  ? 'Profile Settings'
                  : screen === 'password'
                    ? 'Change Password'
                    : 'Change Email'
              }
            </Text>

            <TouchableOpacity
              style={s.closeButton}
              onPress={onClose}
            >
              <AppIcon name="close" size={20} color="#6B7280" />
            </TouchableOpacity>

          </View>

          {/* ------------------------------------------------------ */}
          {/* Mobile Body */}
          {/* ------------------------------------------------------ */}

          <ScrollView
            style={s.mobileBody}
            showsVerticalScrollIndicator={false}
          >
            {screen === 'menu' && profileContent}

            {screen === 'password' && (
              <ChangePasswordWizard
                onFinished={finishWizard}
              />
            )}

            {screen === 'email' && (
              <ChangeEmailWizard
                onFinished={finishWizard}
              />
            )}

            <View style={s.footer}>

              <TouchableOpacity
                style={s.closeFooterButton}
                onPress={onClose}
              >
                <Text style={s.closeFooterText}>
                  Close
                </Text>
              </TouchableOpacity>

            </View>

          </ScrollView>

        </SafeAreaView>
      )}
    </Modal>
  );
}