import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNotifications } from '../../hooks/useNotifications';
import { formatRelativeTime } from '../../utils/formatRelativeTime';

type Props = {
  getToken: () => string | null;
  title?: string;
  limit?: number;
};

export function DashboardNotificationsPanel({
  getToken,
  title = 'Notifications',
  limit = 5,
}: Props) {
  const { notifications, loading, error, refresh } = useNotifications(getToken);
  const items = notifications.slice(0, limit);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {loading && items.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color="#6366F1" />
        </View>
      ) : error && items.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Unable to load notifications.</Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={styles.retry}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>No notifications yet.</Text>
        </View>
      ) : (
        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {items.map((item, index) => (
            <View key={item.notification_id} style={[styles.row, index < items.length - 1 && styles.rowBorder]}>
              <View style={[styles.dot, !item.is_read && styles.dotUnread]} />
              <View style={styles.content}>
                <Text style={styles.message} numberOfLines={2}>
                  {item.message}
                </Text>
                <Text style={styles.time}>{formatRelativeTime(item.created_at)}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 360,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  errorText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  retry: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginTop: 6,
  },
  dotUnread: {
    backgroundColor: '#6366F1',
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
  },
  time: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});
