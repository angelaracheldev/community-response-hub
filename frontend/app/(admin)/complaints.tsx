import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge';
import { AdminListCard } from '../../components/admin/AdminListCard';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminSegmentTabs } from '../../components/admin/AdminSegmentTabs';
import { adminListStyles as s } from '../../components/admin/adminListStyles';
import { PageShell } from '../../components/common/PageShell';
import { useAppLayout } from '../../hooks/useAppLayout';
import { formatComplaintStatus } from '../../utils/complaintApi';
import { ADMIN_API_BASE, API_BASE } from '../../utils/apiConfig';
import { getAdminToken } from '../../utils/authStorage';

const COMPLAINT_TABS = [
  { id: 'active', label: 'Active' },
  { id: 'closed', label: 'Closed' },
  { id: 'resolved', label: 'Resolved' },
];

export default function AdminComplaints() {
  const layout = useAppLayout();
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
    if (!token) return;
    loadComplaints(1, pageSize, tab);
  }, [tab]);

  const loadComplaints = async (p = 1, ps = pageSize, currentTab: typeof tab = 'active') => {
    if (!token) return;
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

  const openDetails = async (complaintId: string) => {
    if (!token) return;
    setModalOpen(true);
    setSelected(null);
    try {
      const res = await fetch(`${ADMIN_API_BASE}/admin/complaints/${complaintId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setSelected(data);
    } catch (e) {
      console.error('Load complaint details error', e);
    }
  };

  const renderComplaintItem = ({ item }: { item: any }) => {
    if (layout.useCompactList) {
      return (
        <AdminListCard
          title={item.title}
          subtitle={`#${item.reference_id}`}
          fields={[
            { label: 'Category', value: item.category_name || '-' },
            { label: 'Status', value: formatComplaintStatus(item.status) },
            { label: 'Priority', value: item.priority_level || '-' },
          ]}
          actions={
            <TouchableOpacity style={s.actionBtn} onPress={() => openDetails(item.complaint_id)}>
              <Text style={s.actionBtnText}>View Details</Text>
            </TouchableOpacity>
          }
        />
      );
    }

    return (
      <View style={s.tableRow}>
        <Text style={[s.col, styles.colId]} numberOfLines={1}>
          {item.reference_id}
        </Text>
        <Text style={[s.col, styles.colTitle]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[s.col, styles.colCat]}>{item.category_name || '-'}</Text>
        <View style={[s.col, styles.colStatus]}>
          <ComplaintStatusBadge status={item.status} compact />
        </View>
        <Text style={[s.col, styles.colSmall]}>{item.priority_level}</Text>
        <View style={[s.col, styles.colActions]}>
          <TouchableOpacity style={s.actionBtn} onPress={() => openDetails(item.complaint_id)}>
            <Text style={s.actionBtnText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <PageShell
      portal="admin"
      activeNavId="complaints"
      pageTitle="Manage Complaints"
      scrollEnabled={layout.useCompactList}
    >
      <View style={s.toolbar}>
        <AdminSegmentTabs
          tabs={COMPLAINT_TABS}
          activeId={tab}
          onChange={(id) => setTab(id as typeof tab)}
          compact={layout.useCompactList}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={s.loader} color="#6366F1" />
      ) : layout.useCompactList ? (
        complaints.length === 0 ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyText}>No complaints in this tab.</Text>
          </View>
        ) : (
          complaints.map((item) => (
            <React.Fragment key={item.complaint_id}>{renderComplaintItem({ item })}</React.Fragment>
          ))
        )
      ) : (
        <FlatList
          style={s.list}
          data={complaints}
          keyExtractor={(item) => item.complaint_id}
          nestedScrollEnabled
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <Text style={s.emptyText}>No complaints in this tab.</Text>
            </View>
          }
          ListHeaderComponent={() => (
            <View style={s.tableHeader}>
              <Text style={[s.col, styles.colId]}>ID</Text>
              <Text style={[s.col, styles.colTitle]}>Title</Text>
              <Text style={[s.col, styles.colCat]}>Category</Text>
              <Text style={[s.col, styles.colStatus]}>Status</Text>
              <Text style={[s.col, styles.colSmall]}>Priority</Text>
              <Text style={[s.col, styles.colActions]}>Actions</Text>
            </View>
          )}
          renderItem={renderComplaintItem}
        />
      )}

      {!loading ? (
        <AdminPagination
          page={page}
          total={total}
          pageSize={pageSize}
          onPrev={() => loadComplaints(Math.max(1, page - 1), pageSize, tab)}
          onNext={() => loadComplaints(page + 1, pageSize, tab)}
        />
      ) : null}

      <Modal visible={modalOpen} animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <SafeAreaView style={s.modalSafe}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Complaint Details</Text>
          </View>
          <ScrollView style={s.modalScroll} contentContainerStyle={s.modalContent}>
            {!selected ? (
              <ActivityIndicator color="#6366F1" />
            ) : (
              <>
                <Text style={s.detail}>
                  <Text style={s.detailLabel}>Title: </Text>
                  {selected.complaint.title}
                </Text>
                <Text style={s.detail}>
                  <Text style={s.detailLabel}>Description: </Text>
                  {selected.complaint.description}
                </Text>
                <Text style={s.detail}>
                  <Text style={s.detailLabel}>Status: </Text>
                  {formatComplaintStatus(selected.complaint.status)}
                </Text>
                <Text style={s.detail}>
                  <Text style={s.detailLabel}>Category: </Text>
                  {selected.category.category_name}
                </Text>
                <Text style={s.sectionTitle}>Assignments</Text>
                {selected.assignments.length === 0 ? (
                  <Text style={s.detail}>No assignments</Text>
                ) : (
                  selected.assignments.map((a: any) => (
                    <Text key={a.assignment_id} style={s.detail}>
                      {a.assigned_at} —{' '}
                      {a.assigned_to_first_name
                        ? `${a.assigned_to_first_name} ${a.assigned_to_last_name}`
                        : a.assigned_to}
                    </Text>
                  ))
                )}
                <Text style={s.sectionTitle}>Media</Text>
                {selected.media.length === 0 ? (
                  <Text style={s.detail}>No media</Text>
                ) : (
                  selected.media.map((m: any) => (
                    <Text key={m.media_id} style={s.detail}>
                      {m.media_type} — {m.media_url}
                    </Text>
                  ))
                )}
                <Text style={s.sectionTitle}>Activity Timeline</Text>
                {selected.activityLogs.length === 0 ? (
                  <Text style={s.detail}>No logs</Text>
                ) : (
                  selected.activityLogs.map((l: any) => (
                    <Text key={l.activity_log_id} style={s.detail}>
                      {l.created_at} — {l.action_type} — {l.description}
                    </Text>
                  ))
                )}
                <TouchableOpacity style={s.closeBtn} onPress={() => setModalOpen(false)}>
                  <Text style={s.closeText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  colId: { width: 100 },
  colTitle: { flex: 1, minWidth: 100 },
  colCat: { width: 100 },
  colStatus: { width: 110 },
  colSmall: { width: 72 },
  colActions: { width: 80 },
});
