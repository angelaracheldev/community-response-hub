import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { PageShell } from '../../components/common/PageShell';
import { RecentComplaintsList } from '../../components/dashboard/RecentComplaintsList';
import { StatCardGrid } from '../../components/dashboard/StatCardGrid';
import { WelcomeBanner } from '../../components/dashboard/WelcomeBanner';
import { useAppLayout } from '../../hooks/useAppLayout';
import { useAppSession } from '../../hooks/useAppSession';
import { DashboardStat, RecentComplaintItem } from '../../utils/adminDashboard.mock';
import { respondentDashboardStyles as styles } from '../../styles/app/respondentDashboard';
import {
  ComplaintRecord,
  fetchAssignedComplaints,
  formatDate,
} from '../../utils/complaintApi';

const ACTIVE_STATUSES = new Set(['pending', 'under_review', 'assigned', 'in_progress']);

function buildStats(assignments: ComplaintRecord[]): DashboardStat[] {
  const active = assignments.filter((item) => ACTIVE_STATUSES.has(item.status)).length;
  const resolved = assignments.filter((item) => item.status === 'resolved').length;
  const inProgress = assignments.filter((item) => item.status === 'in_progress').length;

  return [
    {
      id: 'total',
      label: 'Total Assignments',
      value: assignments.length,
      icon: '📋',
      accentColor: '#6366F1',
      iconBackground: '#EEF2FF',
    },
    {
      id: 'active',
      label: 'Active',
      value: active,
      icon: '🔔',
      accentColor: '#F59E0B',
      iconBackground: '#FFFBEB',
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      value: inProgress,
      icon: '⚙️',
      accentColor: '#3B82F6',
      iconBackground: '#EFF6FF',
    },
    {
      id: 'resolved',
      label: 'Resolved',
      value: resolved,
      icon: '✅',
      accentColor: '#10B981',
      iconBackground: '#ECFDF5',
    },
  ];
}

function toRecentItems(assignments: ComplaintRecord[]): RecentComplaintItem[] {
  return assignments.slice(0, 5).map((item) => ({
    id: item.complaint_id,
    referenceId: item.reference_id,
    title: item.title,
    status: item.status,
    date: formatDate(item.updated_at ?? item.created_at),
    emoji: '📋',
  }));
}

export default function RespondentDashboard() {
  const router = useRouter();
  const { userName } = useAppSession('respondent');
  const layout = useAppLayout();
  const [assignments, setAssignments] = useState<ComplaintRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAssignedComplaints();
      setAssignments(data);
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAssignments();
    }, [loadAssignments])
  );

  const stats = useMemo(() => buildStats(assignments), [assignments]);
  const recentItems = useMemo(() => toRecentItems(assignments), [assignments]);

  return (
    <PageShell portal="respondent" activeNavId="home" pageTitle="Dashboard">
      <WelcomeBanner
        name={userName}
        subtitle="Here's an overview of your assigned complaints."
      />

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <>
          <StatCardGrid stats={stats} columns={layout.statColumns} />

          <View style={styles.section}>
            <RecentComplaintsList
              title="Recent Assignments"
              items={recentItems}
              onViewAll={() => router.push('/(respondent)/assignments')}
              onItemPress={() => router.push('/(respondent)/assignments')}
            />
          </View>
        </>
      )}
    </PageShell>
  );
}


