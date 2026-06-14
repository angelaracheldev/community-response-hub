import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge';
import { AdminListCard } from '../../components/admin/AdminListCard';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminSegmentTabs } from '../../components/admin/AdminSegmentTabs';
import { adminListStyles as s } from '../../styles/admin/list';
import { PageShell } from '../../components/common/PageShell';
import { useAppLayout } from '../../hooks/useAppLayout';
import { fetchAdminComplaintDetails, fetchAdminComplaints } from '../../utils/adminApi';
import { formatComplaintStatus } from '../../utils/complaintApi';
import { adminComplaintsStyles as styles } from '../../styles/app/adminComplaints';
import { Picker } from '@react-native-picker/picker';
import { Image } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { authFetch } from '../../utils/authFetch';



// const API_BASE = 'http://YOUR_BACKEND_URL/api'; // replace with your env later
// const API_BASE = 'http://localhost:5000/api';
import { API_BASE } from '../../utils/apiConfig';

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
  const [selectedResponder, setSelectedResponder] = useState<string>('');
  const [responders, setResponders] = useState<any[]>([]);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const isLocked = ['rejected', 'cancelled', 'resolved'].includes(
  selected?.complaint?.status
);
  const lastAssignment =
    selected?.assignments?.[selected.assignments.length - 1];
  const loadResponders = async () => {
    try {
      const res = await authFetch(`${API_BASE}/users/responders`);
      const data = await res.json();
      setResponders(data.users || []);
    } catch (err) {
      console.error('Failed to load responders', err);
    }

  };

  useEffect(() => {
    loadComplaints(1, pageSize, tab);
    loadResponders();
  }, [tab]);

  useEffect(() => {
    if (!modalOpen) {
      setSelectedResponder('');
    }
  }, [modalOpen]);

  

  const [viewerVisible, setViewerVisible] = useState(false);
const [activeMedia, setActiveMedia] = useState<any>(null);

// const openEvidenceViewer = async (media: any) => {
//   setActiveMedia(media);
//   setViewerVisible(true);

//   // 🔥 LOG activity
//   await authFetch(`${API_BASE}/activity-logs`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       action_type: 'evidence_viewed',
//       description: `Viewed evidence (${media.media_type})`,
//       entity_id: selected.complaint.complaint_id,
//       metadata: { media_id: media.media_id }
//     }),
//   });

  
// };


