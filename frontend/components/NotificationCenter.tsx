import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Notification } from '../utils/notificationApi';
import { NotificationList } from './NotificationList';

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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  caret: {
    position: 'absolute',
    top: -7,
    width: 14,
    height: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#E5E7EB',
    transform: [{ rotate: '45deg' }],
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  footer: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
});
