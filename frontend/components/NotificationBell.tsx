import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { NotificationBadge } from './NotificationBadge';
import { notificationBellStyles as styles } from '../styles/notifications/bell';

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
        <Text style={styles.bellIcon}>🔔</Text>
        <NotificationBadge count={unreadCount} />
      </View>
    </TouchableOpacity>
  );
}


