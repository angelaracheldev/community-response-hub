import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge';
import ComplaintEvidenceGallery from '../../components/ComplaintEvidenceGallery';
import { AdminListCard } from '../../components/admin/AdminListCard';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminSegmentTabs } from '../../components/admin/AdminSegmentTabs';
import { adminListStyles as s } from '../../styles/admin/list';
import { PageShell } from '../../components/common/PageShell';
import { useAppLayout } from '../../hooks/useAppLayout';
import { fetchAdminComplaintDetails, fetchAdminComplaints } from '../../utils/adminApi';
import { formatComplaintStatus, formatDateTime, formatAssigneeName } from '../../utils/complaintApi';
import { adminComplaintsStyles as styles } from '../../styles/app/adminComplaints';
import { useComplaintCategories } from '../../hooks/useComplaintCategories';
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

function AdminSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  compact = false,
  overlayDropdown = true,
  open: controlledOpen,
  onOpenChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
  overlayDropdown?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (next: boolean) => {
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setInternalOpen(next);
    }
  };

  const selected = options.find((option) => option.value === value);
  const display = value && selected ? selected.label : placeholder;
  const showPlaceholder = !value;
  const useOverlayPanel = compact && overlayDropdown;
  const needsScroll =
    useOverlayPanel ? options.length > 4 : compact && options.length > 8;

  const renderOptions = () =>
    options.map((option, index) => {
      const isSelected = option.value === value;
      const isLast = index === options.length - 1;
      return (
        <TouchableOpacity
          key={option.value || '__placeholder__'}
          style={[
            s.modalDetailSelectOption,
            compact && styles.filterSelectOption,
            compact && isLast && styles.filterSelectOptionLast,
            isSelected && s.modalDetailSelectOptionSelected,
          ]}
          onPress={() => {
            onValueChange(option.value);
            setOpen(false);
          }}
        >
          <Text
            style={[
              s.modalDetailSelectOptionText,
              isSelected && s.modalDetailSelectOptionTextSelected,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      );
    });

  return (
    <View
      style={[
        s.modalDetailSelectWrap,
        compact && styles.filterSelectWrap,
        useOverlayPanel && open && styles.filterSelectWrapOpen,
        compact && useOverlayPanel && { overflow: 'visible' as const },
        compact && !useOverlayPanel && styles.filterSelectWrapInline,
      ]}
    >
      <TouchableOpacity
        style={[
          s.modalDetailSelectTrigger,
          compact && styles.filterSelectTrigger,
          disabled && s.modalDetailSelectTriggerDisabled,
        ]}
        onPress={() => !disabled && setOpen(!open)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled }}
      >
        <Text
          style={[s.modalDetailSelectText, showPlaceholder && s.modalDetailSelectPlaceholder]}
          numberOfLines={1}
        >
          {display}
        </Text>
        <Text style={s.modalDetailSelectChevron}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && !disabled ? (
        <View
          style={[
            compact ? styles.filterSelectOptionsPanel : s.modalDetailSelectOptions,
            useOverlayPanel && styles.filterSelectOptions,
            compact && !overlayDropdown && styles.filterSelectOptionsInline,
          ]}
        >
          {needsScroll ? (
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              style={useOverlayPanel ? styles.filterSelectScroll : styles.filterSelectScrollInline}
            >
              {renderOptions()}
            </ScrollView>
          ) : (
            renderOptions()
          )}
        </View>
      ) : null}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterRespondent, setFilterRespondent] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [openFilterId, setOpenFilterId] = useState<'priority' | 'respondent' | 'category' | null>(
    null
  );
  const { categories } = useComplaintCategories();
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
    loadResponders();
  }, []);

  useEffect(() => {
    loadComplaints(1, pageSize, tab);
    setOpenFilterId(null);
  }, [tab, filterPriority, filterRespondent, filterCategory]);

  useEffect(() => {
    if (!modalOpen) {
      setSelectedResponder('');
    }
  }, [modalOpen]);

  

  const logEvidenceView = async (media: { media_id: string; media_type: string }) => {
    if (!selected?.complaint?.complaint_id) return;

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


  const loadComplaints = async (
    p = 1,
    ps = pageSize,
    currentTab: typeof tab = tab,
    searchOverride?: string
  ) => {
    setLoading(true);
    const search = searchOverride !== undefined ? searchOverride : searchQuery;
    try {
      const data = await fetchAdminComplaints({
        page: p,
        pageSize: ps,
        statusGroup: currentTab,
        search: search.trim() || undefined,
        priorityLevel: filterPriority || undefined,
        assignedToUserId: filterRespondent || undefined,
        categoryId: filterCategory || undefined,
      });

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

  const onSearch = () => {
    loadComplaints(1, pageSize, tab);
  };

  const onClearSearch = () => {
    setSearchQuery('');
    loadComplaints(1, pageSize, tab, '');
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
      console.log(
      'ADMIN DETAIL SCREEN RAW RESPONSE',
      JSON.stringify(data, null, 2)
    );
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


  // const assignedLabel = selected
  //   ? ['rejected', 'cancelled', 'resolved'].includes(selected.complaint.status)
  //     ? 'N/A'
  //     : lastAssignment
  //       ? lastAssignment.assigned_to_first_name
  //         ? `${lastAssignment.assigned_to_first_name} ${lastAssignment.assigned_to_last_name}`
  //         : 'Responder Assigned'
  //       : 'Not Assigned'
  //   : '-';
  const assignedLabel =
  selected?.assignments?.length
    ? `${lastAssignment.assigned_to_first_name} ${lastAssignment.assigned_to_last_name}`
    : 'Not Assigned';

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
            { label: 'Assigned', value: formatAssigneeName(item) },
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
        <Text style={[s.col, styles.colId, styles.colIdText]} numberOfLines={1}>
          {item.reference_id}
        </Text>
        <Text style={[s.col, styles.colTitle]} numberOfLines={1} ellipsizeMode="tail">
          {item.title}
        </Text>
        <Text style={[s.col, styles.colCat, styles.colCatText]} numberOfLines={1}>
          {item.category_name || '-'}
        </Text>
        <View style={[s.col, styles.colStatus]}>
          <ComplaintStatusBadge status={item.status} compact />
        </View>
        <Text style={[s.col, styles.colSmall]} numberOfLines={1}>
          {item.priority_level}
        </Text>
        <Text style={[s.col, styles.colAssigned]} numberOfLines={1} ellipsizeMode="tail">
          {formatAssigneeName(item)}
        </Text>
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

    const assignmentHistorySection = (
      <View style={[s.modalDetailCard, compact && s.modalDetailCardCompact]}>
        <Text style={[s.modalDetailCardTitle, compact && s.modalDetailCardTitleCompact]}>
          Assignment History
        </Text>
        {selected.assignments.length === 0 ? (
          <Text style={s.modalDetailEmptyHint}>Not Assigned</Text>
        ) : (
          selected.assignments.map((a: any) => (
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
        {(selected.activityLogs?.length ?? 0) === 0 ? (
          <Text style={s.modalDetailEmptyHint}>No activity yet</Text>
        ) : (
          selected.activityLogs.map((l: any) => (
            <View key={l.activity_log_id} style={s.modalDetailTimelineItem}>
              <Text style={s.modalDetailTimelineAction}>{l.action_type}</Text>
              <Text style={s.modalDetailTimelineText}>{l.description}</Text>
              <Text style={s.modalDetailTimelineMeta}>
                {l.first_name ? `${l.first_name} ${l.last_name}` : 'System'} • {formatDateTime(l.created_at)}
              </Text>
            </View>
          ))
        )}
      </View>
    );

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
            <DetailField compact={compact} label="Title" value={selected.complaint.title} />
            <DetailField
              compact={compact}
              label="Description"
              value={selected.complaint.description || '-'}
              multiline
            />
            <View style={[s.modalDetailGrid, s.modalDetailGridWide]}>
              <DetailField compact={compact} wide label="Reference" value={selected.complaint.reference_id} />
              <DetailField compact={compact} wide label="Status" value={formatComplaintStatus(selected.complaint.status)} />
              <DetailField compact={compact} wide label="Priority" value={selected.complaint.priority_level} />
              <DetailField compact={compact} wide label="Category" value={selected.category.category_name} />
              <DetailField compact={compact} wide label="Assigned" value={assignedLabel} />
              <DetailField compact={compact} wide label="Date" value={formatDateTime(selected.complaint.created_at)} />
            </View>
          </View>

          {/* ===================== */}
          {/* 2. EVIDENCE SECTION */}
          {/* ===================== */}
          <View style={[s.modalDetailCard, compact && s.modalDetailCardCompact]}>
            <Text style={[s.modalDetailCardTitle, compact && s.modalDetailCardTitleCompact]}>Evidence</Text>
            <ComplaintEvidenceGallery
              media={selected.media ?? []}
              emptyMessage="No evidence uploaded"
              onMediaOpen={logEvidenceView}
            />
          </View>

          {!compact ? (
            <>
              {/* ===================== */}
              {/* 3. ASSIGNMENT SECTION */}
              {/* ===================== */}
              {assignmentHistorySection}

              {/* ===================== */}
              {/* 4. TIMELINE SECTION */}
              {/* ===================== */}
              {timelineSection}
            </>
          ) : null}
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
              onPress={() => handleUpdatePriority(selected.complaint.complaint_id)}
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
      <View style={styles.controlsSection}>
        <View style={[s.toolbar, layout.isDesktop && s.toolbarDesktop, { marginBottom: 0 }]}>
          <AdminSegmentTabs
            tabs={COMPLAINT_TABS}
            activeId={tab}
            onChange={(id) => setTab(id as typeof tab)}
            compact={layout.useCompactList}
          />

          <View style={[s.searchRow, layout.useCompactList ? s.searchRowCompact : s.searchRowDesktop]}>
            <View
              style={[
                styles.searchField,
                layout.useCompactList ? styles.searchFieldCompact : styles.searchFieldDesktop,
              ]}
            >
              <TextInput
                placeholder="Search complaints"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[
                  s.searchInput,
                  styles.searchInputInField,
                  searchQuery ? styles.searchInputWithClear : null,
                ]}
                returnKeyType="search"
                onSubmitEditing={onSearch}
              />
              {searchQuery ? (
                <TouchableOpacity
                  style={styles.searchClearBtn}
                  onPress={onClearSearch}
                  accessibilityLabel="Clear search"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.searchClearText}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {layout.useCompactList ? (
              <View style={[s.btnRow, s.btnRowCompact]}>
                <TouchableOpacity style={s.textBtn} onPress={onSearch}>
                  <Text style={s.textBtnLabel}>Search</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.textBtn}>
                  <Text style={s.textBtnLabel}>+ Add Complaint</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TouchableOpacity style={s.linkBtn} onPress={onSearch}>
                  <Text style={s.linkBtnText}>Search</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addComplaintBtn}>
                  <Text style={styles.addComplaintBtnText}>+ Add Complaint</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={layout.useCompactList ? s.filtersStack : styles.filtersRow}>
        <View style={layout.useCompactList ? styles.filterSelectCompact : styles.filterSelect}>
          <AdminSelect
            compact
            overlayDropdown={!layout.isMobile}
            open={openFilterId === 'priority'}
            onOpenChange={(open) => setOpenFilterId(open ? 'priority' : null)}
            value={filterPriority}
            onValueChange={setFilterPriority}
            placeholder="All priorities"
            options={[
              { label: 'All priorities', value: '' },
              { label: 'Low', value: 'low' },
              { label: 'Normal', value: 'normal' },
              { label: 'High', value: 'high' },
              { label: 'Urgent', value: 'urgent' },
            ]}
          />
        </View>
        <View style={layout.useCompactList ? styles.filterSelectCompact : styles.filterSelect}>
          <AdminSelect
            compact
            overlayDropdown={!layout.isMobile}
            open={openFilterId === 'respondent'}
            onOpenChange={(open) => setOpenFilterId(open ? 'respondent' : null)}
            value={filterRespondent}
            onValueChange={setFilterRespondent}
            placeholder="All respondents"
            options={[
              { label: 'All respondents', value: '' },
              { label: 'Unassigned', value: 'unassigned' },
              ...responders.map((r) => ({
                label: `${r.first_name} ${r.last_name}`,
                value: r.user_id,
              })),
            ]}
          />
        </View>
        <View style={layout.useCompactList ? styles.filterSelectCompact : styles.filterSelect}>
          <AdminSelect
            compact
            overlayDropdown={!layout.isMobile}
            open={openFilterId === 'category'}
            onOpenChange={(open) => setOpenFilterId(open ? 'category' : null)}
            value={filterCategory}
            onValueChange={setFilterCategory}
            placeholder="All categories"
            options={[
              { label: 'All categories', value: '' },
              ...categories.map((cat) => ({
                label: cat.category_name,
                value: String(cat.category_id),
              })),
            ]}
          />
        </View>
        </View>
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
        <View style={[s.tableSection, styles.tableSectionRaised]}>
          <View style={s.tableWrap}>
            <View style={s.tableHeader}>
              <Text style={[s.col, styles.colId, styles.colIdText]}>ID</Text>
              <Text style={[s.col, styles.colTitle]}>Title</Text>
              <Text style={[s.col, styles.colCat]}>Category</Text>
              <Text style={[s.col, styles.colStatus]}>Status</Text>
              <Text style={[s.col, styles.colSmall]}>Priority</Text>
              <Text style={[s.col, styles.colAssigned]}>Assigned</Text>
              <Text style={[s.col, styles.colActions]}>Actions</Text>
            </View>
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
              renderItem={renderComplaintItem}
            />
          </View>
        </View>
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
    </PageShell>
  );
}
