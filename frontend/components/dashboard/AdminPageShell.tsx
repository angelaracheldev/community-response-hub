import React, { ReactNode, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { DashboardShell } from './DashboardShell';
import { useDashboardLayout } from '../../hooks/useDashboardLayout';
import { ADMIN_DASHBOARD_MOCK } from '../../utils/adminDashboard.mock';
import { clearAdminToken, getAdminToken } from '../../utils/authStorage';

type Props = {
  activeNavId: string;
  pageTitle: string;
  children: ReactNode;
  scrollEnabled?: boolean;
};

export function AdminPageShell({
  activeNavId,
  pageTitle,
  children,
  scrollEnabled = true,
}: Props) {
  const router = useRouter();
  const layout = useDashboardLayout();
  const mock = ADMIN_DASHBOARD_MOCK;

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace('/(admin)/login');
    }
  }, [router]);

  const logout = () => {
    clearAdminToken();
    router.replace('/(admin)/login');
  };

  return (
    <DashboardShell
      showSidebar={layout.showSidebar}
      showMobileMenu={layout.showMobileMenu}
      contentPadding={layout.contentPadding}
      scrollEnabled={scrollEnabled}
      floatingQuickActions={layout.showMobileMenu ? mock.quickActions : undefined}
      sidebar={<AdminSidebar activeId={activeNavId} />}
      header={
        <AdminHeader
          pageTitle={pageTitle}
          userName={mock.adminName}
          userRole="Admin"
          getToken={getAdminToken}
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
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  contentWrapFlex: {
    flex: 1,
  },
});
