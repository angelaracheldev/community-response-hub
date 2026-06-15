import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { ResizeMode, Video } from 'expo-av';
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge';
import ComplaintEvidenceGallery from '../../components/ComplaintEvidenceGallery';
import { AdminListCard } from '../../components/admin/AdminListCard';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminSegmentTabs } from '../../components/admin/AdminSegmentTabs';
import { adminListStyles as s } from '../../styles/admin/list';
import { PageShell } from '../../components/common/PageShell';
import { useAppLayout } from '../../hooks/useAppLayout';
import { fetchAdminComplaintDetails, fetchAdminComplaints } from '../../utils/adminApi';
import { formatComplaintStatus } from '../../utils/complaintApi';
import { adminComplaintsStyles as styles } from '../../styles/app/adminComplaints';
import { authFetch } from '../../utils/authFetch';



// const API_BASE = 'http://YOUR_BACKEND_URL/api'; // replace with your env later
// const API_BASE = 'http://localhost:5000/api';
import { API_BASE } from '../../utils/apiConfig';
import { colors } from '../../styles/theme';

const COMPLAINT_TABS = [
  { id: 'active', label: 'Active' },
  { id: 'closed', label: 'Closed' },
  { id: 'resolved', label: 'Resolved' },
];

function DetailField({
  label,
  value,
  wide,
  compact,
}: {
  label: string;
  value: string;
  wide?: boolean;
  compact?: boolean;
}) {
  return (
    <View style={[s.modalDetailField, wide && s.modalDetailFieldWide]}>
      <Text style={[s.modalDetailFieldLabel, compact && s.modalDetailFieldLabelCompact]}>{label}</Text>
      <Text style={[s.modalDetailFieldValue, compact && s.modalDetailFieldValueCompact]}>{value}</Text>
    </View>
  );
}

