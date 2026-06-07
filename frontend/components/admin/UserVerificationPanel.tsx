import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminListCard } from './AdminListCard';
import { AdminSegmentTabs } from './AdminSegmentTabs';
import { UserDetailModal } from './UserDetailModal';
import { API_BASE } from '../../utils/apiConfig';
import { getAdminToken } from '../../utils/authStorage';

import { VerificationUser } from './userTypes';

type VerificationFilter = 'pending' | 'approved' | 'rejected';

const FILTER_TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Accepted' },
  { id: 'rejected', label: 'Rejected' },
];

type Props = {
  compact?: boolean;
  onUpdated?: () => void;
  refreshTrigger?: number;
};

function formatDate(value?: string): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

function filterLabel(filter: VerificationFilter): string {
  if (filter === 'pending') return 'Pending Review';
  if (filter === 'approved') return 'Accepted';
  return 'Rejected';
}

export function UserVerificationPanel({ compact, onUpdated, refreshTrigger = 0 }: Props) {
  const token = getAdminToken();
  const [statusFilter, setStatusFilter] = useState<VerificationFilter>('pending');
  const [residents, setResidents] = useState<VerificationUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  const requestOptions = useCallback(
    () => ({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const loadResidents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/users?roleId=1&verificationStatus=${statusFilter}`,
        requestOptions()
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load verifications');
      setResidents(data.users || []);
    } catch (e) {
      console.error('Load verifications error:', e);
      setResidents([]);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, requestOptions]);

  useEffect(() => {
    loadResidents();
  }, [loadResidents, refreshTrigger]);

  const handleUpdated = () => {
    loadResidents();
    onUpdated?.();
  };

  const emptyMessage =
    statusFilter === 'pending'
      ? 'No pending verification records found.'
      : statusFilter === 'approved'
        ? 'No accepted residents found.'
        : 'No rejected residents found.';

  return (
    <View style={vStyles.section}>
      <View style={vStyles.sectionHeader}>
        <Text style={vStyles.sectionTitle}>Resident Verifications</Text>
        {statusFilter === 'pending' && residents.length > 0 ? (
          <View style={vStyles.countBadge}>
            <Text style={vStyles.countBadgeText}>{residents.length}</Text>
          </View>
        ) : null}
      </View>

      <AdminSegmentTabs
        tabs={FILTER_TABS}
        activeId={statusFilter}
        onChange={(id) => setStatusFilter(id as VerificationFilter)}
        compact={compact}
      />

      <Text style={vStyles.filterHint}>{filterLabel(statusFilter)} — tap View to review details and ID.</Text>

      {loading ? (
        <ActivityIndicator color="#6366F1" style={{ marginVertical: 16 }} />
      ) : residents.length === 0 ? (
        <Text style={vStyles.emptyText}>{emptyMessage}</Text>
      ) : compact ? (
        <View style={vStyles.cardList}>
          {residents.map((user) => (
            <AdminListCard
              key={user.user_id}
              title={`${user.first_name} ${user.last_name}`}
              subtitle={`${user.user_code} · Registered ${formatDate(user.created_at)}`}
              fields={[
                { label: 'Email', value: user.email },
                { label: 'Phone', value: user.phone_number || '-' },
                { label: 'Type', value: user.verification_type || '-' },
                { label: 'Status', value: user.verification_status || statusFilter },
              ]}
              actions={
                <TouchableOpacity style={vStyles.viewBtn} onPress={() => setDetailUserId(user.user_id)}>
                  <Text style={vStyles.viewBtnText}>View</Text>
                </TouchableOpacity>
              }
            />
          ))}
        </View>
      ) : (
        <View style={vStyles.tableWrap}>
          <View style={vStyles.tableHeader}>
            <Text style={[vStyles.cell, vStyles.cellHeader, vStyles.colName]}>Name</Text>
            <Text style={[vStyles.cell, vStyles.cellHeader, vStyles.colEmail]}>Email</Text>
            <Text style={[vStyles.cell, vStyles.cellHeader, vStyles.colDate]}>Registered</Text>
            <Text style={[vStyles.cell, vStyles.cellHeader, vStyles.colType]}>Type</Text>
            <Text style={[vStyles.cell, vStyles.cellHeader, vStyles.colActions]}>Actions</Text>
          </View>
          {residents.map((user, index) => (
            <View
              key={user.user_id}
              style={[vStyles.tableRow, index === residents.length - 1 && vStyles.tableRowLast]}
            >
              <Text style={[vStyles.cell, vStyles.colName]} numberOfLines={1}>
                {user.first_name} {user.last_name}
              </Text>
              <Text style={[vStyles.cell, vStyles.colEmail]} numberOfLines={1}>
                {user.email}
              </Text>
              <Text style={[vStyles.cell, vStyles.colDate]}>{formatDate(user.created_at)}</Text>
              <Text style={[vStyles.cell, vStyles.colType]} numberOfLines={1}>
                {user.verification_type || '-'}
              </Text>
              <View style={[vStyles.cell, vStyles.colActions]}>
                <TouchableOpacity style={vStyles.viewBtn} onPress={() => setDetailUserId(user.user_id)}>
                  <Text style={vStyles.viewBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <UserDetailModal
        visible={detailUserId !== null}
        userId={detailUserId}
        onClose={() => setDetailUserId(null)}
        onUpdated={handleUpdated}
        showVerificationActions
      />
    </View>
  );
}

const vStyles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#92400E',
  },
  countBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 999,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  countBadgeText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  filterHint: {
    fontSize: 13,
    color: '#78716C',
  },
  emptyText: {
    color: '#78716C',
    fontSize: 14,
  },
  cardList: {
    gap: 0,
  },
  tableWrap: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderColor: '#FDE68A',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#FEF9C3',
    alignItems: 'center',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  cell: {
    paddingHorizontal: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  cellHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  colName: { flex: 2, minWidth: 130 },
  colEmail: { flex: 3, minWidth: 180 },
  colDate: { flex: 1, minWidth: 100, maxWidth: 120 },
  colType: { width: 88 },
  colActions: { width: 88, alignItems: 'flex-end' },
  viewBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  viewBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
