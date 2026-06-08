import React from 'react';
import { Text, View } from 'react-native';
import { notificationBadgeStyles as styles } from '../styles/notifications/badge';

type Props = {
  count: number;
};

export function NotificationBadge({ count }: Props) {
  if (count <= 0) return null;

  const label = count > 99 ? '99+' : String(count);

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}


