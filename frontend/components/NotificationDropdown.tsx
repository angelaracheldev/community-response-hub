import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationBell } from './NotificationBell';
import { NotificationCenter } from './NotificationCenter';

const DROPDOWN_WIDTH = 380;

type TokenGetter = () => string | null | Promise<string | null>;

type AnchorPosition = {
  top: number;
  left: number;
  width: number;
  caretRight: number;
};

type Props = {
  getToken: TokenGetter;
};

function getFallbackAnchor(): AnchorPosition {
  const screenWidth = Dimensions.get('window').width;
  const panelWidth = Math.min(DROPDOWN_WIDTH, screenWidth - 16);
  return {
    top: 64,
    left: screenWidth - panelWidth - 16,
    width: panelWidth,
    caretRight: 18,
  };
}

function computeAnchor(x: number, y: number, width: number, height: number): AnchorPosition {
  const screenWidth = Dimensions.get('window').width;
  const panelWidth = Math.min(DROPDOWN_WIDTH, screenWidth - 16);
  const bellCenterFromLeft = x + width / 2;

  let left = bellCenterFromLeft - panelWidth / 2;
  left = Math.max(8, Math.min(left, screenWidth - panelWidth - 8));

  const caretRight = Math.max(12, Math.min(panelWidth - 12, panelWidth - (bellCenterFromLeft - left) - 7));

  return {
    top: y + height + 10,
    left,
    width: panelWidth,
    caretRight,
  };
}

export function NotificationDropdown({ getToken }: Props) {
  const notifications = useNotifications(getToken);
  const bellRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<AnchorPosition>(getFallbackAnchor);

  const measureBell = useCallback(() => {
    if (Platform.OS === 'web') {
      const node = bellRef.current as unknown as HTMLElement | null;
      const rect = node?.getBoundingClientRect?.();
      if (rect && rect.width > 0) {
        setAnchor(computeAnchor(rect.left, rect.top, rect.width, rect.height));
        return;
      }
    }

    bellRef.current?.measureInWindow((x, y, width, height) => {
      if (width > 0) {
        setAnchor(computeAnchor(x, y, width, height));
      }
    });
  }, []);

  useEffect(() => {
    if (!notifications.centerOpen) return;

    measureBell();
    const timer = setTimeout(measureBell, 50);
    return () => clearTimeout(timer);
  }, [notifications.centerOpen, measureBell]);

  const handleBellPress = useCallback(() => {
    measureBell();
    if (notifications.centerOpen) {
      notifications.closeCenter();
    } else {
      notifications.openCenter();
    }
  }, [measureBell, notifications]);

  return (
    <View ref={bellRef} style={styles.anchor} collapsable={false}>
      <NotificationBell
        unreadCount={notifications.unreadCount}
        onPress={handleBellPress}
        active={notifications.centerOpen}
      />
      <NotificationCenter
        visible={notifications.centerOpen}
        notifications={notifications.notifications}
        unreadCount={notifications.unreadCount}
        loading={notifications.loading}
        loadingMore={notifications.loadingMore}
        error={notifications.error}
        hasMore={notifications.hasMore}
        markingAll={notifications.markingAll}
        openingId={notifications.openingId}
        dropdownTop={anchor.top}
        dropdownLeft={anchor.left}
        dropdownWidth={anchor.width}
        caretRight={anchor.caretRight}
        onClose={notifications.closeCenter}
        onRetry={() => notifications.refresh()}
        onItemPress={notifications.openNotification}
        onLoadMore={notifications.loadMore}
        onMarkAllRead={notifications.markAllRead}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'relative',
    zIndex: 100,
  },
});
