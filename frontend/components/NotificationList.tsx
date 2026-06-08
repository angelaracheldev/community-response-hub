import React from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Notification } from '../utils/notificationApi';
import { NotificationItem } from './NotificationItem';
import { notificationListStyles as styles } from '../styles/notifications/list';

type Props = {
  notifications: Notification[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  openingId: string | null;
  onRetry: () => void;
  onItemPress: (id: string) => void;
};

export function NotificationList({
  notifications,
  loading,
  loadingMore,
  error,
  openingId,
  onRetry,
  onItemPress,
}: Props) {
  if (loading && notifications.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color="#2563EB" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Unable to load notifications.</Text>
        <Text style={styles.errorSubtitle}>Please try again.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!loading && notifications.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>🔔</Text>
        <Text style={styles.emptyText}>No notifications yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.list} nestedScrollEnabled showsVerticalScrollIndicator={false}>
      {notifications.map((item) => (
        <NotificationItem
          key={item.notification_id}
          notification={item}
          onPress={onItemPress}
          opening={openingId === item.notification_id}
        />
      ))}
      {loadingMore ? (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#2563EB" />
        </View>
      ) : null}
    </ScrollView>
  );
}


