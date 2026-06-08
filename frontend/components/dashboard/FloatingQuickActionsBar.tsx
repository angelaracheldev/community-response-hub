import React from 'react';
import { Platform, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QuickAction } from '../../utils/adminDashboard.mock';
import { getContentMaxWidth } from '../../styles/layout';
import { floatingQuickActionsBarStyles as styles } from '../../styles/dashboard/floatingQuickActionsBar';

type Props = {
  actions: QuickAction[];
};

export function FloatingQuickActionsBar({ actions }: Props) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const maxWidth = getContentMaxWidth(width);
  const isFloated = width >= 450;

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, isFloated ? 16 : 8),
          paddingHorizontal: isFloated ? 16 : 0,
        },
        Platform.OS === 'web' && isFloated
          ? ({
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 100,
            } as object)
          : styles.wrapperAbsolute,
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.bar,
          {
            maxWidth,
            width: '100%',
          },
          Platform.OS === 'web' && isFloated
            ? ({
                alignSelf: 'center',
              } as object)
            : null,
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
              <Text style={styles.icon}>{action.icon}</Text>
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

const BAR_HEIGHT = 76;

export function getFloatingQuickActionsPadding(screenWidth: number, bottomInset = 0): number {
  const isFloated = screenWidth >= 450;
  return BAR_HEIGHT + Math.max(bottomInset, isFloated ? 16 : 8) + 16;
}


