import React, { ReactNode, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { QuickAction } from '../../utils/adminDashboard.mock';
import { AdminSidebar } from './AdminSidebar';
import { FloatingQuickActionsBar, getFloatingQuickActionsPadding } from './FloatingQuickActionsBar';

type Props = {
  children: ReactNode;
  sidebar?: ReactNode;
  header: ReactNode;
  showSidebar: boolean;
  showMobileMenu: boolean;
  contentPadding: number;
  floatingQuickActions?: QuickAction[];
  scrollEnabled?: boolean;
};

export function DashboardShell({
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
  const scrollBottomPadding = showFloatingBar
    ? getFloatingQuickActionsPadding(width, insets.bottom)
    : 32;

  const sidebarNode = sidebar ?? (showMobileMenu ? <AdminSidebar activeId="dashboard" /> : null);

  return (
    <View style={styles.root}>
      {showSidebar && sidebarNode ? (
        <View style={styles.sidebarColumn}>{sidebarNode}</View>
      ) : null}

      <SafeAreaView style={styles.mainSafe} edges={['top', 'right', 'bottom']}>
        <View style={styles.main}>
          {React.isValidElement(header)
            ? React.cloneElement(header as React.ReactElement<{ onMenuPress?: () => void; showMenuButton?: boolean }>, {
                onMenuPress: () => setMobileNavOpen(true),
                showMenuButton: showMobileMenu,
              })
            : header}

          {scrollEnabled ? (
            <ScrollView
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

          {showFloatingBar ? <FloatingQuickActionsBar actions={floatingQuickActions} /> : null}
        </View>
      </SafeAreaView>

      <Modal visible={mobileNavOpen} transparent animationType="fade" onRequestClose={closeMobileNav}>
        <Pressable style={styles.overlay} onPress={closeMobileNav}>
          <Pressable style={styles.drawer} onPress={(e) => e.stopPropagation()}>
            {React.isValidElement(sidebar)
              ? React.cloneElement(
                  sidebar as React.ReactElement<{ onClose?: () => void }>,
                  { onClose: closeMobileNav }
                )
              : (
                <AdminSidebar activeId="dashboard" onClose={closeMobileNav} />
              )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
  },
  sidebarColumn: {
    alignSelf: 'stretch',
    backgroundColor: '#0F172A',
  },
  mainSafe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  main: {
    flex: 1,
    position: 'relative',
  },
  content: {},
  contentFlex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  drawer: {
    width: 260,
    height: '100%',
    backgroundColor: '#0F172A',
  },
});
