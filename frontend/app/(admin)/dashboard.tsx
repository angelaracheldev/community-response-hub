import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
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
import { DEFAULT_STATUS_BREAKDOWN } from '../../utils/adminDashboard.mock';
import { AdminDashboardData, fetchAdminDashboard } from '../../utils/adminApi';
import { adminDashboardStyles as styles } from '../../styles/app/adminDashboard';

export default function AdminDashboard() {
  const router = useRouter();
  const { userName } = useAppSession('admin');
  const layout = useAppLayout();
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        setDashboard(await fetchAdminDashboard());
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <PageShell portal="admin" activeNavId="dashboard" pageTitle="Admin Dashboard">
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 48 }} />
      </PageShell>
    );
  }

  const data = dashboard ?? {
    stats: [],
    statusBreakdown: DEFAULT_STATUS_BREAKDOWN,
    trendPoints: [],
    recentComplaints: [],
    systemOverview: [],
  };

  return (
    <PageShell portal="admin" activeNavId="dashboard" pageTitle="Admin Dashboard">
      <WelcomeBanner name={userName} />

      <StatCardGrid stats={data.stats} columns={layout.statColumns} />

      <View style={[styles.row, layout.chartColumns === 1 && styles.rowStack]}>
        <DonutChartCard
          title="Complaints Overview"
          segments={data.statusBreakdown.length ? data.statusBreakdown : DEFAULT_STATUS_BREAKDOWN}
        />
        <TrendChartCard title="Complaint Trends" points={data.trendPoints} />
      </View>

      <View style={styles.section}>
        <RecentComplaintsList
          items={data.recentComplaints}
          onViewAll={() => router.push('/(admin)/complaints')}
          onItemPress={() => router.push('/(admin)/complaints')}
        />
      </View>

      {layout.isDesktop ? (
        <View style={styles.section}>
          <SystemOverviewGrid metrics={data.systemOverview} columns={4} />
        </View>
      ) : null}
    </PageShell>
  );
}
