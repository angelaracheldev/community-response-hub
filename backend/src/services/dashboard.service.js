const statsRepository = require('../repositories/stats.repository');

const STATUS_COLORS = {
  pending: '#F59E0B',
  assigned: '#8B5CF6',
  in_progress: '#3B82F6',
  resolved: '#10B981',
  rejected: '#EF4444',
  cancelled: '#6B7280',
};

const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

const CATEGORY_ICONS = {
  noise: 'volume-high-outline',
  parking: 'car-outline',
  garbage: 'trash-outline',
  animal: 'paw-outline',
  infrastructure: 'construct-outline',
};

function iconForCategory(name) {
  if (!name) return 'clipboard-outline';
  const key = name.toLowerCase();
  for (const [fragment, icon] of Object.entries(CATEGORY_ICONS)) {
    if (key.includes(fragment)) return icon;
  }
  return 'clipboard-outline';
}

function formatRecentDate(value) {
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

async function getAdminDashboard() {
  const [summaryResult, statusResult, recentResult, trendResult] = await Promise.all([
    statsRepository.getDashboardSummary(),
    statsRepository.getComplaintsByStatus(),
    statsRepository.getRecentComplaints(5),
    statsRepository.getComplaintTrend(30),
  ]);

  const summary = summaryResult.rows[0];
  const statusBreakdown = statusResult.rows.map((row) => ({
    label: STATUS_LABELS[row.status] || row.status,
    value: Number(row.count),
    color: STATUS_COLORS[row.status] || '#CBD5E1',
  }));

  const recentComplaints = recentResult.rows.map((row) => ({
    id: row.complaint_id,
    referenceId: row.reference_id,
    title: row.title,
    status: row.status,
    date: formatRecentDate(row.created_at),
    icon: iconForCategory(row.category_name),
  }));

  const trendPoints = trendResult.rows.map((row) => ({
    label: new Date(row.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    value: Number(row.count),
  }));

  return {
    body: {
      status: 'ok',
      data: {
        stats: [
          {
            id: 'total-users',
            label: 'Total Users',
            value: Number(summary.user_count),
            icon: 'people-outline',
            accentColor: '#6366F1',
            iconBackground: '#EEF2FF',
          },
          {
            id: 'total-complaints',
            label: 'Total Complaints',
            value: Number(summary.complaint_count),
            icon: 'clipboard-outline',
            accentColor: '#3B82F6',
            iconBackground: '#DBEAFE',
          },
          {
            id: 'in-progress',
            label: 'In Progress',
            value: Number(summary.in_progress_count),
            icon: 'hourglass-outline',
            accentColor: '#F59E0B',
            iconBackground: '#FEF3C7',
          },
          {
            id: 'resolved',
            label: 'Resolved',
            value: Number(summary.resolved_count),
            icon: 'checkmark-circle-outline',
            accentColor: '#10B981',
            iconBackground: '#D1FAE5',
          },
        ],
        statusBreakdown,
        trendPoints,
        recentComplaints,
        systemOverview: [
          {
            label: 'Active Users',
            value: Number(summary.active_users_count),
            icon: 'radio-button-on',
            accentColor: '#10B981',
          },
          {
            label: 'Open Complaints',
            value: Number(summary.open_count),
            icon: 'folder-open-outline',
            accentColor: '#F59E0B',
          },
          {
            label: 'Pending Verifications',
            value: Number(summary.pending_verifications_count),
            icon: 'card-outline',
            accentColor: '#6366F1',
          },
          {
            label: 'Active Responders',
            value: Number(summary.responder_count),
            icon: 'shield-checkmark-outline',
            accentColor: '#3B82F6',
          },
        ],
      },
      timestamp: new Date().toISOString(),
    },
  };
}

module.exports = {
  getAdminDashboard,
};
