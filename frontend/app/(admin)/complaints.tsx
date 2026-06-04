import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getAdminToken } from '../../utils/authStorage';

const API_BASE = 'http://127.0.0.1:5000/api/v1';

const ACTIVE_STATUSES = ['pending', 'under_review', 'assigned', 'in_progress'];
const CLOSED_STATUSES = ['cancelled', 'rejected'];
const RESOLVED_STATUS = ['resolved'];

export default function AdminComplaints() {
  const router = useRouter();
  const [tab, setTab] = useState<'active' | 'closed' | 'resolved'>('active');
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const token = getAdminToken();

  useEffect(() => {
    if (!token) return router.replace('/(admin)/login');
    loadComplaints(1, pageSize, tab);
  }, [tab]);

  const loadComplaints = async (p = 1, ps = pageSize, currentTab = 'active') => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: String(p), pageSize: String(ps) });
      if (currentTab === 'active') q.set('statusGroup', 'active');
      if (currentTab === 'closed') q.set('statusGroup', 'closed');
      if (currentTab === 'resolved') q.set('statusGroup', 'resolved');
      const url = `${API_BASE}/complaints?${q.toString()}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setComplaints(data.complaints || []);
      setTotal(data.total || 0);
      setPage(data.page || p);
      setPageSize(data.pageSize || ps);
    } catch (e) {
      console.error('Load complaints error', e);
    } finally {
      setLoading(false);
    }
  };

  const byTab = () => complaints;

  const openDetails = async (complaintId: string) => {
    if (!token) return;
    setModalOpen(true);
    setSelected(null);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/admin/complaints/${complaintId}/details`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setSelected(data);
    } catch (e) {
      console.error('Load complaint details error', e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Manage Complaints</Text>
        <View style={styles.tabsRow}>
          <TouchableOpacity style={[styles.tabButton, tab === 'active' && styles.activeTab]} onPress={() => setTab('active')}><Text style={tab==='active'?styles.activeTabText:styles.tabText}>Active</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, tab === 'closed' && styles.activeTab]} onPress={() => setTab('closed')}><Text style={tab==='closed'?styles.activeTabText:styles.tabText}>Closed</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, tab === 'resolved' && styles.activeTab]} onPress={() => setTab('resolved')}><Text style={tab==='resolved'?styles.activeTabText:styles.tabText}>Resolved</Text></TouchableOpacity>
        </View>
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
        <FlatList
          data={byTab()}
          keyExtractor={(i) => i.complaint_id}
          ListHeaderComponent={() => (
            <View style={styles.tableHeader}>
              <Text style={[styles.col, styles.colId]}>ID</Text>
              <Text style={[styles.col, styles.colTitle]}>Title</Text>
              <Text style={[styles.col, styles.colCat]}>Category</Text>
              <Text style={[styles.col, styles.colSmall]}>Status</Text>
              <Text style={[styles.col, styles.colSmall]}>Priority</Text>
              <Text style={[styles.col, styles.colActions]}>Actions</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={[styles.col, styles.colId]} numberOfLines={1}>{item.complaint_id.split('-')[0]}</Text>
              <Text style={[styles.col, styles.colTitle]} numberOfLines={1}>{item.title}</Text>
              <Text style={[styles.col, styles.colCat]}>{item.category_name || '-'}</Text>
              <Text style={[styles.col, styles.colSmall]}>{item.status}</Text>
              <Text style={[styles.col, styles.colSmall]}>{item.priority_level}</Text>
              <View style={[styles.col, styles.colActions]}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openDetails(item.complaint_id)}><Text style={styles.actionText}>View</Text></TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.paginationRow}>
        <TouchableOpacity disabled={page === 1} onPress={() => loadComplaints(Math.max(1, page - 1), pageSize, tab)} style={styles.pageBtn}><Text>Prev</Text></TouchableOpacity>
        <Text style={styles.pageText}>{page} / {Math.ceil((total || 0) / pageSize) || 1}</Text>
        <TouchableOpacity disabled={page * pageSize >= (total || 0)} onPress={() => loadComplaints(page + 1, pageSize, tab)} style={styles.pageBtn}><Text>Next</Text></TouchableOpacity>
      </View>

      <Modal visible={modalOpen} animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}><Text style={styles.title}>Complaint Details</Text></View>
          <View style={styles.modalContent}>
            {!selected ? <ActivityIndicator /> : (
              <>
                <Text style={styles.detail}><Text style={styles.detailLabel}>Title: </Text>{selected.complaint.title}</Text>
                <Text style={styles.detail}><Text style={styles.detailLabel}>Description: </Text>{selected.complaint.description}</Text>
                <Text style={styles.detail}><Text style={styles.detailLabel}>Status: </Text>{selected.complaint.status}</Text>
                <Text style={styles.detail}><Text style={styles.detailLabel}>Category: </Text>{selected.category.category_name}</Text>
                <Text style={styles.sectionTitle}>Assignments</Text>
                {selected.assignments.length === 0 ? <Text style={styles.detail}>No assignments</Text> : selected.assignments.map((a: any) => (
                  <Text key={a.assignment_id} style={styles.detail}>{a.assigned_at} — {a.assigned_to_first_name ? `${a.assigned_to_first_name} ${a.assigned_to_last_name}` : a.assigned_to}</Text>
                ))}

                <Text style={styles.sectionTitle}>Media</Text>
                {selected.media.length === 0 ? <Text style={styles.detail}>No media</Text> : selected.media.map((m: any) => (
                  <Text key={m.media_id} style={styles.detail}>{m.media_type} — {m.media_url}</Text>
                ))}

                <Text style={styles.sectionTitle}>Activity Timeline</Text>
                {selected.activityLogs.length === 0 ? <Text style={styles.detail}>No logs</Text> : selected.activityLogs.map((l: any) => (
                  <Text key={l.activity_log_id} style={styles.detail}>{l.created_at} — {l.action_type} — {l.description}</Text>
                ))}
              </>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalOpen(false)}><Text style={styles.closeText}>Close</Text></TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  headerRow: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  tabsRow: { flexDirection: 'row' },
  tabButton: { padding: 8, marginLeft: 8, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  activeTab: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  tabText: { color: '#374151', fontWeight: '700' },
  activeTabText: { color: '#fff', fontWeight: '700' },
  tableHeader: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  row: { flexDirection: 'row', padding: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#f3f4f6' },
  col: { paddingHorizontal: 6 },
  colId: { width: 60 },
  colTitle: { flex: 1 },
  colCat: { width: 120 },
  colSmall: { width: 90 },
  colActions: { width: 100 },
  actionBtn: { padding: 8, backgroundColor: '#2563EB', borderRadius: 8 },
  actionText: { color: '#fff', fontWeight: '700' },
  modalSafe: { flex: 1, backgroundColor: '#f8fafc' },
  modalHeader: { padding: 16, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  modalContent: { padding: 16 },
  detail: { marginBottom: 8, color: '#374151' },
  detailLabel: { fontWeight: '700', color: '#111827' },
  sectionTitle: { marginTop: 12, fontWeight: '800', color: '#111827' },
  closeBtn: { marginTop: 16, padding: 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  closeText: { fontWeight: '700' },
});
