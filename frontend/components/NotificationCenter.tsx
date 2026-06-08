import React from 'react';
import { ActivityIndicator, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Notification } from '../utils/notificationApi';
import { NotificationList } from './NotificationList';
import { notificationCenterStyles as styles } from '../styles/notifications/center';

type Props = {
  visible: boolean;
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  markingAll: boolean;
  openingId: string | null;
  dropdownTop: number;
  dropdownLeft: number;
  dropdownWidth: number;
  caretRight: number;
  onClose: () => void;
  onRetry: () => void;
  onItemPress: (id: string) => void;
  onLoadMore: () => void;
  onMarkAllRead: () => void;
};

export function NotificationCenter({
  visible,
  notifications,
  unreadCount,
  loading,
  loadingMore,
  error,
  hasMore,
  markingAll,
  openingId,
  dropdownTop,
  dropdownLeft,
  dropdownWidth,
  caretRight,
  onClose,
  onRetry,
  onItemPress,
  onLoadMore,
  onMarkAllRead,
}: Props) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.dropdown,
            { top: dropdownTop, left: dropdownLeft, width: dropdownWidth },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.caret, { right: caretRight }]} />

          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            {unreadCount > 0 ? (
              <TouchableOpacity onPress={onMarkAllRead} disabled={markingAll}>
                {markingAll ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <Text style={styles.markAllText}>Mark all as read</Text>
                )}
              </TouchableOpacity>
            ) : null}
          </View>

          <NotificationList
            notifications={notifications}
            loading={loading}
            loadingMore={loadingMore}
            error={error}
            openingId={openingId}
            onRetry={onRetry}
            onItemPress={onItemPress}
          />

          {hasMore && notifications.length > 0 ? (
            <TouchableOpacity style={styles.footer} onPress={onLoadMore} disabled={loadingMore}>
              <Text style={styles.footerText}>
                {loadingMore ? 'Loading...' : 'View all notifications'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}


