import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { clearAdminToken, getAdminToken } from '../../utils/authStorage';
import { API_BASE } from '../../utils/apiConfig';
//import NoDocumentImage from '../../assets/';

type User = {
  user_id: string;
  user_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string | null;
  address?: string | null;
  profile_image_url?: string | null;
  role_id: number;
  role_name: string;
  is_verified: boolean;
  is_active: boolean;
  verification_status?: string;
  verification_type?: string | null;
  document_url?: string | null;
  created_at?: string;
};

type Complaint = {
  complaint_id: string;
  title: string;
  priority_level: string;
  status: string;
  category_name: string;
  reported_by?: string | null;
  assigned_to_first_name?: string | null;
  assigned_to_last_name?: string | null;
  remarks?: string | null;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'users' | 'complaints'>('users');
  const [pendingResidents, setPendingResidents] = useState<User[]>([]);
  const [verifiedResidents, setVerifiedResidents] = useState<User[]>([]);
  const [respondents, setRespondents] = useState<User[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const authToken = getAdminToken();
    if (!authToken) {
      router.replace('/(admin)/login');
      return;
    }
    setToken(authToken);
  }, []);

  useEffect(() => {
    if (!token) return;
    if (selectedTab === 'users') {
      loadUserTables(token);
    } else {
      loadComplaints(token);
    }
  }, [selectedTab, token]);

  const requestOptions = (authToken: string) => ({
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });

  const loadUserTables = async (authToken: string): Promise<void> => {
    setLoading(true);
    setStatusMessage('Loading user management tables...');
    try {
      const [pendingRes, verifiedRes, respondentsRes] = await Promise.all([
        fetch(`${API_BASE}/users?roleId=1&verificationStatus=pending`, requestOptions(authToken)),
        fetch(`${API_BASE}/users?roleId=1&verificationStatus=approved`, requestOptions(authToken)),
        fetch(`${API_BASE}/users?roleId=2`, requestOptions(authToken)),
      ]);

      const [pendingData, verifiedData, respondentsData] = await Promise.all([
        pendingRes.json(),
        verifiedRes.json(),
        respondentsRes.json(),
      ]);

      if (!pendingRes.ok || !verifiedRes.ok || !respondentsRes.ok) {
        throw new Error(
          pendingData.message || verifiedData.message || respondentsData.message || 'Unable to load user tables'
        );
      }

      setPendingResidents(pendingData.users || []);
      setVerifiedResidents(verifiedData.users || []);
      setRespondents(respondentsData.users || []);
      setStatusMessage('');
    } catch (error) {
      console.error('Load user tables error:', error);
      setStatusMessage('Unable to load users. Check backend and token.');
      setPendingResidents([]);
      setVerifiedResidents([]);
      setRespondents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (userId: string): Promise<void> => {
    if (!token) return;
    setLoading(true);
    setModalOpen(true);
    setSelectedUser(null);

    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, requestOptions(token));
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to load user details');
      }
      setSelectedUser(data.user || null);
    } catch (error) {
      console.error('Load user details error:', error);
      setStatusMessage('Unable to load user details.');
    } finally {
      setLoading(false);
    }
  };

  const approveVerification = async (userId: string): Promise<void> => {
    setConfirmUserId(userId);
    setConfirmOpen(true);
  };

  const confirmApproveVerification = async (): Promise<void> => {
    if (!token || !confirmUserId) return;
    setLoading(true);
    setStatusMessage('Approving verification...');
    try {
      const response = await fetch(`${API_BASE}/users/${confirmUserId}/verification/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ verificationStatus: 'approved' }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to approve verification');
      }
      setStatusMessage(data.message || 'Verification approved');
      setConfirmOpen(false);
      setConfirmUserId(null);
      await loadUserTables(token);
      await loadUserDetails(confirmUserId);
    } catch (error) {
      console.error('Approve verification error:', error);
      setStatusMessage('Failed to approve verification.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString();
  };

  const loadComplaints = async (authToken: string): Promise<void> => {
    setLoading(true);
    setStatusMessage('Loading complaints...');
    try {
      const response = await fetch(`${API_BASE}/complaints`, requestOptions(authToken));
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to load complaints');
      }
      setComplaints(data.complaints || []);
    } catch (error) {
      console.error('Load complaints error:', error);
      setStatusMessage('Unable to load complaints. Check backend and token.');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (userId: string, isActive: boolean): Promise<void> => {
    if (!token) return;
    setLoading(true);
    setStatusMessage(`Updating ${isActive ? 'deactivation' : 'activation'}...`);

    try {
      const action = isActive ? 'deactivate' : 'activate';
      const response = await fetch(`${API_BASE}/users/${userId}/${action}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to update user status');
      }
      loadUserTables(token);
      setStatusMessage(data.message || 'User status updated');
    } catch (error) {
      console.error('Toggle active error:', error);
      setStatusMessage('Failed to update user status.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAdminToken();
    router.replace('/(admin)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
  <View style={styles.layout}>
    
    {/* Sidebar */}
    <View style={styles.sidebar}>
      <Text style={styles.sidebarTitle}>Admin Panel</Text>

      <TouchableOpacity
        style={[
          styles.sidebarItem,
          selectedTab === 'users' && styles.sidebarItemActive,
        ]}
        onPress={() => setSelectedTab('users')}
      >
        <Text
          style={[
            styles.sidebarItemText,
            selectedTab === 'users' && styles.sidebarItemTextActive,
          ]}
        >
          Manage Users
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.sidebarItem,
          selectedTab === 'complaints' && styles.sidebarItemActive,
        ]}
        onPress={() => setSelectedTab('complaints')}
      >
        <Text
          style={[
            styles.sidebarItemText,
            selectedTab === 'complaints' && styles.sidebarItemTextActive,
          ]}
        >
          Manage Complaints
        </Text>
      </TouchableOpacity>

      <View style={styles.sidebarFooter}>
        <TouchableOpacity
          style={styles.logoutSidebarButton}
          onPress={logout}
        >
          <Text style={styles.logoutSidebarText}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>

    {/* Main Area */}
    <View style={styles.mainContent}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>
            Manage users and complaints
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {statusMessage ? (
          <View style={styles.loadingBanner}>
            <Text style={styles.loadingText}>{statusMessage}</Text>
          </View>
        ) : null}

        {selectedTab === 'users' ? (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Residents Pending Verification</Text>
              {pendingResidents.length === 0 ? (
                <Text style={styles.emptyText}>No pending verification records found.</Text>
              ) : (
                <View style={styles.tableContainer}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableCell, styles.cellId]}>User ID</Text>
                    <Text style={[styles.tableCell, styles.cellName]}>Name</Text>
                    <Text style={[styles.tableCell, styles.cellDate]}>Registered</Text>
                    <Text style={[styles.tableCell, styles.cellSmall]}>Verified</Text>
                    <Text style={[styles.tableCell, styles.cellSmall]}>Active</Text>
                    <Text style={[styles.tableCell, styles.cellAction]}>Actions</Text>
                  </View>
                  {pendingResidents.map((user) => (
                    <View key={user.user_id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.cellId]} numberOfLines={1}>{user.user_id.split('-')[0]}</Text>
                      <Text style={[styles.tableCell, styles.cellName]} numberOfLines={1}>{user.first_name} {user.last_name}</Text>
                      <Text style={[styles.tableCell, styles.cellDate]}>{formatDate(user.created_at)}</Text>
                      <Text style={[styles.tableCell, styles.cellSmall]}>{user.is_verified ? 'Yes' : 'No'}</Text>
                      <Text style={[styles.tableCell, styles.cellSmall]}>{user.is_active ? 'Yes' : 'No'}</Text>
                      <TouchableOpacity style={styles.viewBtn} onPress={() => loadUserDetails(user.user_id)}>
                        <Text style={styles.viewBtnText}>View</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Residents Verified</Text>
              {verifiedResidents.length === 0 ? (
                <Text style={styles.emptyText}>No verified residents available.</Text>
              ) : (
                <View style={styles.tableContainer}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableCell, styles.cellId]}>User ID</Text>
                    <Text style={[styles.tableCell, styles.cellName]}>Name</Text>
                    <Text style={[styles.tableCell, styles.cellDate]}>Registered</Text>
                    <Text style={[styles.tableCell, styles.cellSmall]}>Verified</Text>
                    <Text style={[styles.tableCell, styles.cellSmall]}>Active</Text>
                    <Text style={[styles.tableCell, styles.cellAction]}>Actions</Text>
                  </View>
                  {verifiedResidents.map((user) => (
                    <View key={user.user_id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.cellId]} numberOfLines={1}>{user.user_id.split('-')[0]}</Text>
                      <Text style={[styles.tableCell, styles.cellName]} numberOfLines={1}>{user.first_name} {user.last_name}</Text>
                      <Text style={[styles.tableCell, styles.cellDate]}>{formatDate(user.created_at)}</Text>
                      <Text style={[styles.tableCell, styles.cellSmall]}>{user.is_verified ? 'Yes' : 'No'}</Text>
                      <Text style={[styles.tableCell, styles.cellSmall]}>{user.is_active ? 'Yes' : 'No'}</Text>
                      <TouchableOpacity style={styles.viewBtn} onPress={() => loadUserDetails(user.user_id)}>
                        <Text style={styles.viewBtnText}>View</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Respondents</Text>
              {respondents.length === 0 ? (
                <Text style={styles.emptyText}>No respondents registered yet.</Text>
              ) : (
                <View style={styles.tableContainer}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableCell, styles.cellId]}>User ID</Text>
                    <Text style={[styles.tableCell, styles.cellName]}>Name</Text>
                    <Text style={[styles.tableCell, styles.cellDate]}>Registered</Text>
                    <Text style={[styles.tableCell, styles.cellSmall]}>Verified</Text>
                    <Text style={[styles.tableCell, styles.cellSmall]}>Active</Text>
                    <Text style={[styles.tableCell, styles.cellAction]}>Actions</Text>
                  </View>
                  {respondents.map((user) => (
                    <View key={user.user_id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.cellId]} numberOfLines={1}>{user.user_id.split('-')[0]}</Text>
                      <Text style={[styles.tableCell, styles.cellName]} numberOfLines={1}>{user.first_name} {user.last_name}</Text>
                      <Text style={[styles.tableCell, styles.cellDate]}>{formatDate(user.created_at)}</Text>
                      <Text style={[styles.tableCell, styles.cellSmall]}>{user.is_verified ? 'Yes' : 'No'}</Text>
                      <Text style={[styles.tableCell, styles.cellSmall]}>{user.is_active ? 'Yes' : 'No'}</Text>
                      <TouchableOpacity style={styles.viewBtn} onPress={() => loadUserDetails(user.user_id)}>
                        <Text style={styles.viewBtnText}>View</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : (
          <>
            {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
              <Text style={styles.emptyText}>Select a complaint action from the sidebar to view complaint management.</Text>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={modalOpen} animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.title}>User Details</Text>
          </View>
          <View style={styles.modalContent}>
            {!selectedUser ? (
              <ActivityIndicator />
            ) : (
              <ScrollView>
                
                <Text style={styles.detail}><Text style={styles.detailLabel}>User ID: </Text>{selectedUser.user_id}</Text>
                <Text style={styles.detail}><Text style={styles.detailLabel}>Full Name: </Text>{selectedUser.first_name} {selectedUser.last_name}</Text>
                <Text style={styles.detail}><Text style={styles.detailLabel}>Address: </Text>{selectedUser.address || '-'}</Text>
                <Text style={styles.detail}><Text style={styles.detailLabel}>Phone Number: </Text>{selectedUser.phone_number || '-'}</Text>
                <Text style={styles.detail}><Text style={styles.detailLabel}>Profile Image URL: </Text>{selectedUser.profile_image_url || '-'}</Text>
                <Text style={styles.detail}><Text style={styles.detailLabel}>Email: </Text>{selectedUser.email}</Text>
                <Text style={styles.detail}><Text style={styles.detailLabel}>Active: </Text>{selectedUser.is_active ? 'Yes' : 'No'}</Text>
                <Text style={styles.detail}><Text style={styles.detailLabel}>Verified: </Text>{selectedUser.is_verified ? 'Yes' : 'No'}</Text>
                <Text style={styles.detail}><Text style={styles.detailLabel}>Verification Type: </Text>{selectedUser.verification_type || '-'}</Text>
                {selectedUser.document_url ? (
                  <View style={styles.documentContainer}>
                    <Text style={styles.documentLabel}>Verification Document</Text>
                    <Image
                      source={{ uri: selectedUser.document_url }}
                      style={styles.documentImage}
                      resizeMode="contain"
                    />
                  </View>
                ) : null}
                <Text style={styles.detail}><Text style={styles.detailLabel}>Status: </Text>{selectedUser.verification_status || '-'}</Text>
                {selectedUser.verification_status === 'pending' && selectedUser.role_id === 1 ? (
                  <TouchableOpacity style={styles.verifyBtn} onPress={() => approveVerification(selectedUser.user_id)}>
                    <Text style={styles.verifyBtnText}>Approve Verification</Text>
                  </TouchableOpacity>
                ) : null}
                
              </ScrollView>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalOpen(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>Verify User?</Text>
            <Text style={styles.confirmMessage}>Are you sure you want to approve this resident's verification request?</Text>
            <View style={styles.confirmButtonRow}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.noButton]}
                onPress={() => setConfirmOpen(false)}
              >
                <Text style={styles.confirmButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.yesButton]}
                onPress={() => confirmApproveVerification()}
              >
                <Text style={styles.confirmButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>

  </View>
</SafeAreaView>
  );
}



const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
   paddingHorizontal: 24,
  paddingTop: 24,
  paddingBottom: 14,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottomWidth: 1,
  borderBottomColor: '#e5e7eb',
  backgroundColor: '#ffffff',
  },
  title: {
     fontSize: 24,
  fontWeight: '800',
  color: '#111827',
  },
  subtitle: {
     fontSize: 14,
  color: '#6b7280',
  marginTop: 4,
  },
  menuWrapper: {
    alignItems: 'flex-end',
  },
  menuButton: {
  backgroundColor: '#fee2e2',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 8,
},

menuButtonText: {
  color: '#ef4444',
  fontWeight: '600',
  fontSize: 13,
},
  menuDropdown: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  menuItem: {
    padding: 12,
  },
  menuItemText: {
    color: '#dc2626',
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    marginHorizontal: 4,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  tabText: {
    color: '#374151',
    fontWeight: '700',
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    padding: 16,
  paddingBottom: 40,
  },
 loadingBanner: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#ecfdf5',
  padding: 12,
  borderRadius: 10,
  marginBottom: 16,
  borderLeftWidth: 4,
  borderLeftColor: '#10b981',
},
  loadingText: {
    marginLeft: 10,
    color: '#111827',
  },
statusText: {
  color: '#4b5563',
  marginBottom: 12,
},
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 24,
  },
  card: {
    backgroundColor: '#ffffff',
  padding: 16,
  borderRadius: 12,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: '#e5e7eb',
  },
  tableContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    marginTop: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  tableCell: {
    color: '#111827',
    fontSize: 12,
  },
  cellId: {
    width: 80,
  },
  cellName: {
    flex: 1,
  },
  cellDate: {
    width: 95,
  },
  cellSmall: {
    width: 70,
    textAlign: 'center',
  },
  cellAction: {
    width: 90,
    textAlign: 'center',
  },
  viewBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  detail: {
    marginBottom: 10,
    color: '#374151',
  },
  detailLabel: {
    fontWeight: '700',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  verifyBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  verifyBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  closeBtn: {
    marginTop: 24,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  closeText: {
    color: '#111827',
    fontWeight: '700',
  },
  modalContent: {
    padding: 16,
    flex: 1,
  },
  modalSafe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  documentContainer: {
    marginBottom: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  documentLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  documentImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmDialog: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  confirmButtonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  noButton: {
    backgroundColor: '#e5e7eb',
  },
  yesButton: {
    backgroundColor: '#10B981',
  },
  confirmButtonText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#111827',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    color: '#111827',
    fontWeight: '700',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
  },
  badgeActive: {
  backgroundColor: '#D1FAE5',
  color: '#065F46',
},

badgeInactive: {
  backgroundColor: '#FEE2E2',
  color: '#991B1B',
},
  cardText: {
    color: '#4b5563',
    marginBottom: 6,
  },
  linkText: {
    color: '#2563EB',
    fontWeight: '700',
    marginTop: 8,
  },
  actionButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  deactivateButton: {
    backgroundColor: '#DC2626',
  },
  activateButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  layout: {
  flex: 1,
  flexDirection: 'row',
},

sidebar: {
  width: 250,
  backgroundColor: '#1f2937',
  paddingVertical: 24,
  paddingHorizontal: 16,
},

sidebarTitle: {
  color: '#fff',
  fontSize: 22,
  fontWeight: '800',
  marginBottom: 24,
},

sidebarItem: {
  paddingVertical: 14,
  paddingHorizontal: 14,
  borderRadius: 12,
  marginBottom: 8,
},

sidebarItemActive: {
  backgroundColor: '#4f46e5',
},

sidebarItemText: {
  color: '#d1d5db',
  fontSize: 15,
  fontWeight: '600',
},

sidebarItemTextActive: {
  color: '#ffffff',
},

sidebarFooter: {
  marginTop: 'auto',
},

logoutSidebarButton: {
  backgroundColor: '#DC2626',
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: 'center',
},

logoutSidebarText: {
  color: '#fff',
  fontWeight: '700',
},


mainContent: {
  flex: 1,
  backgroundColor: '#F8FAFC',
},
});