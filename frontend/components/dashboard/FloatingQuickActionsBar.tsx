import React from 'react';
import { Platform, Text, TouchableOpacity, useWindowDimensions, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QuickAction } from '../../utils/adminDashboard.mock';
import { getContentMaxWidth } from '../../styles/layout';
import { floatingQuickActionsBarStyles as styles } from '../../styles/dashboard/floatingQuickActionsBar';
import { AppIcon } from '../common/AppIcon';

type Props = {
  actions: QuickAction[];
};

const BAR_CONTENT_HEIGHT = 68;

export function FloatingQuickActionsBar({ actions }: Props) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const maxWidth = getContentMaxWidth(width);
  const isFloated = width >= 450;
  const useFixedWebBar = Platform.OS === 'web' && isFloated;
  const useNativeTabBar = Platform.OS !== 'web';
  const bottomInset = Math.max(insets.bottom, 8);

  if (useNativeTabBar) {
    return (
      <View style={[styles.wrapper, { paddingBottom: bottomInset }]}>
        <View style={styles.bar}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.action}
              activeOpacity={0.85}
              onPress={() => router.push(action.route as never)}
            >
              <View style={[styles.iconWrap, { backgroundColor: `${action.color}18` }]}>
                <AppIcon name={action.icon} size={20} color={action.color} />
              </View>
              <Text style={styles.label} numberOfLines={1}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        {
          alignItems: 'center',
          paddingBottom: Math.max(insets.bottom, isFloated ? 16 : 8),
          paddingHorizontal: isFloated ? 16 : 0,
        },
        useFixedWebBar
          ? ({
              position: 'fixed' as any,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 100,
            } as ViewStyle)
          : null,
      ]}
    >
      <View
        style={[
          styles.bar,
          styles.barFloated,
          {
            maxWidth,
            width: '100%',
            alignSelf: 'center',
          },
        ]}
      >
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.action}
            activeOpacity={0.85}
            onPress={() => router.push(action.route as never)}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${action.color}18` }]}>
              <AppIcon name={action.icon} size={20} color={action.color} />
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function getFloatingQuickActionsPadding(screenWidth: number, bottomInset = 0): number {
  const isFloated = screenWidth >= 450;
  return BAR_CONTENT_HEIGHT + Math.max(bottomInset, isFloated ? 16 : 8) + 16;
}

export function getNativeTabBarHeight(bottomInset = 0): number {
  return BAR_CONTENT_HEIGHT + Math.max(bottomInset, 8);
}
