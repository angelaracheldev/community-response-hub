import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../common/AppIcon';
import ComplaintEvidenceGallery from '../ComplaintEvidenceGallery';
import AdminSelect from './AdminSelect';
import { adminListStyles as s } from '../../styles/admin/list';
import { adminComplaintsStyles as styles } from '../../styles/app/adminComplaints';
import { colors } from '../../styles/theme';
import { API_BASE } from '../../utils/apiConfig';
import { authFetch } from '../../utils/authFetch';
import { parseJson } from '../../utils/apiHelpers';
import { formatComplaintStatus, formatDateTime } from '../../utils/complaintApi';
import type { AdminComplaintDetailResponse } from '../../utils/adminApi';

type Responder = {
  user_id: string;
  first_name: string;
  last_name: string;
};

type LayoutProps = {
  compact: boolean;
  isDesktop: boolean;
  isTablet: boolean;
  useOverlayDialog: boolean;
  desktopScrollMaxHeight: number;
};

type Props = LayoutProps & {
  visible: boolean;
  detail: AdminComplaintDetailResponse | null;
  responders: Responder[];
  onClose: () => void;
  onRefreshDetail: (complaintId: string) => Promise<void>;
  onListRefresh: () => Promise<void>;
};

function DetailField({
  label,
  value,
  wide,
  compact,
  multiline,
}: {
  label: string;
  value: string;
  wide?: boolean;
  compact?: boolean;
  multiline?: boolean;
}) {
  return (
    <View
      style={[
        s.modalDetailField,
        wide && (compact ? s.modalDetailFieldWideCompact : s.modalDetailFieldWide),
      ]}
    >
      <Text style={[s.modalDetailFieldLabel, compact && s.modalDetailFieldLabelCompact]}>{label}</Text>
      <Text
        style={[
          s.modalDetailFieldValue,
          compact && s.modalDetailFieldValueCompact,
          multiline && s.modalDetailFieldValueMultiline,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export default function AdminComplaintDetailModal({
  visible,
  detail,
  responders,
  onClose,
  onRefreshDetail,
  onListRefresh,
  compact,
  isDesktop,
  isTablet,
  useOverlayDialog,
  desktopScrollMaxHeight,
}: Props) {
  const [selectedResponder, setSelectedResponder] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('normal');
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const complaint = detail?.complaint;
  const isLocked = complaint
    ? ['rejected', 'cancelled', 'resolved'].includes(complaint.status)
    : false;
  const lastAssignment = detail?.assignments?.[detail.assignments.length - 1];
  const assignedLabel = detail?.assignments?.length
    ? `${lastAssignment?.assigned_to_first_name ?? ''} ${lastAssignment?.assigned_to_last_name ?? ''}`.trim() ||
      'Responder Assigned'
    : 'Not Assigned';

  useEffect(() => {
    if (complaint?.priority_level) {
      setSelectedPriority(complaint.priority_level);
    }
  }, [complaint?.complaint_id, complaint?.priority_level]);

  useEffect(() => {
    if (!visible) {
      setSelectedResponder('');
      setRejectModalVisible(false);
      setRejectionReason('');
    }
  }, [visible]);

  const logEvidenceView = async (media: { media_id: string; media_type: string }) => {
    if (!complaint?.complaint_id) return;
    try {
      await authFetch(`${API_BASE}/activity-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintId: complaint.complaint_id,
          actionType: 'evidence_viewed',
          description: `Viewed evidence (${media.media_type})`,
          metadata: { media_id: media.media_id, media_type: media.media_type },
        }),
      });
    } catch {
      // non-blocking audit log
    }
  };

  const handleAssign = async () => {
    if (!complaint?.complaint_id || !selectedResponder) {
      Alert.alert('Validation', 'Please select a responder');
      return;
    }

    try {
      const response = await authFetch(`${API_BASE}/complaints/${complaint.complaint_id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToUserId: selectedResponder }),
      });
      const data = await parseJson<{ message?: string }>(response, 'Assignment failed');
      Alert.alert('Success', data.message || 'Complaint assigned successfully');
      setSelectedResponder('');
      await onRefreshDetail(complaint.complaint_id);
      await onListRefresh();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Assignment failed');
    }
  };

  const handleUpdatePriority = async () => {
    if (!complaint?.complaint_id) return;

    try {
      const response = await authFetch(`${API_BASE}/complaints/${complaint.complaint_id}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priorityLevel: selectedPriority }),
      });
      const data = await parseJson<{ message?: string }>(response, 'Priority update failed');
      Alert.alert('Success', data.message || 'Priority updated successfully');
      await onRefreshDetail(complaint.complaint_id);
      await onListRefresh();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Priority update failed');
    }
  };

  const handleRejectComplaint = async () => {
    if (!complaint?.complaint_id) return;

    if (!rejectionReason || rejectionReason.trim().length < 10) {
      Alert.alert('Validation', 'Reason must be at least 10 characters.');
      return;
    }

    try {
      const response = await authFetch(`${API_BASE}/complaints/${complaint.complaint_id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      const data = await parseJson<{ message?: string }>(response, 'Reject failed');
      Alert.alert('Success', data.message || 'Complaint rejected successfully');
      setRejectModalVisible(false);
      setRejectionReason('');
      await onRefreshDetail(complaint.complaint_id);
      await onListRefresh();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to reject complaint');
    }
  };

  const headerSubtitle = complaint
    ? `${complaint.reference_id} · ${formatComplaintStatus(complaint.status)}`
    : undefined;

  const renderModalHeader = (onHeaderClose: () => void) => (
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
      <TouchableOpacity style={s.modalHeaderCloseBtn} onPress={onHeaderClose} accessibilityLabel="Close">
        <AppIcon name="close" size={20} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (!detail) {
      return <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />;
    }

    const assignmentHistorySection = (
      <View style={[s.modalDetailCard, compact && s.modalDetailCardCompact]}>
        <Text style={[s.modalDetailCardTitle, compact && s.modalDetailCardTitleCompact]}>
          Assignment History
        </Text>
        {detail.assignments.length === 0 ? (
          <Text style={s.modalDetailEmptyHint}>Not Assigned</Text>
        ) : (
          detail.assignments.map((a) => (
            <Text key={a.assignment_id} style={s.modalDetailTimelineText}>
              {formatDateTime(a.assigned_at)} →{' '}
              {a.assigned_to_first_name
                ? `${a.assigned_to_first_name} ${a.assigned_to_last_name}`
                : a.assigned_to}
            </Text>
          ))
        )}
      </View>
    );

    const timelineSection = (
      <View style={[s.modalDetailCard, compact && s.modalDetailCardCompact]}>
        <Text style={[s.modalDetailCardTitle, compact && s.modalDetailCardTitleCompact]}>Timeline</Text>
        {detail.activityLogs.length === 0 ? (
          <Text style={s.modalDetailEmptyHint}>No activity yet</Text>
        ) : (
          detail.activityLogs.map((l) => (
            <View key={l.activity_log_id} style={s.modalDetailTimelineItem}>
              <Text style={s.modalDetailTimelineAction}>{l.action_type}</Text>
              <Text style={s.modalDetailTimelineText}>{l.description}</Text>
              <Text style={s.modalDetailTimelineMeta}>
                {l.first_name ? `${l.first_name} ${l.last_name}` : 'System'} •{' '}
                {formatDateTime(l.created_at)}
              </Text>
            </View>
          ))
        )}
      </View>
    );

    return (
      <View style={[s.modalDetailBody, isDesktop && s.modalDetailBodyDesktop]}>
        <View style={s.modalDetailMain}>
          <View style={[s.modalDetailCard, compact && s.modalDetailCardCompact]}>
            <Text style={[s.modalDetailCardTitle, compact && s.modalDetailCardTitleCompact]}>
              Complaint Details
            </Text>
            <DetailField compact={compact} label="Title" value={detail.complaint.title} />
            <DetailField
              compact={compact}
              label="Description"
              value={detail.complaint.description || '-'}
              multiline
            />
            <View style={[s.modalDetailGrid, s.modalDetailGridWide]}>
              <DetailField compact={compact} wide label="Reference" value={detail.complaint.reference_id} />
              <DetailField
                compact={compact}
                wide
                label="Status"
                value={formatComplaintStatus(detail.complaint.status)}
              />
              <DetailField compact={compact} wide label="Priority" value={detail.complaint.priority_level} />
              <DetailField compact={compact} wide label="Category" value={detail.category.category_name} />
              <DetailField compact={compact} wide label="Assigned" value={assignedLabel} />
              <DetailField
                compact={compact}
                wide
                label="Date"
                value={formatDateTime(detail.complaint.created_at)}
              />
            </View>
          </View>

          <View style={[s.modalDetailCard, compact && s.modalDetailCardCompact]}>
            <Text style={[s.modalDetailCardTitle, compact && s.modalDetailCardTitleCompact]}>Evidence</Text>
            <ComplaintEvidenceGallery
              media={detail.media}
              emptyMessage="No evidence uploaded"
              onMediaOpen={logEvidenceView}
            />
          </View>

          {!compact ? (
            <>
              {assignmentHistorySection}
              {timelineSection}
            </>
          ) : null}
        </View>

        <View
          style={[
            s.modalDetailActions,
            isDesktop && s.modalDetailActionsDesktop,
            isTablet && s.modalDetailActionsTablet,
          ]}
        >
          <View style={[s.modalDetailCard, compact && s.modalDetailCardCompact]}>
            <Text style={[s.modalDetailCardTitle, compact && s.modalDetailCardTitleCompact]}>
              Assign / Reassign Responder
            </Text>
            <AdminSelect
              value={selectedResponder}
              onValueChange={setSelectedResponder}
              placeholder="Select Responder"
              disabled={isLocked}
              options={[
                { label: 'Select Responder', value: '' },
                ...responders.map((r) => ({
                  label: `${r.first_name} ${r.last_name}`,
                  value: r.user_id,
                })),
              ]}
            />
            <TouchableOpacity
              style={[
                s.modalDetailBtn,
                s.modalDetailAssignBtn,
                compact && s.modalDetailBtnCompact,
                (isLocked || !selectedResponder) && s.modalDetailBtnDisabled,
              ]}
              disabled={isLocked || !selectedResponder}
              onPress={handleAssign}
            >
              <Text style={[s.modalDetailBtnText, compact && s.modalDetailBtnTextCompact]}>
                {detail.assignments.length ? 'Reassign Responder' : 'Assign Responder'}
              </Text>
            </TouchableOpacity>
          </View>

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
            <AdminSelect
              value={selectedPriority}
              onValueChange={setSelectedPriority}
              disabled={isLocked}
              options={[
                { label: 'Low', value: 'low' },
                { label: 'Normal', value: 'normal' },
                { label: 'High', value: 'high' },
                { label: 'Urgent', value: 'urgent' },
              ]}
            />
            <TouchableOpacity
              style={[
                s.modalDetailBtn,
                s.modalDetailPriorityBtn,
                compact && s.modalDetailBtnCompact,
                isLocked && s.modalDetailBtnDisabled,
              ]}
              disabled={isLocked}
              onPress={handleUpdatePriority}
            >
              <Text style={[s.modalDetailBtnText, compact && s.modalDetailBtnTextCompact]}>
                Update Priority
              </Text>
            </TouchableOpacity>
          </View>

          {compact ? (
            <>
              {assignmentHistorySection}
              {timelineSection}
            </>
          ) : null}

          {!useOverlayDialog ? (
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeText}>Close</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={useOverlayDialog}
        animationType={useOverlayDialog ? 'fade' : 'slide'}
        onRequestClose={onClose}
      >
        {useOverlayDialog ? (
          <View style={[s.modalBackdrop, isTablet && !isDesktop && s.modalBackdropTablet]}>
            <View style={[s.modalDialog, isTablet && !isDesktop && s.modalDialogTablet]}>
              {renderModalHeader(onClose)}
              <ScrollView
                style={[s.modalDetailScroll, { maxHeight: desktopScrollMaxHeight }]}
                contentContainerStyle={[s.modalDetailContent, compact && s.modalDetailContentCompact]}
                showsVerticalScrollIndicator={false}
              >
                {renderContent()}
              </ScrollView>
            </View>
          </View>
        ) : (
          <SafeAreaView style={s.modalSafe}>
            {renderModalHeader(onClose)}
            <ScrollView style={s.modalMobileBody} contentContainerStyle={s.modalMobileScrollContent}>
              {renderContent()}
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
    </>
  );
}
