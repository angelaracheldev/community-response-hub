import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Notification } from '../utils/notificationApi';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import { getNotificationIcon } from '../utils/notificationIcon';
import { NotificationMessage } from './NotificationMessage';
import { notificationItemStyles as styles } from '../styles/notifications/item';

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


