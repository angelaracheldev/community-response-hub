import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { clearAdminToken, getAdminToken } from '../../utils/authStorage';
import { API_BASE } from '../../utils/apiConfig';

type User = {
  user_id: string;
  user_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string | null;
  address?: string | null;
  role_id: number;
  role_name: string;
  is_verified: boolean;
  is_active: boolean;
  verification_status?: string;
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
  const [users, setUsers] = useState<User[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
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
      loadUsers(token);
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

  const loadUsers = async (authToken: string): Promise<void> => {
    setLoading(true);
    setStatusMessage('Loading users...');
    try {
      const response = await fetch(`${API_BASE}/users`, requestOptions(authToken));
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to load users');
      }
      setUsers(data.users || []);
    } catch (error) {
      console.error('Load users error:', error);
      setStatusMessage('Unable to load users. Check backend and token.');
    } finally {
      setLoading(false);
    }
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
      loadUsers(token);
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
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Minimal management screen for users and complaints.</Text>
        </View>
        <View style={styles.menuWrapper}>
          <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(!menuOpen)}>
            <Text style={styles.menuButtonText}>Account ▼</Text>
          </TouchableOpacity>
          {menuOpen && (
            <View style={styles.menuDropdown}>
              <TouchableOpacity style={styles.menuItem} onPress={logout}>
                <Text style={styles.menuItemText}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'users' && styles.activeTab]}
          onPress={() => router.push('/(admin)/users')}
        >
          <Text style={[styles.tabText, selectedTab === 'users' && styles.activeTabText]}>Manage Users</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'complaints' && styles.activeTab]}
          onPress={() => router.push('/(admin)/complaints')}
        >
          <Text style={[styles.tabText, selectedTab === 'complaints' && styles.activeTabText]}>Manage Complaints</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading && (
          <View style={styles.loadingBanner}>
            <ActivityIndicator size="small" color="#111827" />
            <Text style={styles.loadingText}>{statusMessage}</Text>
          </View>
        )}
        {!loading && statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}

        {selectedTab === 'users' ? (
          <View>
            {users.length === 0 ? (
              <Text style={styles.emptyText}>No users found.</Text>
            ) : (
              users.map((user) => (
                <View key={user.user_id} style={styles.card}>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardTitle}>{user.first_name} {user.last_name}</Text>
                    <Text style={[styles.badge, user.is_active ? styles.badgeActive : styles.badgeInactive]}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                  <Text style={styles.cardText}>Role: {user.role_name}</Text>
                  <Text style={styles.cardText}>Email: {user.email}</Text>
                  <Text style={styles.cardText}>Verified: {user.is_verified ? 'Yes' : 'No'}</Text>
                  <TouchableOpacity
                    style={[styles.actionButton, user.is_active ? styles.deactivateButton : styles.activateButton]}
                    onPress={() => toggleActive(user.user_id, user.is_active)}
                  >
                    <Text style={styles.actionButtonText}>{user.is_active ? 'Deactivate' : 'Activate'}</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        ) : (
          <View>
            {complaints.length === 0 ? (
              <Text style={styles.emptyText}>No complaints found.</Text>
            ) : (
              complaints.map((complaint) => (
                <TouchableOpacity
                  key={complaint.complaint_id}
                  onPress={() => router.push(`/(admin)/complaint-${complaint.complaint_id}`)}
                  activeOpacity={0.8}
                >
                  <View style={styles.card}>
                    <View style={styles.cardRow}>
                      <Text style={styles.cardTitle}>{complaint.title}</Text>
                      <Text style={styles.badge}>{complaint.priority_level}</Text>
                    </View>
                    <Text style={styles.cardText}>Status: {complaint.status}</Text>
                    <Text style={styles.cardText}>Category: {complaint.category_name}</Text>
                    <Text style={styles.cardText}>Reported by: {complaint.reported_by || 'Unknown'}</Text>
                    <Text style={styles.cardText}>Assigned to: {complaint.assigned_to_first_name ? `${complaint.assigned_to_first_name} ${complaint.assigned_to_last_name}` : 'Unassigned'}</Text>
                    <Text style={styles.cardText}>Remarks: {complaint.remarks || '-'}</Text>
                    <Text style={styles.linkText}>View Timeline →</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 4,
    maxWidth: 260,
  },
  menuWrapper: {
    alignItems: 'flex-end',
  },
  menuButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  menuButtonText: {
    color: '#111827',
    fontWeight: '700',
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
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  loadingText: {
    marginLeft: 10,
    color: '#111827',
  },
  statusText: {
    marginBottom: 16,
    color: '#6b7280',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
});