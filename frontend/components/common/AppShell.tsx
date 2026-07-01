// Filepath = frontend\components\common\AppShell.tsx
import React, { ReactNode, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { QuickAction } from '../../utils/adminDashboard.mock';
import { appShellStyles as styles } from '../../styles/common/appShell';
import {
  FloatingQuickActionsBar,
  getFloatingQuickActionsPadding,
} from '../dashboard/FloatingQuickActionsBar';

type Props = {
  children: ReactNode;
  sidebar: ReactNode;
  header: ReactNode;
  showSidebar: boolean;
  showMobileMenu: boolean;
  contentPadding: number;
  floatingQuickActions?: QuickAction[];
  scrollEnabled?: boolean;
};

export function AppShell({
  children,
  sidebar,
  header,
  showSidebar,
  showMobileMenu,
  contentPadding,
  floatingQuickActions,
  scrollEnabled = true,
}: Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const closeMobileNav = () => setMobileNavOpen(false);

  const showFloatingBar = showMobileMenu && !!floatingQuickActions?.length;
  const useWebOverlayBar = Platform.OS === 'web' && width >= 450;
  const scrollBottomPadding =
    showFloatingBar && useWebOverlayBar
      ? getFloatingQuickActionsPadding(width, insets.bottom)
      : 32;

  return (
    <View style={styles.root}>
      {showSidebar ? <View style={styles.sidebarColumn}>{sidebar}</View> : null}

      <SafeAreaView style={styles.mainSafe} edges={['top', 'right', 'left']}>
        <View style={styles.main}>
          {React.isValidElement(header)
            ? React.cloneElement(header as React.ReactElement<{ onMenuPress?: () => void; showMenuButton?: boolean }>, {
                onMenuPress: () => setMobileNavOpen(true),
                showMenuButton: showMobileMenu,
              })
            : header}

          {scrollEnabled ? (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={[
                styles.content,
                { padding: contentPadding, paddingBottom: scrollBottomPadding },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            <View
              style={[
                styles.contentFlex,
                { padding: contentPadding, paddingBottom: scrollBottomPadding },
              ]}
            >
              {children}
            </View>
          )}
        </View>

        {showFloatingBar ? (
          <View style={styles.footer}>
            <FloatingQuickActionsBar actions={floatingQuickActions} />
          </View>
        ) : null}
      </SafeAreaView>

      <Modal visible={mobileNavOpen} transparent animationType="fade" onRequestClose={closeMobileNav}>
        <Pressable style={styles.overlay} onPress={closeMobileNav}>
          <Pressable
            style={[styles.drawer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
            onPress={(e) => e.stopPropagation()}
          >
            {React.isValidElement(sidebar)
              ? React.cloneElement(
                  sidebar as React.ReactElement<{ onClose?: () => void }>,
                  { onClose: closeMobileNav }
                )
              : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}


