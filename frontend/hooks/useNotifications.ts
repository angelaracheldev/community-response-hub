import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  openNotification as openNotificationApi,
  Notification,
} from '../utils/notificationApi';

type TokenGetter = () => string | null | Promise<string | null>;

const PAGE_LIMIT = 20;
const POLL_INTERVAL_MS = 60_000;

async function resolveToken(getToken: TokenGetter): Promise<string | null> {
  const token = getToken();
  return token instanceof Promise ? token : token;
}

export function useNotifications(getToken: TokenGetter) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [centerOpen, setCenterOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const refreshUnreadCount = useCallback(async () => {
    const token = await resolveToken(getTokenRef.current);
    if (!token) return;
    try {
      const count = await fetchUnreadCount(token);
      setUnreadCount(count);
    } catch {
      // Badge refresh is best-effort; list errors surface separately.
    }
  }, []);

  const loadNotifications = useCallback(
    async (options?: { page?: number; append?: boolean; isRefresh?: boolean }) => {
      const token = await resolveToken(getTokenRef.current);
      if (!token) return;

      const targetPage = options?.page ?? 1;
      const append = options?.append ?? false;
      const isRefresh = options?.isRefresh ?? false;

      if (isRefresh) {
        setRefreshing(true);
      } else if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const result = await fetchNotifications(token, { page: targetPage, limit: PAGE_LIMIT });
        setTotalCount(result.count);
        setPage(result.page);
        setNotifications((prev) =>
          append ? [...prev, ...result.notifications] : result.notifications
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load notifications');
        if (!append) {
          setNotifications([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    []
  );

  const openCenter = useCallback(() => {
    setCenterOpen(true);
    loadNotifications({ page: 1 });
    refreshUnreadCount();
  }, [loadNotifications, refreshUnreadCount]);

  const closeCenter = useCallback(() => {
    setCenterOpen(false);
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([loadNotifications({ page: 1, isRefresh: true }), refreshUnreadCount()]);
  }, [loadNotifications, refreshUnreadCount]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading || notifications.length >= totalCount) return;
    loadNotifications({ page: page + 1, append: true });
  }, [loadingMore, loading, notifications.length, totalCount, page, loadNotifications]);

  const openNotification = useCallback(
    async (notificationId: string) => {
      const token = await resolveToken(getTokenRef.current);
      if (!token) return;

      const target = notifications.find((n) => n.notification_id === notificationId);
      const wasUnread = target?.is_read === false;

      setOpeningId(notificationId);
      try {
        await openNotificationApi(token, notificationId);
        setNotifications((prev) =>
          prev.map((n) =>
            n.notification_id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
          )
        );
        if (wasUnread) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        await refreshUnreadCount();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to open notification');
      } finally {
        setOpeningId(null);
      }
    },
    [notifications, refreshUnreadCount]
  );

  const markAllRead = useCallback(async () => {
    const token = await resolveToken(getTokenRef.current);
    if (!token || unreadCount === 0) return;

    setMarkingAll(true);
    try {
      await markAllNotificationsRead(token);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: n.read_at ?? new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  }, [unreadCount]);

  useFocusEffect(
    useCallback(() => {
      refreshUnreadCount();
    }, [refreshUnreadCount])
  );

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  const hasMore = notifications.length < totalCount;

  return {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    refreshing,
    error,
    centerOpen,
    markingAll,
    openingId,
    hasMore,
    openCenter,
    closeCenter,
    refresh,
    loadMore,
    openNotification,
    markAllRead,
  };
}
