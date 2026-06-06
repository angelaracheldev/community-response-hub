import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NotificationBadge } from './NotificationBadge';

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

const styles = StyleSheet.create({
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBtnActive: {
    backgroundColor: '#F3F4F6',
  },
  bellWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 20,
    opacity: 0.85,
  },
});
