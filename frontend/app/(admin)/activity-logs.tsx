import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getAdminToken } from '../../utils/authStorage';

const API_BASE = 'http://127.0.0.1:5000/api/v1';

export default function ActivityLogs() {
  const router = useRouter();
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

  useEffect(() => {
    if (!token) router.replace('/(admin)/login');
  }, []);

  const loadLogs = async (p = 1) => {
    if (!token) return;
    if (!targetId) return;
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: String(p), pageSize: String(pageSize), sortBy: 'created_at', sortDir });
      if (description) q.set('description', description);
      if (performedBy) q.set('performedBy', performedBy);

      const url = mode === 'complaint'
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Activity Logs</Text>
        <View style={styles.modeRow}>
          <TouchableOpacity style={[styles.modeBtn, mode === 'complaint' && styles.modeActive]} onPress={() => setMode('complaint')}><Text style={mode === 'complaint' ? styles.modeTextActive : styles.modeText}>Complaint</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.modeBtn, mode === 'user' && styles.modeActive]} onPress={() => setMode('user')}><Text style={mode === 'user' ? styles.modeTextActive : styles.modeText}>User</Text></TouchableOpacity>
        </View>
      </View>

      <View style={styles.filtersRow}>
        <TextInput placeholder={mode === 'complaint' ? 'Complaint ID' : 'User ID'} value={targetId} onChangeText={setTargetId} style={styles.input} />
        <TextInput placeholder="Description contains" value={description} onChangeText={setDescription} style={styles.input} />
        <TextInput placeholder="Performed By (user id)" value={performedBy} onChangeText={setPerformedBy} style={styles.input} />
        <TouchableOpacity style={styles.actionBtn} onPress={() => { setPage(1); loadLogs(1); }}><Text style={styles.actionText}>Load</Text></TouchableOpacity>
      </View>

      <View style={styles.sortRow}>
        <TouchableOpacity style={styles.sortBtn} onPress={() => { setSortDir(sortDir === 'desc' ? 'asc' : 'desc'); loadLogs(1); }}>
          <Text style={styles.sortText}>Sort: {sortDir.toUpperCase()}</Text>
        </TouchableOpacity>
        <Text style={styles.countText}>Total: {total}</Text>
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.activity_log_id}
          ListHeaderComponent={() => (
            <View style={styles.tableHeader}>
              <Text style={[styles.col, styles.colSmall]}>When</Text>
              <Text style={[styles.col, styles.colLarge]}>Action</Text>
              <Text style={[styles.col, styles.colLarge]}>Performed By</Text>
              <Text style={[styles.col, styles.colFlex]}>Description</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={[styles.col, styles.colSmall]}>{new Date(item.created_at).toLocaleString()}</Text>
              <Text style={[styles.col, styles.colLarge]}>{item.action_type}</Text>
              <Text style={[styles.col, styles.colLarge]}>{item.performed_by_first_name ? `${item.performed_by_first_name} ${item.performed_by_last_name}` : item.performed_by}</Text>
              <Text style={[styles.col, styles.colFlex]}>{item.description}</Text>
            </View>
          )}
        />
      )}

      <View style={styles.paginationRow}>
        <TouchableOpacity disabled={page === 1} onPress={() => loadLogs(Math.max(1, page - 1))} style={styles.pageBtn}><Text>Prev</Text></TouchableOpacity>
        <Text style={styles.pageText}>{page} / {Math.max(1, Math.ceil((total || 0) / pageSize))}</Text>
        <TouchableOpacity disabled={page * pageSize >= (total || 0)} onPress={() => loadLogs(page + 1)} style={styles.pageBtn}><Text>Next</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  headerRow: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  modeRow: { flexDirection: 'row' },
  modeBtn: { padding: 8, marginLeft: 8, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  modeActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  modeText: { color: '#374151', fontWeight: '700' },
  modeTextActive: { color: '#fff', fontWeight: '700' },
  filtersRow: { paddingHorizontal: 16, flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#e5e7eb', marginRight: 8 },
  actionBtn: { padding: 10, backgroundColor: '#2563EB', borderRadius: 10 },
  actionText: { color: '#fff', fontWeight: '700' },
  sortRow: { padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sortBtn: { padding: 8 },
  sortText: { fontWeight: '700' },
  countText: { color: '#6b7280' },
  tableHeader: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  row: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f3f4f6' },
  col: { paddingHorizontal: 6 },
  colSmall: { width: 140 },
  colLarge: { width: 140 },
  colFlex: { flex: 1 },
  paginationRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12 },
  pageBtn: { padding: 8, marginHorizontal: 8 },
  pageText: { fontWeight: '700' },
});
