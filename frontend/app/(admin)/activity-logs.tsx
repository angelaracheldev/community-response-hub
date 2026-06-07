import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminListCard } from '../../components/admin/AdminListCard';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminSegmentTabs } from '../../components/admin/AdminSegmentTabs';
import { adminListStyles as s } from '../../components/admin/adminListStyles';
import { AdminPageShell } from '../../components/dashboard/AdminPageShell';
import { useDashboardLayout } from '../../hooks/useDashboardLayout';
import { API_BASE } from '../../utils/apiConfig';
import { getAdminToken } from '../../utils/authStorage';

const LOG_TABS = [
  { id: 'complaint', label: 'Complaint' },
  { id: 'user', label: 'User' },
];

export default function ActivityLogs() {
  const layout = useDashboardLayout();
  const token = getAdminToken();
  const [mode, setMode] = useState<'complaint' | 'user'>('complaint');
  const [targetId, setTargetId] = useState('');
  const [description, setDescription] = useState('');
  const [performedBy, setPerformedBy] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  const loadLogs = async (p = 1, dir = sortDir) => {
    if (!token) return;
    if (!targetId.trim()) return;
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: String(p),
        pageSize: String(pageSize),
        sortBy: 'created_at',
        sortDir: dir,
      });
      if (description) q.set('description', description);
      if (performedBy) q.set('performedBy', performedBy);

      const url =
        mode === 'complaint'
          ? `${API_BASE}/complaints/${encodeURIComponent(targetId)}/activity-logs?${q.toString()}`
          : `${API_BASE}/users/${encodeURIComponent(targetId)}/activity-logs?${q.toString()}`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setPage(data.page || p);
    } catch (e) {
      console.error('Load logs error', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = () => {
    const nextDir = sortDir === 'desc' ? 'asc' : 'desc';
    setSortDir(nextDir);
    setPage(1);
    loadLogs(1, nextDir);
  };

  const renderLogItem = ({ item }: { item: any }) => {
    const when = new Date(item.created_at).toLocaleString();
    const performer = item.performed_by_first_name
      ? `${item.performed_by_first_name} ${item.performed_by_last_name}`
      : item.performed_by;

    if (layout.useCompactList) {
      return (
        <AdminListCard
          title={item.action_type}
          subtitle={when}
          fields={[
            { label: 'By', value: performer || '-' },
            { label: 'Details', value: item.description || '-' },
          ]}
        />
      );
    }

    return (
      <View style={s.tableRow}>
        <Text style={[s.col, styles.colWhen]}>{when}</Text>
        <Text style={[s.col, styles.colAction]}>{item.action_type}</Text>
        <Text style={[s.col, styles.colBy]} numberOfLines={2}>
          {performer}
        </Text>
        <Text style={[s.col, styles.colDesc]}>{item.description}</Text>
      </View>
    );
  };

  return (
    <AdminPageShell activeNavId="activity" pageTitle="Activity Logs" scrollEnabled={layout.useCompactList}>
      <View style={s.toolbar}>
        <AdminSegmentTabs
          tabs={LOG_TABS}
          activeId={mode}
          onChange={(id) => setMode(id as typeof mode)}
          compact={layout.useCompactList}
        />

        <View style={layout.useCompactList ? s.filtersStack : styles.filtersDesktop}>
          <TextInput
            placeholder={mode === 'complaint' ? 'Complaint ID' : 'User ID'}
            value={targetId}
            onChangeText={setTargetId}
            style={layout.useCompactList ? s.filterInput : styles.filterInputDesktop}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Description contains"
            value={description}
            onChangeText={setDescription}
            style={layout.useCompactList ? s.filterInput : styles.filterInputDesktop}
          />
          <TextInput
            placeholder="Performed by (user id)"
            value={performedBy}
            onChangeText={setPerformedBy}
            style={layout.useCompactList ? s.filterInput : styles.filterInputDesktop}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[s.loadBtn, layout.useCompactList && s.loadBtnCompact]}
            onPress={() => {
              setPage(1);
              loadLogs(1);
            }}
          >
            <Text style={s.loadBtnText}>Load Logs</Text>
          </TouchableOpacity>
        </View>

        <View style={s.sortRow}>
          <TouchableOpacity onPress={toggleSort}>
            <Text style={s.sortText}>Sort: {sortDir.toUpperCase()}</Text>
          </TouchableOpacity>
          <Text style={s.countText}>Total: {total}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={s.loader} color="#6366F1" />
      ) : layout.useCompactList ? (
        logs.length === 0 ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyText}>
              {targetId.trim() ? 'No activity logs found.' : 'Enter an ID and tap Load Logs.'}
            </Text>
          </View>
        ) : (
          logs.map((item) => (
            <React.Fragment key={item.activity_log_id}>{renderLogItem({ item })}</React.Fragment>
          ))
        )
      ) : (
        <FlatList
          style={s.list}
          data={logs}
          keyExtractor={(item) => item.activity_log_id}
          nestedScrollEnabled
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <Text style={s.emptyText}>
                {targetId.trim() ? 'No activity logs found.' : 'Enter an ID and tap Load Logs.'}
              </Text>
            </View>
          }
          ListHeaderComponent={
            logs.length === 0
              ? undefined
              : () => (
                  <View style={s.tableHeader}>
                    <Text style={[s.col, styles.colWhen]}>When</Text>
                    <Text style={[s.col, styles.colAction]}>Action</Text>
                    <Text style={[s.col, styles.colBy]}>Performed By</Text>
                    <Text style={[s.col, styles.colDesc]}>Description</Text>
                  </View>
                )
          }
          renderItem={renderLogItem}
        />
      )}

      {!loading ? (
        <AdminPagination
          page={page}
          total={total}
          pageSize={pageSize}
          onPrev={() => loadLogs(Math.max(1, page - 1))}
          onNext={() => loadLogs(page + 1)}
        />
      ) : null}
    </AdminPageShell>
  );
}

const styles = StyleSheet.create({
  filtersDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  filterInputDesktop: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  colWhen: { width: 140 },
  colAction: { width: 120 },
  colBy: { width: 120 },
  colDesc: { flex: 1, minWidth: 100 },
});
