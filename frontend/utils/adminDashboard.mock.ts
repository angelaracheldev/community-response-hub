export type TrendDirection = 'up' | 'down';

export type StatTrend = {
  direction: TrendDirection;
  label: string;
};

export type DashboardStat = {
  id: string;
  label: string;
  value: number;
  icon: string;
  accentColor: string;
  iconBackground: string;
  trend?: StatTrend;
};

export type ChartSegment = {
  label: string;
  value: number;
  color: string;
};

export type TrendPoint = {
  label: string;
  value: number;
};

export type RecentComplaintItem = {
  id: string;
  referenceId: string;
  title: string;
  status: string;
  date: string;
  emoji: string;
};

export type SystemMetric = {
  label: string;
  value: number;
  icon: string;
  accentColor: string;
};

export type QuickAction = {
  id: string;
  label: string;
  icon: string;
  route: string;
  color: string;
};

export type AdminNavItem = {
  id: string;
  label: string;
  route: string;
  icon: string;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', route: '/(admin)/dashboard', icon: '📊' },
  { id: 'users', label: 'Manage Users', route: '/(admin)/users', icon: '👥' },
  { id: 'complaints', label: 'Manage Complaints', route: '/(admin)/complaints', icon: '📋' },
  { id: 'activity', label: 'Activity Logs', route: '/(admin)/activity-logs', icon: '📝' },
];

export const ADMIN_DASHBOARD_MOCK = {
  adminName: 'Admin',
  stats: [
    {
      id: 'total-users',
      label: 'Total Users',
      value: 240,
      icon: '👥',
      accentColor: '#6366F1',
      iconBackground: '#EEF2FF',
      trend: { direction: 'up' as TrendDirection, label: '12% this month' },
    },
    {
      id: 'total-complaints',
      label: 'Total Complaints',
      value: 120,
      icon: '📋',
      accentColor: '#3B82F6',
      iconBackground: '#DBEAFE',
      trend: { direction: 'up' as TrendDirection, label: '8% this month' },
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      value: 12,
      icon: '⏳',
      accentColor: '#F59E0B',
      iconBackground: '#FEF3C7',
      trend: { direction: 'down' as TrendDirection, label: '3% this week' },
    },
    {
      id: 'resolved',
      label: 'Resolved',
      value: 50,
      icon: '✅',
      accentColor: '#10B981',
      iconBackground: '#D1FAE5',
      trend: { direction: 'up' as TrendDirection, label: '15% this month' },
    },
  ] satisfies DashboardStat[],
  statusBreakdown: [
    { label: 'Pending', value: 15, color: '#F59E0B' },
    { label: 'In Progress', value: 12, color: '#3B82F6' },
    { label: 'Resolved', value: 50, color: '#10B981' },
    { label: 'Rejected', value: 5, color: '#EF4444' },
  ] satisfies ChartSegment[],
  trendPoints: [
    { label: 'May 1', value: 4 },
    { label: 'May 5', value: 6 },
    { label: 'May 10', value: 5 },
    { label: 'May 15', value: 9 },
    { label: 'May 20', value: 11 },
    { label: 'May 25', value: 8 },
    { label: 'May 30', value: 13 },
  ] satisfies TrendPoint[],
  recentComplaints: [
    {
      id: '1',
      referenceId: 'CMP-2024-0012',
      title: 'Broken Street Light',
      status: 'in_progress',
      date: 'May 18, 2024 · 2:30 PM',
      emoji: '💡',
    },
    {
      id: '2',
      referenceId: 'CMP-2024-0011',
      title: 'Blocked Drainage',
      status: 'assigned',
      date: 'May 17, 2024 · 11:00 AM',
      emoji: '🚰',
    },
    {
      id: '3',
      referenceId: 'CMP-2024-0010',
      title: 'Loud Construction Noise',
      status: 'pending',
      date: 'May 16, 2024 · 9:15 PM',
      emoji: '🔊',
    },
    {
      id: '4',
      referenceId: 'CMP-2024-0009',
      title: 'Fallen Tree Branch',
      status: 'resolved',
      date: 'May 15, 2024 · 7:45 AM',
      emoji: '🌳',
    },
  ] satisfies RecentComplaintItem[],
  systemOverview: [
    { label: 'Active Users', value: 186, icon: '🟢', accentColor: '#10B981' },
    { label: 'Open Complaints', value: 27, icon: '📂', accentColor: '#F59E0B' },
    { label: 'Pending Verifications', value: 8, icon: '🪪', accentColor: '#6366F1' },
    { label: 'Responders Online', value: 14, icon: '🛡️', accentColor: '#3B82F6' },
  ] satisfies SystemMetric[],
  quickActions: [
    { id: 'users', label: 'Users', icon: '👥', route: '/(admin)/users', color: '#6366F1' },
    { id: 'complaints', label: 'Complaints', icon: '📋', route: '/(admin)/complaints', color: '#3B82F6' },
    { id: 'logs', label: 'Logs', icon: '📝', route: '/(admin)/activity-logs', color: '#10B981' },
    { id: 'home', label: 'Home', icon: '🏠', route: '/(admin)/dashboard', color: '#F59E0B' },
  ] satisfies QuickAction[],
};

export function getStatusBreakdownTotal(segments: ChartSegment[]): number {
  return segments.reduce((sum, segment) => sum + segment.value, 0);
}

export function formatDashboardDate(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    weekday: 'long',
  });
}
