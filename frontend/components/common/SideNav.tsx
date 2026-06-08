import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ADMIN_NAV_ITEMS, AdminNavItem } from '../../utils/adminDashboard.mock';
import { sideNavStyles as styles } from '../../styles/common/sideNav';

type Props = {
  activeId?: string;
  onClose?: () => void;
  navItems?: AdminNavItem[];
};

export function SideNav({
  activeId = 'dashboard',
  onClose,
  navItems = ADMIN_NAV_ITEMS,
}: Props) {
  const router = useRouter();

  const navigate = (route: string) => {
    router.push(route as never);
    onClose?.();
  };

  return (
    <View style={styles.sidebar}>
      <View style={styles.brandRow}>
        <View style={styles.brand}>
          <Text style={styles.brandIcon}>🛡️</Text>
          <View>
            <Text style={styles.brandTitle}>Community</Text>
            <Text style={styles.brandSubtitle}>Response Hub</Text>
          </View>
        </View>
        {onClose ? (
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close menu">
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.nav}>
        {navItems.map((item) => {
          const isActive = item.id === activeId;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => navigate(item.route)}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}


