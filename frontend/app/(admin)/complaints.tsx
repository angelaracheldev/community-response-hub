import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge';
import AdminComplaintDetailModal from '../../components/admin/AdminComplaintDetailModal';
import AdminSelect from '../../components/admin/AdminSelect';
import { AdminListCard } from '../../components/admin/AdminListCard';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AppIcon } from '../../components/common/AppIcon';
import { AdminSegmentTabs } from '../../components/admin/AdminSegmentTabs';
import { adminListStyles as s } from '../../styles/admin/list';
import { PageShell } from '../../components/common/PageShell';
import { useAppLayout } from '../../hooks/useAppLayout';
import {
  AdminComplaintDetailResponse,
  AdminUser,
  fetchAdminComplaintDetails,
  fetchAdminComplaints,
  fetchResponders,
} from '../../utils/adminApi';
import { formatComplaintStatus, formatAssigneeName } from '../../utils/complaintApi';
import { adminComplaintsStyles as styles } from '../../styles/app/adminComplaints';
import { useComplaintCategories } from '../../hooks/useComplaintCategories';

const COMPLAINT_TABS = [
  { id: 'active', label: 'Active' },
  { id: 'closed', label: 'Closed' },
  { id: 'resolved', label: 'Resolved' },
];

export default function AdminComplaints() {
  const layout = useAppLayout();
  const useOverlayDialog = layout.isDesktop || layout.isTablet;
  const compact = layout.isMobile;
  const { height: windowHeight } = useWindowDimensions();
  const desktopScrollMaxHeight = Math.max(windowHeight * 0.92 - 96, 320);

  const [tab, setTab] = useState<'active' | 'closed' | 'resolved'>('active');
  const [complaints, setComplaints] = useState<Record<string, unknown>[]>([]);
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
  const [selected, setSelected] = useState<AdminComplaintDetailResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [responders, setResponders] = useState<AdminUser[]>([]);

  useEffect(() => {
    void loadResponders();
  }, []);

  useEffect(() => {
    void loadComplaints(1, pageSize, tab);
    setOpenFilterId(null);
  }, [tab, filterPriority, filterRespondent, filterCategory]);

  const loadResponders = async () => {
    try {
      setResponders(await fetchResponders());
    } catch (err) {
      console.error('Failed to load responders', err);
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
    void loadComplaints(1, pageSize, tab);
  };

  const onClearSearch = () => {
    setSearchQuery('');
    void loadComplaints(1, pageSize, tab, '');
  };

  const openDetails = async (complaintId: string) => {
    setModalOpen(true);
    setSelected(null);
    try {
      setSelected(await fetchAdminComplaintDetails(complaintId));
    } catch (e) {
      console.error('Load complaint details error', e);
    }
  };

  const refreshDetail = async (complaintId: string) => {
    try {
      setSelected(await fetchAdminComplaintDetails(complaintId));
    } catch (e) {
      console.error('Refresh complaint details error', e);
    }
  };

  const refreshList = async () => {
    await loadComplaints(page, pageSize, tab);
  };

  const renderComplaintItem = ({ item }: { item: Record<string, unknown> }) => {
    const complaint = item as {
      complaint_id: string;
      reference_id: string;
      title: string;
      category_name?: string;
      status: string;
      priority_level?: string;
    };

    if (layout.useCompactList) {
      return (
        <AdminListCard
          title={complaint.title}
          subtitle={`#${complaint.reference_id}`}
          fields={[
            { label: 'Category', value: complaint.category_name || '-' },
            { label: 'Status', value: formatComplaintStatus(complaint.status) },
            { label: 'Priority', value: complaint.priority_level || '-' },
            { label: 'Assigned', value: formatAssigneeName(item) },
          ]}
          actions={
            <TouchableOpacity style={s.actionBtn} onPress={() => openDetails(complaint.complaint_id)}>
              <Text style={s.actionBtnText}>View Details</Text>
            </TouchableOpacity>
          }
        />
      );
    }

    return (
      <View style={s.tableRow}>
        <Text style={[s.col, styles.colId, styles.colIdText]} numberOfLines={1}>
          {complaint.reference_id}
        </Text>
        <Text style={[s.col, styles.colTitle]} numberOfLines={1} ellipsizeMode="tail">
          {complaint.title}
        </Text>
        <Text style={[s.col, styles.colCat, styles.colCatText]} numberOfLines={1}>
          {complaint.category_name || '-'}
        </Text>
        <View style={[s.col, styles.colStatus]}>
          <ComplaintStatusBadge status={complaint.status} compact />
        </View>
        <Text style={[s.col, styles.colSmall]} numberOfLines={1}>
          {complaint.priority_level}
        </Text>
        <Text style={[s.col, styles.colAssigned]} numberOfLines={1} ellipsizeMode="tail">
          {formatAssigneeName(item)}
        </Text>
        <View style={[s.col, styles.colActions]}>
          <TouchableOpacity style={s.actionBtn} onPress={() => openDetails(complaint.complaint_id)}>
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
                  <AppIcon name="close" size={16} color="#6B7280" />
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
            <React.Fragment key={String(item.complaint_id)}>
              {renderComplaintItem({ item })}
            </React.Fragment>
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
              keyExtractor={(item) => String(item.complaint_id)}
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

      <AdminComplaintDetailModal
        visible={modalOpen}
        detail={selected}
        responders={responders}
        onClose={() => setModalOpen(false)}
        onRefreshDetail={refreshDetail}
        onListRefresh={refreshList}
        compact={compact}
        isDesktop={layout.isDesktop}
        isTablet={layout.isTablet}
        useOverlayDialog={useOverlayDialog}
        desktopScrollMaxHeight={desktopScrollMaxHeight}
      />
    </PageShell>
  );
}
