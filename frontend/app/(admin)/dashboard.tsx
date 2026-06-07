import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AdminPageShell } from '../../components/dashboard/AdminPageShell';
import { DonutChartCard } from '../../components/dashboard/DonutChartCard';
import { RecentComplaintsList } from '../../components/dashboard/RecentComplaintsList';
import { StatCardGrid } from '../../components/dashboard/StatCardGrid';
import { SystemOverviewGrid } from '../../components/dashboard/SystemOverviewGrid';
import { TrendChartCard } from '../../components/dashboard/TrendChartCard';
import { WelcomeBanner } from '../../components/dashboard/WelcomeBanner';
import { useDashboardLayout } from '../../hooks/useDashboardLayout';
import { ADMIN_DASHBOARD_MOCK } from '../../utils/adminDashboard.mock';

export default function AdminDashboard() {
  const router = useRouter();
  const layout = useDashboardLayout();
  const mock = ADMIN_DASHBOARD_MOCK;

  return (
    <AdminPageShell activeNavId="dashboard" pageTitle="Admin Dashboard">
      <WelcomeBanner name={mock.adminName} />

      <StatCardGrid stats={mock.stats} columns={layout.statColumns} />

      <View style={[styles.row, layout.chartColumns === 1 && styles.rowStack]}>
        <DonutChartCard title="Complaints Overview" segments={mock.statusBreakdown} />
        <TrendChartCard title="Complaint Trends" points={mock.trendPoints} />
      </View>

      <View style={styles.section}>
        <RecentComplaintsList
          items={mock.recentComplaints}
          onViewAll={() => router.push('/(admin)/complaints')}
          onItemPress={() => router.push('/(admin)/complaints')}
        />
      </View>

      {layout.isDesktop ? (
        <View style={styles.section}>
          <SystemOverviewGrid metrics={mock.systemOverview} columns={4} />
        </View>
      ) : null}
    </AdminPageShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  rowStack: {
    flexDirection: 'column',
  },
  section: {
    marginTop: 12,
  },
});