const openEvidenceViewer = async (media: any) => {
  setActiveMedia(media);
  setViewerVisible(true);

  try {
    await authFetch(`${API_BASE}/activity-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        complaintId: selected.complaint.complaint_id,
        actionType: 'evidence_viewed',
        description: `Viewed evidence (${media.media_type})`,
        metadata: {
          media_id: media.media_id,
          media_type: media.media_type,
        },
      }),
    });
  } catch (err) {
    console.error('Failed to log evidence view:', err);
  }
};

  const loadComplaints = async (p = 1, ps = pageSize, currentTab: typeof tab = 'active') => {
    setLoading(true);
    try {
      const data = await fetchAdminComplaints({
        page: p,
        pageSize: ps,
        statusGroup: currentTab,
      });

      console.log('COMPLAINT DATA:', data);
      console.log('Complaints response:', data);
      setComplaints(data.complaints);
      setTotal(data.total);
      setPage(data.page);
      setPageSize(data.pageSize);
    } catch (e) {
      console.error('Load complaints error', e);
    } finally {
      setLoading(false);
    }
  };

  // const openDetails = async (complaintId: string) => {
  //   console.log('Opening complaint:', complaintId);
  //   setModalOpen(true);
  //   setSelected(null);
  //   try {
  //     const data = await fetchAdminComplaintDetails(complaintId);
  //     setSelected(data);
  //   } catch (e) {
  //     console.error('Load complaint details error', e);
  //   }
  // };

  const openDetails = async (complaintId: string) => {
    setModalOpen(true);
    setSelected(null);

    try {
      const data = await fetchAdminComplaintDetails(complaintId);
      setSelected(data);

      await loadResponders(); // 🔥 ADD THIS
    } catch (e) {
      console.error('Load complaint details error', e);
    }
  };

  //   const handleAssign = async (complaintId: string) => {
  //   await fetch(`/complaints/${complaintId}/assign`, {
  //     method: 'PATCH',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       assignedToUserId: selectedResponder,
  //     }),
  //   });

  //   await openDetails(complaintId); // refresh modal
  // };

  const [selectedPriority, setSelectedPriority] =
    useState('normal');

  const handleUpdatePriority = async (
    complaintId: string
  ) => {
    try {
      const response = await authFetch(
        `${API_BASE}/complaints/${complaintId}/priority`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priorityLevel: selectedPriority,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Priority update failed'
        );
      }

      alert(
        data.message ||
        'Priority updated successfully'
      );

      await openDetails(complaintId);

      await loadComplaints(
        page,
        pageSize,
        tab
      );
    } catch (err: any) {
      console.error(err);

      alert(
        err.message ||
        'Priority update failed'
      );
    }
  };


  const handleRejectComplaint = async () => {
  if (!selected?.complaint?.complaint_id) return;

  if (!rejectionReason || rejectionReason.trim().length < 10) {
    Alert.alert('Validation', 'Reason must be at least 10 characters.');
    return;
  }

  try {
    const response = await authFetch(
      `${API_BASE}/complaints/${selected.complaint.complaint_id}/reject`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: rejectionReason,
        }),
      }
    );

    const data = await response.json();

    console.log('REJECT RESPONSE:', data); // 🔥 IMPORTANT

    if (!response.ok) {
      throw new Error(data.message || 'Reject failed');
    }

    Alert.alert('Success', data.message || 'Complaint rejected successfully');

    setRejectModalVisible(false);
    setRejectionReason('');

    await loadComplaints(page, pageSize, tab);
    await openDetails(selected.complaint.complaint_id);

  } catch (err: any) {
    console.error('Reject error:', err);
    Alert.alert('Error', err.message || 'Failed to reject complaint');
  }
};


  const handleAssign = async (complaintId: string) => {
    console.log('Assign clicked');
    console.log('Complaint:', complaintId);
    console.log('Responder:', selectedResponder);

    if (!selectedResponder) {
      alert('Please select a responder');
      return;
    }

    try {
      const response = await authFetch(
        `${API_BASE}/complaints/${complaintId}/assign`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assignedToUserId: selectedResponder,
          }),
        }
      );

      const data = await response.json();

      console.log('ASSIGN RESPONSE:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Assignment failed');
      }

      alert(data.message || 'Complaint assigned successfully');

      setSelectedResponder('');

      await openDetails(complaintId);

      await loadComplaints(page, pageSize, tab);
    } catch (err: any) {
      console.error('Assign failed:', err);
      alert(err.message || 'Assignment failed');
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
                {/* ===================== */}
                {/* 1. COMPLAINT DETAILS */}
                {/* ===================== */}
                <Text style={s.sectionTitle}>Complaint Details</Text>

                <Text style={s.detail}>Ref: {selected.complaint.reference_id}</Text>
                <Text style={s.detail}>Title: {selected.complaint.title}</Text>
                <Text style={s.detail}>Status: {formatComplaintStatus(selected.complaint.status)}</Text>
                <Text style={s.detail}>Priority: {selected.complaint.priority_level}</Text>
                <Text style={s.detail}>Category: {selected.category.category_name}</Text>

                <Text style={s.detail}>
                  Assigned:{' '}
                  {['rejected', 'cancelled', 'resolved'].includes(selected.complaint.status)
                    ? 'N/A'
                    : lastAssignment
                      ? lastAssignment.assigned_to_first_name
                        ? `${lastAssignment.assigned_to_first_name} ${lastAssignment.assigned_to_last_name}`
                        : 'Responder Assigned'
                      : 'Not Assigned'}
                </Text>

                <Text style={s.detail}>Date: {selected.complaint.created_at}</Text>

                {/* ===================== */}
                {/* 2. EVIDENCE SECTION */}
                {/* ===================== */}
                <Text style={s.sectionTitle}>Evidence</Text>

{!selected.media || selected.media.length === 0 ? (
  <Text style={s.detail}>No evidence uploaded</Text>
) : (
  selected.media.map((m: any, index: number) => {
    const isImage = m.media_type === 'image';
    const isVideo = m.media_type === 'video';

    return (
      <TouchableOpacity
        key={m.media_id}
        style={{
          padding: 10,
          backgroundColor: '#f3f4f6',
          borderRadius: 8,
          marginBottom: 8,
        }}
        onPress={() => openEvidenceViewer(m)}
      >
        <Text style={{ fontWeight: '600' }}>
          Evidence {index + 1} ({isImage ? 'Image' : 'Video'})
        </Text>
      </TouchableOpacity>
    );
  })
)}

                {/* ===================== */}
                {/* 3. ASSIGNMENT SECTION */}
                {/* ===================== */}
                <Text style={s.sectionTitle}>Assignment History</Text>

                {selected.assignments.length === 0 ? (
                  <Text style={s.detail}>Not Assigned</Text>
                ) : (
                  selected.assignments.map((a: any) => (
                    <Text key={a.assignment_id} style={s.detail}>
                      {a.assigned_at} →{' '}
                      {a.assigned_to_first_name
                        ? `${a.assigned_to_first_name} ${a.assigned_to_last_name}`
                        : a.assigned_to}
                    </Text>
                  ))
                )}



                <Text style={s.sectionTitle}>Assign / Reassign Responder</Text>

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    marginTop: 10,
                    overflow: 'hidden',
                  }}
                >
                  <Picker
                    selectedValue={selectedResponder}
                    onValueChange={(value) => setSelectedResponder(value)}
                  >
                    <Picker.Item label="Select Responder" value="" />

                    {responders.map((r) => (
                      <Picker.Item
                        key={r.user_id}
                        label={`${r.first_name} ${r.last_name}`}
                        value={r.user_id}
                      />
                    ))}
                  </Picker>
                </View>

                <TouchableOpacity
  
  style={{
    backgroundColor: isLocked || !selectedResponder ? '#9ca3af' : '#22c55e',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    opacity: isLocked ? 0.6 : 1,
  }}
  disabled={isLocked || !selectedResponder}
  onPress={() => handleAssign(selected.complaint.complaint_id)}

                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>
                    {selected.assignments?.length
                      ? 'Reassign Responder'
                      : 'Assign Responder'}
                  </Text>
                </TouchableOpacity>
              
               {/* {REJECT COMPLAINT BUTTON} */}

                {!isLocked &&
                  (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#ef4444',
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        marginTop: 10,
                      }}
                      onPress={() => setRejectModalVisible(true)
                      }                                >
                      <Text
                        style={{
                          color: '#fff',
                          fontWeight: '700',
                        }}
                      >
                        Reject Complaint
                      </Text>
                    </TouchableOpacity>
                  )}



                <Text style={s.sectionTitle}>Priority Management</Text>

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    marginTop: 10,
                    overflow: 'hidden',
                  }}
                >
                  <Picker
                    selectedValue={selectedPriority}
                    onValueChange={(value) => setSelectedPriority(value)}
                  >
                    <Picker.Item label="Low" value="low" />
                    <Picker.Item label="Normal" value="normal" />
                    <Picker.Item label="High" value="high" />
                    <Picker.Item label="Urgent" value="urgent" />
                  </Picker>
                </View>

                <TouchableOpacity
                  disabled={isLocked} 
                  style={{
                    backgroundColor: '#ef4444',
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginTop: 10,
                  }}
                  onPress={() =>
                    handleUpdatePriority(selected.complaint.complaint_id)
                  }
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>
                    Update Priority
                  </Text>
                </TouchableOpacity>



                {/* ===================== */}
                {/* 4. TIMELINE SECTION */}
                {/* ===================== */}
                <Text style={s.sectionTitle}>Timeline</Text>

                {(selected.activityLogs?.length ?? 0) === 0 ? (
                  <Text style={s.detail}>No activity yet</Text>
                ) : (
                  selected.activityLogs.map((l: any) => (
                    <View key={l.activity_log_id} style={{ marginBottom: 10 }}>
                      <Text style={s.detail}>
                        {l.action_type.toUpperCase()}
                      </Text>

                      <Text style={s.detail}>{l.description}</Text>

                      <Text style={s.detail}>
                        {l.first_name ? `${l.first_name} ${l.last_name}` : 'System'} • {l.created_at}
                      </Text>
                    </View>
                  ))
                )}

                {/* ===================== */}
                {/* CLOSE BUTTON */}
                {/* ===================== */}
                <TouchableOpacity style={s.closeBtn} onPress={() => setModalOpen(false)}>
                  <Text style={s.closeText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
      <Modal
  visible={rejectModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setRejectModalVisible(false)}
>
  <View style={{
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  }}>
    <View style={{
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 10,
    }}>
      
      <Text style={{ fontWeight: '700', marginBottom: 10 }}>
        Reject Complaint
      </Text>

      <TextInput
        placeholder="Enter rejection reason..."
        value={rejectionReason}
        onChangeText={setRejectionReason}
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 10,
          borderRadius: 8,
          minHeight: 80,
          textAlignVertical: 'top',
        }}
        multiline
      />

      <TouchableOpacity
        style={{
          backgroundColor: '#ef4444',
          padding: 12,
          borderRadius: 8,
          marginTop: 10,
        }}
        onPress={handleRejectComplaint}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>
          Confirm Reject
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ marginTop: 10 }}
        onPress={() => setRejectModalVisible(false)}
      >
        <Text style={{ textAlign: 'center' }}>Cancel</Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>

<Modal visible={viewerVisible} animationType="slide">
  <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>

    <TouchableOpacity
      onPress={() => setViewerVisible(false)}
      style={{ padding: 15 }}
    >
      <Text style={{ color: '#fff' }}>Close</Text>
    </TouchableOpacity>

    {activeMedia?.media_type === 'image' && (
      <Image
        source={{ uri: activeMedia.media_url }}
        style={{ width: '100%', height: '90%' }}
        resizeMode="contain"
      />
    )}

    {activeMedia?.media_type === 'video' && (
      <Video
        source={{ uri: activeMedia.media_url }}
        style={{ width: '100%', height: '90%' }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
      />
    )}
  </SafeAreaView>
</Modal>
    </PageShell>
  );



}



