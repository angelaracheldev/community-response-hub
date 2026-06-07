import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppShell } from './AppShell';
import { SideNav } from './SideNav';
import { TopNav } from './TopNav';
import { useAppLayout } from '../../hooks/useAppLayout';
import { useAppSession } from '../../hooks/useAppSession';
import { AppPortal } from '../../utils/appPortal.config';

type Props = {
  portal: AppPortal;
  activeNavId: string;
  pageTitle: string;
  children: ReactNode;
  scrollEnabled?: boolean;
};

export function PageShell({
  portal,
  activeNavId,
  pageTitle,
  children,
  scrollEnabled = true,
}: Props) {
  const layout = useAppLayout();
  const { userName, roleLabel, navItems, quickActions, getToken, logout } =
    useAppSession(portal);

  return (
    <AppShell
      showSidebar={layout.showSidebar}
      showMobileMenu={layout.showMobileMenu}
      contentPadding={layout.contentPadding}
      scrollEnabled={scrollEnabled}
      floatingQuickActions={layout.showMobileMenu ? quickActions : undefined}
      sidebar={<SideNav activeId={activeNavId} navItems={navItems} />}
      header={
        <TopNav
          pageTitle={pageTitle}
          userName={userName}
          userRole={roleLabel}
          getToken={getToken}
          onLogout={logout}
        />
      }
    >
      <View
        style={[
          layout.contentMaxWidth
            ? { width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center' }
            : undefined,
          !scrollEnabled ? styles.contentWrapFlex : undefined,
        ]}
      >
        {children}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  contentWrapFlex: {
    flex: 1,
  },
});