export default function AdminComplaints() {
  const layout = useAppLayout();
  const useOverlayDialog = layout.isDesktop || layout.isTablet;
  const compact = layout.isMobile;
  const { height: windowHeight } = useWindowDimensions();
  const desktopScrollMaxHeight = Math.max(windowHeight * 0.92 - 96, 320);

  const [tab, setTab] = useState<'active' | 'closed' | 'resolved'>('active');
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResponder, setSelectedResponder] = useState('');
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


  const assignedLabel = selected
    ? ['rejected', 'cancelled', 'resolved'].includes(selected.complaint.status)
      ? 'N/A'
      : lastAssignment
        ? lastAssignment.assigned_to_first_name
          ? `${lastAssignment.assigned_to_first_name} ${lastAssignment.assigned_to_last_name}`
          : 'Responder Assigned'
        : 'Not Assigned'
    : '-';

  const headerSubtitle = selected
    ? `${selected.complaint.reference_id} · ${formatComplaintStatus(selected.complaint.status)}`
    : undefined;

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

  const renderModalContent = () => {
    if (!selected) {
      return <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />;
    }

    const useWideGrid = layout.isDesktop || layout.isTablet;

    return (
      <View style={[s.modalDetailBody, layout.isDesktop && s.modalDetailBodyDesktop]}>
        <View style={s.modalDetailMain}>
          {/* ===================== */}
          {/* 1. COMPLAINT DETAILS */}
          {/* ===================== */}
          <View style={[s.modalDetailCard, compact && s.modalDetailCardCompact]}>
            <Text style={[s.modalDetailCardTitle, compact && s.modalDetailCardTitleCompact]}>
              Complaint Details
            </Text>
            <View style={[s.modalDetailGrid, useWideGrid && s.modalDetailGridWide]}>
              <DetailField compact={compact} wide={useWideGrid} label="Reference" value={selected.complaint.reference_id} />
              <DetailField compact={compact} wide={useWideGrid} label="Status" value={formatComplaintStatus(selected.complaint.status)} />
              <DetailField compact={compact} wide={useWideGrid} label="Priority" value={selected.complaint.priority_level} />
              <DetailField compact={compact} wide={useWideGrid} label="Category" value={selected.category.category_name} />
              <DetailField compact={compact} wide={useWideGrid} label="Assigned" value={assignedLabel} />
              <DetailField compact={compact} wide={useWideGrid} label="Date" value={selected.complaint.created_at} />
            </View>
            <DetailField compact={compact} label="Title" value={selected.complaint.title} />
          </View>

          {/* ===================== */}
          {/* 2. EVIDENCE SECTION */}
          {/* ===================== */}
          <View style={[s.modalDetailCard, compact && s.modalDetailCardCompact]}>
            <Text style={[s.modalDetailCardTitle, compact && s.modalDetailCardTitleCompact]}>Evidence</Text>
            <ComplaintEvidenceGallery
              media={selected.media ?? []}
              emptyMessage="No evidence uploaded"
              onItemPress={openEvidenceViewer}
            />
          </View>

          {/* ===================== */}
          {/* 3. ASSIGNMENT SECTION */}
          {/* ===================== */}
          <View style={[s.modalDetailCard, compact && s.modalDetailCardCompact]}>
            <Text style={[s.modalDetailCardTitle, compact && s.modalDetailCardTitleCompact]}>
              Assignment History
            </Text>
            {selected.assignments.length === 0 ? (
              <Text style={s.modalDetailEmptyHint}>Not Assigned</Text>
            ) : (
              selected.assignments.map((a: any) => (
                <Text key={a.assignment_id} style={s.modalDetailTimelineText}>
                  {a.assigned_at} →{' '}
                  {a.assigned_to_first_name
                    ? `${a.assigned_to_first_name} ${a.assigned_to_last_name}`
                    : a.assigned_to}
                </Text>
              ))
            )}
          </View>

          {/* ===================== */}
          {/* 4. TIMELINE SECTION */}
          {/* ===================== */}
          <View style={[s.modalDetailCard, compact && s.modalDetailCardCompact]}>
            <Text style={[s.modalDetailCardTitle, compact && s.modalDetailCardTitleCompact]}>Timeline</Text>
            {(selected.activityLogs?.length ?? 0) === 0 ? (
              <Text style={s.modalDetailEmptyHint}>No activity yet</Text>
            ) : (
              selected.activityLogs.map((l: any) => (
                <View key={l.activity_log_id} style={s.modalDetailTimelineItem}>
                  <Text style={s.modalDetailTimelineAction}>{l.action_type}</Text>
                  <Text style={s.modalDetailTimelineText}>{l.description}</Text>
                  <Text style={s.modalDetailTimelineMeta}>
                    {l.first_name ? `${l.first_name} ${l.last_name}` : 'System'} • {l.created_at}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View
          style={[
            s.modalDetailActions,
            layout.isDesktop && s.modalDetailActionsDesktop,
            layout.isTablet && s.modalDetailActionsTablet,
          ]}
        >
          <View style={[s.modalDetailCard, compact && s.modalDetailCardCompact]}>
            <Text style={[s.modalDetailCardTitle, compact && s.modalDetailCardTitleCompact]}>
              Assign / Reassign Responder
            </Text>
            <View style={s.modalDetailPickerWrap}>
              <Picker
                selectedValue={selectedResponder}
                onValueChange={(value) => setSelectedResponder(value)}
                enabled={!isLocked}
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
              style={[
                s.modalDetailBtn,
                s.modalDetailAssignBtn,
                compact && s.modalDetailBtnCompact,
                (isLocked || !selectedResponder) && s.modalDetailBtnDisabled,
              ]}
              disabled={isLocked || !selectedResponder}
              onPress={() => handleAssign(selected.complaint.complaint_id)}
            >
              <Text style={[s.modalDetailBtnText, compact && s.modalDetailBtnTextCompact]}>
                {selected.assignments?.length ? 'Reassign Responder' : 'Assign Responder'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* {REJECT COMPLAINT BUTTON} */}

          {!isLocked ? (
            <View style={[s.modalDetailCard, compact && s.modalDetailCardCompact]}>
              <Text style={[s.modalDetailCardTitle, compact && s.modalDetailCardTitleCompact]}>
                Reject Complaint
              </Text>
              <TouchableOpacity
                style={[s.modalDetailBtn, s.modalDetailRejectBtn, compact && s.modalDetailBtnCompact]}
                onPress={() => setRejectModalVisible(true)}
              >
                <Text style={[s.modalDetailBtnText, compact && s.modalDetailBtnTextCompact]}>
                  Reject Complaint
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={[s.modalDetailCard, compact && s.modalDetailCardCompact]}>
            <Text style={[s.modalDetailCardTitle, compact && s.modalDetailCardTitleCompact]}>
              Priority Management
            </Text>
            <View style={s.modalDetailPickerWrap}>
              <Picker
                selectedValue={selectedPriority}
                onValueChange={(value) => setSelectedPriority(value)}
                enabled={!isLocked}
              >
                <Picker.Item label="Low" value="low" />
                <Picker.Item label="Normal" value="normal" />
                <Picker.Item label="High" value="high" />
                <Picker.Item label="Urgent" value="urgent" />
              </Picker>
            </View>
            <TouchableOpacity
              style={[
                s.modalDetailBtn,
                s.modalDetailPriorityBtn,
                compact && s.modalDetailBtnCompact,
                isLocked && s.modalDetailBtnDisabled,
              ]}
              disabled={isLocked}
              onPress={() => handleUpdatePriority(selected.complaint.complaint_id)}
            >
              <Text style={[s.modalDetailBtnText, compact && s.modalDetailBtnTextCompact]}>
                Update Priority
              </Text>
            </TouchableOpacity>
          </View>

          {!useOverlayDialog ? (
            <>
              {/* ===================== */}
              {/* CLOSE BUTTON */}
              {/* ===================== */}
              <TouchableOpacity style={s.closeBtn} onPress={() => setModalOpen(false)}>
                <Text style={s.closeText}>Close</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </View>
    );
  };

  const renderModalHeader = (onClose: () => void) => (
    <View style={[s.modalDetailHeader, compact && s.modalDetailHeaderCompact]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[s.modalDetailTitle, compact && s.modalDetailTitleCompact]}>Complaint Details</Text>
        {headerSubtitle ? (
          <Text
            style={[s.modalDetailSubtitle, compact && s.modalDetailSubtitleCompact]}
            numberOfLines={2}
          >
            {headerSubtitle}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity style={s.modalHeaderCloseBtn} onPress={onClose} accessibilityLabel="Close">
        <Text style={s.modalHeaderCloseText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

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

      <Modal
        visible={modalOpen}
        transparent={useOverlayDialog}
        animationType={useOverlayDialog ? 'fade' : 'slide'}
        onRequestClose={() => setModalOpen(false)}
      >
        {useOverlayDialog ? (
          <View style={[s.modalBackdrop, layout.isTablet && !layout.isDesktop && s.modalBackdropTablet]}>
            <View
              style={[
                s.modalDialog,
                layout.isTablet && !layout.isDesktop && s.modalDialogTablet,
              ]}
            >
              {renderModalHeader(() => setModalOpen(false))}
              <ScrollView
                style={[s.modalDetailScroll, { maxHeight: desktopScrollMaxHeight }]}
                contentContainerStyle={[s.modalDetailContent, compact && s.modalDetailContentCompact]}
                showsVerticalScrollIndicator={false}
              >
                {renderModalContent()}
              </ScrollView>
            </View>
          </View>
        ) : (
          <SafeAreaView style={s.modalSafe}>
            {renderModalHeader(() => setModalOpen(false))}
            <ScrollView style={s.modalMobileBody} contentContainerStyle={s.modalMobileScrollContent}>
              {renderModalContent()}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={s.confirmOverlay}>
          <View style={s.confirmBox}>
            <Text style={s.confirmTitle}>Reject Complaint</Text>
            <TextInput
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
              style={s.modalRejectInput}
              multiline
            />
            <TouchableOpacity
              style={[s.modalDetailBtn, s.modalDetailRejectBtn, { marginTop: 12 }]}
              onPress={handleRejectComplaint}
            >
              <Text style={s.modalDetailBtnText}>Confirm Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.modalRejectCancel} onPress={() => setRejectModalVisible(false)}>
              <Text style={s.modalRejectCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={viewerVisible} animationType="slide" onRequestClose={() => setViewerVisible(false)}>
        <SafeAreaView style={s.modalViewerSafe}>
          <TouchableOpacity onPress={() => setViewerVisible(false)} style={s.modalViewerClose}>
            <Text style={s.modalViewerCloseText}>Close</Text>
          </TouchableOpacity>
          {activeMedia?.media_type === 'image' ? (
            <Image source={{ uri: activeMedia.media_url }} style={s.modalViewerMedia} resizeMode="contain" />
          ) : null}
          {activeMedia?.media_type === 'video' ? (
            <Video
              source={{ uri: activeMedia.media_url }}
              style={s.modalViewerMedia}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
            />
          ) : null}
        </SafeAreaView>
      </Modal>
    </PageShell>
  );
}
