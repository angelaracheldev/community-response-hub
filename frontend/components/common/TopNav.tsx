import React, { useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { NotificationDropdown } from '../NotificationDropdown';
import { topNavStyles as styles } from '../../styles/common/topNav';

type Props = {
  pageTitle: string;
  userName: string;
  userRole?: string;
  getToken: () => string | null | Promise<string | null>;
  onLogout: () => void;
  onMenuPress?: () => void;
  showMenuButton?: boolean;
};

export function TopNav({
  pageTitle,
  userName,
  userRole = 'User',
  getToken,
  onLogout,
  onMenuPress,
  showMenuButton = false,
}: Props) {
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  const showProfileText = width >= 768;
  const avatarLetter = (userName.trim().charAt(0) || '?').toUpperCase();

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {showMenuButton ? (
          <TouchableOpacity style={styles.menuBtn} onPress={onMenuPress}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={styles.pageTitle}>{pageTitle}</Text>
      </View>

      <View style={styles.right}>
        <NotificationDropdown getToken={getToken} />

        <TouchableOpacity style={styles.profileBtn} onPress={() => setMenuOpen(true)}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
          {showProfileText ? (
            <View>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userRole}>{userRole}</Text>
            </View>
          ) : null}
          <Text style={styles.chevron}>▾</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
          <View style={styles.dropdown}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => setMenuOpen(false)}>
              <Text style={styles.dropdownText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dropdownItem, styles.dropdownItemDanger]}
              onPress={() => {
                setMenuOpen(false);
                onLogout();
              }}
            >
              <Text style={[styles.dropdownText, styles.dropdownTextDanger]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}


