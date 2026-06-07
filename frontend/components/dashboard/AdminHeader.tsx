import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { NotificationDropdown } from '../NotificationDropdown';

type Props = {
  pageTitle: string;
  userName: string;
  userRole?: string;
  getToken: () => string | null;
  onLogout: () => void;
  onMenuPress?: () => void;
  showMenuButton?: boolean;
};

export function AdminHeader({
  pageTitle,
  userName,
  userRole = 'Admin',
  getToken,
  onLogout,
  onMenuPress,
  showMenuButton = false,
}: Props) {
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  const showProfileText = width >= 768;

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
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuBtn: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 22,
    color: '#111827',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  userRole: {
    fontSize: 11,
    color: '#6B7280',
  },
  chevron: {
    fontSize: 12,
    color: '#6B7280',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 64,
    paddingRight: 24,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 160,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownItemDanger: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  dropdownTextDanger: {
    color: '#DC2626',
  },
});
