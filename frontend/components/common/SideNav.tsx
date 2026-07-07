import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ADMIN_NAV_ITEMS, AdminNavItem } from '../../utils/adminDashboard.mock';
import { sideNavStyles as styles } from '../../styles/common/sideNav';
import { AppIcon } from './AppIcon';

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
          <AppIcon name="shield-checkmark-outline" size={24} color="#FFFFFF" />
          <View>
            <Text style={styles.brandTitle}>Community</Text>
            <Text style={styles.brandSubtitle}>Response Hub</Text>
          </View>
        </View>
        {onClose ? (
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close menu">
            <AppIcon name="close" size={20} color="#94A3B8" />
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
              <AppIcon
                name={item.icon}
                size={20}
                color={isActive ? '#FFFFFF' : '#94A3B8'}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}


