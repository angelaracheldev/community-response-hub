import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { PageShell } from '../../components/common/PageShell';
import { DonutChartCard } from '../../components/dashboard/DonutChartCard';
import { RecentComplaintsList } from '../../components/dashboard/RecentComplaintsList';
import { StatCardGrid } from '../../components/dashboard/StatCardGrid';
import { SystemOverviewGrid } from '../../components/dashboard/SystemOverviewGrid';
import { TrendChartCard } from '../../components/dashboard/TrendChartCard';
import { WelcomeBanner } from '../../components/dashboard/WelcomeBanner';
import { useAppLayout } from '../../hooks/useAppLayout';
import { useAppSession } from '../../hooks/useAppSession';
import { ADMIN_DASHBOARD_MOCK } from '../../utils/adminDashboard.mock';
import { adminDashboardStyles as styles } from '../../styles/app/adminDashboard';

export default function AdminDashboard() {
  const router = useRouter();
  const { userName } = useAppSession('admin');
  const layout = useAppLayout();
  const mock = ADMIN_DASHBOARD_MOCK;

  return (
    <PageShell portal="admin" activeNavId="dashboard" pageTitle="Admin Dashboard">
      <WelcomeBanner name={userName} />

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
    </PageShell>
  );
}


