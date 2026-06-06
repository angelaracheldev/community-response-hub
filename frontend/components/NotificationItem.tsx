import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Notification } from '../utils/notificationApi';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import { getNotificationIcon } from '../utils/notificationIcon';
import { NotificationMessage } from './NotificationMessage';

type Props = {
  notification: Notification;
  onPress: (id: string) => void;
  opening?: boolean;
};

export function NotificationItem({ notification, onPress, opening = false }: Props) {
  const isUnread = !notification.is_read;
  const icon = getNotificationIcon(notification.type);

  return (
    <TouchableOpacity
      style={[styles.item, isUnread ? styles.itemUnread : styles.itemRead]}
      onPress={() => onPress(notification.notification_id)}
      disabled={opening}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: icon.backgroundColor }]}>
        <Text style={[styles.iconSymbol, { color: icon.symbolColor }]}>{icon.symbol}</Text>
      </View>

      <View style={styles.content}>
        <NotificationMessage message={notification.message} bold={isUnread} />
        <Text style={styles.time}>{formatRelativeTime(notification.created_at)}</Text>
      </View>

      {opening ? (
        <ActivityIndicator size="small" color="#2563EB" style={styles.statusDot} />
      ) : (
        <View
          style={[
            styles.statusDot,
            isUnread ? styles.statusDotUnread : styles.statusDotRead,
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  itemUnread: {
    backgroundColor: '#EFF6FF',
  },
  itemRead: {
    backgroundColor: '#FFFFFF',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconSymbol: {
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingRight: 4,
  },
  time: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    flexShrink: 0,
  },
  statusDotUnread: {
    backgroundColor: '#2563EB',
  },
  statusDotRead: {
    backgroundColor: '#D1D5DB',
  },
});
