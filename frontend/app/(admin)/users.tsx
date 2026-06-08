import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AdminListCard } from '../../components/admin/AdminListCard';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminSegmentTabs } from '../../components/admin/AdminSegmentTabs';
import { UserDetailModal } from '../../components/admin/UserDetailModal';
import { UserVerificationPanel } from '../../components/admin/UserVerificationPanel';
import { adminListStyles as s } from '../../styles/admin/list';
import { PageShell } from '../../components/common/PageShell';
import { useAppLayout } from '../../hooks/useAppLayout';
import { API_BASE } from '../../utils/apiConfig';
import { getAuthToken } from '../../utils/sessionAuth';
import { adminUsersStyles as styles } from '../../styles/admin/users';
import { colors } from '../../styles/theme';
const USER_TABS = [
  { id: 'residents', label: 'Residents' },
  { id: 'responders', label: 'Responders' },
  { id: 'staff', label: 'Staff' },
];

export default function AdminUsers() {
  const layout = useAppLayout();
  const [tab, setTab] = useState<'residents' | 'responders' | 'staff'>('residents');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [verificationRefresh, setVerificationRefresh] = useState(0);
  const [token, setToken] = useState<string | null>(null);

  const roleId = tab === 'residents' ? 1 : tab === 'responders' ? 2 : 3;
  const tabLabel = tab === 'residents' ? 'Residents' : tab === 'responders' ? 'Responders' : 'Staff';

  useEffect(() => {
    void getAuthToken().then(setToken);
  }, []);

  useEffect(() => {
    if (!token) return;
    loadUsers(page, pageSize, search);
  }, [tab, token]);

  const loadUsers = async (p = 1, ps = pageSize, query = '') => {
    if (!token) return;
    setLoading(true);
    try {
      const q = new URLSearchParams({ roleId: String(roleId), page: String(p), pageSize: String(ps) });
      if (query) q.set('search', query);
      const res = await fetch(`${API_BASE}/users?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const handleUserUpdated = () => {
    loadUsers(page, pageSize, search);
    setVerificationRefresh((n) => n + 1);
  };

  const renderUserActions = (item: any) => (
    <TouchableOpacity style={s.actionBtn} onPress={() => setDetailUserId(item.user_id)}>
      <Text style={s.actionBtnText}>View</Text>
    </TouchableOpacity>
  );

  const renderUserItem = ({ item, index }: { item: any; index: number }) => {
    const fullName = `${item.first_name} ${item.last_name}`;
    const dateCreated = new Date(item.created_at).toLocaleDateString();
    const status = item.is_active ? 'Active' : 'Inactive';

    if (layout.useCompactList) {
      return (
        <AdminListCard
          title={fullName}
          subtitle={item.user_code}
          fields={[
            { label: 'Role', value: item.role_name },
            { label: 'Email', value: item.email },
            { label: 'Phone', value: item.phone_number || '-' },
            { label: 'Status', value: status },
            { label: 'Created', value: dateCreated },
          ]}
          actions={renderUserActions(item)}
        />
      );
    }

    const isLast = index === users.length - 1;

    return (
      <View style={[s.tableRow, isLast && s.tableRowLast]}>
        <Text style={[s.col, styles.colName]} numberOfLines={1}>
          {fullName}
        </Text>
        <Text style={[s.col, styles.colRole]} numberOfLines={1}>
          {item.role_name}
        </Text>
        <Text style={[s.col, styles.colEmail]} numberOfLines={1}>
          {item.email}
        </Text>
        <Text style={[s.col, styles.colPhone]} numberOfLines={1}>
          {item.phone_number || '-'}
        </Text>
        <Text style={[s.col, styles.colStatus]}>{status}</Text>
        <Text style={[s.col, styles.colDate]}>{dateCreated}</Text>
        <View style={[s.col, styles.colActionsCell]}>{renderUserActions(item)}</View>
      </View>
    );
  };

  const desktopTableHeader = (
    <View style={s.tableHeader}>
      <Text style={[s.col, s.colHeader, styles.colName]}>Full Name</Text>
      <Text style={[s.col, s.colHeader, styles.colRole]}>Role</Text>
      <Text style={[s.col, s.colHeader, styles.colEmail]}>Email</Text>
      <Text style={[s.col, s.colHeader, styles.colPhone]}>Phone</Text>
      <Text style={[s.col, s.colHeader, styles.colStatus]}>Status</Text>
      <Text style={[s.col, s.colHeader, styles.colDate]}>Date Created</Text>
      <Text style={[s.col, s.colHeader, styles.colActions]}>Actions</Text>
    </View>
  );

  return (
    <PageShell
      portal="admin"
      activeNavId="users"
      pageTitle="Manage Users"
      scrollEnabled={layout.useCompactList}
    >
      <View style={[s.toolbar, layout.isDesktop && s.toolbarDesktop]}>
        <AdminSegmentTabs
          tabs={USER_TABS}
          activeId={tab}
          onChange={(id) => setTab(id as typeof tab)}
          compact={layout.useCompactList}
        />

        <View style={[s.searchRow, layout.useCompactList ? s.searchRowCompact : s.searchRowDesktop]}>
          <TextInput
            placeholder="Search users"
            value={search}
            onChangeText={setSearch}
            style={[s.searchInput, layout.useCompactList ? s.searchInputCompact : s.searchInputDesktop]}
            returnKeyType="search"
            onSubmitEditing={onSearch}
          />
          {layout.useCompactList ? (
            <View style={[s.btnRow, s.btnRowCompact]}>
              <TouchableOpacity style={s.textBtn} onPress={onSearch}>
                <Text style={s.textBtnLabel}>Search</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.textBtn, s.textBtnOutline]} onPress={() => loadUsers(1, pageSize, search)}>
                <Text style={[s.textBtnLabel, s.textBtnLabelOutline]}>Refresh</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.textBtn}>
                <Text style={s.textBtnLabel}>+ Add User</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity style={s.linkBtn} onPress={onSearch}>
                <Text style={s.linkBtnText}>Search</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.linkBtn} onPress={() => loadUsers(1, pageSize, search)}>
                <Text style={s.linkBtnText}>Refresh</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addUserBtn}>
                <Text style={styles.addUserBtnText}>+ Add User</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {tab === 'residents' ? (
        <UserVerificationPanel
          compact={layout.useCompactList}
          refreshTrigger={verificationRefresh}
          onUpdated={() => loadUsers(page, pageSize, search)}
        />
      ) : null}

      {loading ? (
        <ActivityIndicator style={s.loader} color={colors.primary} />
      ) : layout.useCompactList ? (
        <>
          <Text style={s.sectionTitle}>All {tabLabel}</Text>
          {users.length === 0 ? (
            <View style={s.emptyBox}>
              <Text style={s.emptyText}>No users found.</Text>
            </View>
          ) : (
            users.map((item) => (
              <React.Fragment key={item.user_id}>
                {renderUserItem({ item, index: 0 })}
              </React.Fragment>
            ))
          )}
        </>
      ) : (
        <View style={s.tableSection}>
          <Text style={s.sectionTitle}>All {tabLabel}</Text>
          <View style={s.tableWrap}>
            {desktopTableHeader}
            <FlatList
              style={s.list}
              data={users}
              keyExtractor={(item) => item.user_id}
              nestedScrollEnabled
              ListEmptyComponent={
                <View style={s.emptyBox}>
                  <Text style={s.emptyText}>No users found.</Text>
                </View>
              }
              renderItem={renderUserItem}
            />
          </View>
        </View>
      )}

      {!loading ? (
        <AdminPagination
          page={page}
          total={total}
          pageSize={pageSize}
          onPrev={() => loadUsers(Math.max(1, page - 1), pageSize, search)}
          onNext={() => loadUsers(page + 1, pageSize, search)}
        />
      ) : null}

      <UserDetailModal
        visible={detailUserId !== null}
        userId={detailUserId}
        onClose={() => setDetailUserId(null)}
        onUpdated={handleUserUpdated}
        showVerificationActions={tab === 'residents'}
      />

      <AddUserModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => loadUsers(1, pageSize, search)}
      />
    </PageShell>
  );
}


