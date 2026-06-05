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
        {/* Keep your existing users / complaints rendering here */}
      </ScrollView>
    </View>

  </View>
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
  layout: {
  flex: 1,
  flexDirection: 'row',
},

sidebar: {
  width: 250,
  backgroundColor: '#111827',
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
  backgroundColor: '#2563EB',
},

sidebarItemText: {
  color: '#D1D5DB',
  fontSize: 15,
  fontWeight: '600',
},

sidebarItemTextActive: {
  color: '#fff',
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