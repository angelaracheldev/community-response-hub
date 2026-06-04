import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getAdminToken } from '../../utils/authStorage';

const API_BASE = 'http://127.0.0.1:5000/api/v1';

export default function AdminUsers() {
  const router = useRouter();
  const [tab, setTab] = useState<'residents' | 'responders'>('residents');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => () => {});
  const [confirmMessage, setConfirmMessage] = useState('');

  const token = getAdminToken();

  useEffect(() => {
    if (!token) return router.replace('/(admin)/login');
    loadUsers(page, pageSize, search);
  }, [tab]);

  const roleId = tab === 'residents' ? 1 : 2;

  const loadUsers = async (p = 1, ps = pageSize, s = '') => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ roleId: String(roleId), page: String(p), pageSize: String(ps) });
      if (s) q.set('search', s);
      const res = await fetch(`${API_BASE}/users?${q.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setPage(data.page || p);
      setPageSize(data.pageSize || ps);
    } catch (e) {
      console.error('Load users error', e);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = () => {
    setPage(1);
    loadUsers(1, pageSize, search);
  };

  const openDetails = (user: any) => {
    setSelected(user);
    setModalOpen(true);
  };

  const toggleActive = (user: any) => {
    setConfirmMessage(`Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} ${user.first_name} ${user.last_name}?`);
    setConfirmAction(() => async () => {
      if (!token) return;
      try {
        const action = user.is_active ? 'deactivate' : 'activate';
        const res = await fetch(`${API_BASE}/users/${user.user_id}/${action}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed');
        await loadUsers(page, pageSize, search);
      } catch (e) {
        console.error('Toggle active error', e);
      } finally {
        setConfirmOpen(false);
      }
    });
    setConfirmOpen(true);
  };

  const approveVerification = (userId: string) => {
    setConfirmMessage('Verify this resident? This will mark the resident as verified.');
    setConfirmAction(() => async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/users/${userId}/verification/review`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ verificationStatus: 'approved' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed');
        await loadUsers(page, pageSize, search);
        setModalOpen(false);
      } catch (e) {
        console.error('Approve verification error', e);
      } finally {
        setConfirmOpen(false);
      }
    });
    setConfirmOpen(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Manage Users</Text>
        <View style={styles.tabsRow}>
          <TouchableOpacity style={[styles.tabButton, tab === 'residents' && styles.activeTab]} onPress={() => setTab('residents')}>
            <Text style={tab === 'residents' ? styles.activeTabText : styles.tabText}>Residents</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, tab === 'responders' && styles.activeTab]} onPress={() => setTab('responders')}>
            <Text style={tab === 'responders' ? styles.activeTabText : styles.tabText}>Responders</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchRow}>
        <TextInput placeholder="Search" value={search} onChangeText={setSearch} style={styles.searchInput} />
        <TouchableOpacity style={styles.refreshButton} onPress={() => onSearch()}><Text style={styles.refreshText}>Search</Text></TouchableOpacity>
        <TouchableOpacity style={styles.refreshButton} onPress={() => loadUsers(1, pageSize, '')}><Text style={styles.refreshText}>Refresh</Text></TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.user_id}
          ListHeaderComponent={() => (
            <View style={styles.tableHeader}>
              <Text style={[styles.col, styles.colCode]}>User Code</Text>
              <Text style={[styles.col, styles.colName]}>Full Name</Text>
              <Text style={[styles.col, styles.colEmail]}>Email</Text>
              <Text style={[styles.col, styles.colPhone]}>Phone</Text>
              <Text style={[styles.col, styles.colSmall]}>Verified</Text>
              <Text style={[styles.col, styles.colSmall]}>Active</Text>
              <Text style={[styles.col, styles.colActions]}>Actions</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={[styles.col, styles.colCode]}>{item.user_code}</Text>
              <Text style={[styles.col, styles.colName]}>{item.first_name} {item.last_name}</Text>
              <Text style={[styles.col, styles.colEmail]}>{item.email}</Text>
              <Text style={[styles.col, styles.colPhone]}>{item.phone_number || '-'}</Text>
              <Text style={[styles.col, styles.colSmall]}>{item.is_verified ? 'Yes' : 'No'}</Text>
              <Text style={[styles.col, styles.colSmall]}>{item.is_active ? 'Yes' : 'No'}</Text>
              <View style={[styles.col, styles.colActions]}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openDetails(item)}><Text style={styles.actionText}>View</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.toggleBtn]} onPress={() => toggleActive(item)}><Text style={styles.actionText}>{item.is_active ? 'Deactivate' : 'Activate'}</Text></TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.paginationRow}>
        <TouchableOpacity disabled={page === 1} onPress={() => loadUsers(Math.max(1, page - 1), pageSize, search)} style={styles.pageBtn}><Text>Prev</Text></TouchableOpacity>
        <Text style={styles.pageText}>{page} / {Math.ceil((total || 0) / pageSize) || 1}</Text>
        <TouchableOpacity disabled={page * pageSize >= (total || 0)} onPress={() => loadUsers(page + 1, pageSize, search)} style={styles.pageBtn}><Text>Next</Text></TouchableOpacity>
      </View>

      <Modal visible={modalOpen} animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}><Text style={styles.title}>User Details</Text></View>
          {selected ? (
            <View style={styles.modalContent}>
              <Text style={styles.detail}><Text style={styles.detailLabel}>User Code: </Text>{selected.user_code}</Text>
              <Text style={styles.detail}><Text style={styles.detailLabel}>Name: </Text>{selected.first_name} {selected.last_name}</Text>
              <Text style={styles.detail}><Text style={styles.detailLabel}>Email: </Text>{selected.email}</Text>
              <Text style={styles.detail}><Text style={styles.detailLabel}>Phone: </Text>{selected.phone_number || '-'}</Text>
              <Text style={styles.detail}><Text style={styles.detailLabel}>Address: </Text>{selected.address || '-'}</Text>
              <Text style={styles.detail}><Text style={styles.detailLabel}>Verified: </Text>{selected.is_verified ? 'Yes' : 'No'}</Text>
              <Text style={styles.detail}><Text style={styles.detailLabel}>Active: </Text>{selected.is_active ? 'Yes' : 'No'}</Text>
              <View style={{ height: 16 }} />
              {!selected.is_verified && tab === 'residents' && (
                <TouchableOpacity style={styles.verifyBtn} onPress={() => approveVerification(selected.user_id)}>
                  <Text style={styles.verifyText}>Verify Resident</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalOpen(false)}><Text style={styles.closeText}>Close</Text></TouchableOpacity>
            </View>
          ) : null}
        </SafeAreaView>
      </Modal>

      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ width: '90%', backgroundColor: '#fff', padding: 16, borderRadius: 12 }}>
            <Text style={{ fontWeight: '800', marginBottom: 8 }}>Confirm</Text>
            <Text style={{ marginBottom: 16 }}>{confirmMessage}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity style={{ marginRight: 12 }} onPress={() => setConfirmOpen(false)}><Text style={{ color: '#374151' }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => { confirmAction(); }}><Text style={{ color: '#2563EB', fontWeight: '700' }}>Confirm</Text></TouchableOpacity>
            </View>
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
  searchRow: { paddingHorizontal: 16, flexDirection: 'row', gap: 8, alignItems: 'center' },
  searchInput: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  refreshButton: { marginLeft: 8, padding: 10 },
  refreshText: { color: '#2563EB', fontWeight: '700' },
  tableHeader: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  row: { flexDirection: 'row', padding: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#f3f4f6' },
  col: { paddingHorizontal: 6 },
  colCode: { width: 90 },
  colName: { flex: 1 },
  colEmail: { width: 160 },
  colPhone: { width: 110 },
  colSmall: { width: 60, textAlign: 'center' },
  colActions: { width: 160, flexDirection: 'row', gap: 6 },
  actionBtn: { padding: 8, backgroundColor: '#2563EB', borderRadius: 8, marginRight: 8 },
  toggleBtn: { backgroundColor: '#10B981' },
  actionText: { color: '#fff', fontWeight: '700' },
  paginationRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12 },
  pageBtn: { padding: 8, marginHorizontal: 8 },
  pageText: { fontWeight: '700' },
  modalSafe: { flex: 1, backgroundColor: '#f8fafc' },
  modalHeader: { padding: 16, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  modalContent: { padding: 16 },
  detail: { marginBottom: 8, color: '#374151' },
  detailLabel: { fontWeight: '700', color: '#111827' },
  verifyBtn: { padding: 12, backgroundColor: '#10B981', borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  verifyText: { color: '#fff', fontWeight: '800' },
  closeBtn: { padding: 12, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  closeText: { color: '#111827', fontWeight: '700' },
});
