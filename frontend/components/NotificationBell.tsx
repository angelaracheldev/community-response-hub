import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { NotificationBadge } from './NotificationBadge';
import { notificationBellStyles as styles } from '../styles/notifications/bell';
import { AppIcon } from './common/AppIcon';

type Props = {
  unreadCount: number;
  onPress: () => void;
  active?: boolean;
};

export function NotificationBell({ unreadCount, onPress, active = false }: Props) {
  return (
    <TouchableOpacity
      style={[styles.bellBtn, active && styles.bellBtnActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.bellWrap}>
        <AppIcon name="notifications-outline" size={22} color={active ? '#2563EB' : '#374151'} />
        <NotificationBadge count={unreadCount} />
      </View>
    </TouchableOpacity>
  );
}


