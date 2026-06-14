import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { authFetch } from '../../utils/authFetch';
import { API_BASE } from '../../utils/apiConfig';

type User = {
  user_id: string;
  first_name: string;
  last_name: string;
};

type Props = {
  complaintId: string;
  currentStatus: string;
  currentPriority: string;
  onRefresh: () => void;
};

export default function AdminComplaintActions({
  complaintId,
  currentStatus,
  currentPriority,
  onRefresh,
}: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [priority, setPriority] = useState(currentPriority);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await authFetch(`${API_BASE}/users?roleId=2&page=1&pageSize=100`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function assignResponder() {
    if (!selectedUser) return;

    setLoading(true);
    try {
      await authFetch(`${API_BASE}/complaints/${complaintId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToUserId: selectedUser }),
      });

      Alert.alert('Success', 'Responder assigned');
      onRefresh();
    } catch (err) {
      Alert.alert('Error', 'Failed to assign responder');
    } finally {
      setLoading(false);
    }
  }

  async function updatePriority(newPriority: string) {
    setPriority(newPriority);

    try {
      await authFetch(`${API_BASE}/complaints/${complaintId}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priorityLevel: newPriority }),
      });

      onRefresh();
    } catch (err) {
      Alert.alert('Error', 'Failed to update priority');
    }
  }

  async function rejectComplaint() {
    try {
      await authFetch(`${API_BASE}/complaints/${complaintId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaintStatus: 'rejected' }),
      });

      Alert.alert('Rejected', 'Complaint has been rejected');
      onRefresh();
    } catch (err) {
      Alert.alert('Error', 'Failed to reject complaint');
    }
  }

  return (
    <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16 }}>

      <Text style={{ fontWeight: '800', fontSize: 16, marginBottom: 12 }}>
        Admin Controls
      </Text>

      {/* ASSIGN RESPONDER */}
      <Text style={{ fontWeight: '600' }}>Assign / Reassign</Text>

      <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
        <TextInput
          placeholder="Enter user ID"
          value={selectedUser}
          onChangeText={setSelectedUser}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#ddd',
            padding: 8,
            borderRadius: 8,
          }}
        />

        <TouchableOpacity
          onPress={assignResponder}
          style={{
            backgroundColor: '#2563EB',
            padding: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Assign</Text>
        </TouchableOpacity>
      </View>

      {/* PRIORITY */}
      <Text style={{ marginTop: 16, fontWeight: '600' }}>Priority</Text>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        {['low', 'normal', 'high', 'urgent'].map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => updatePriority(p)}
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: priority === p ? '#111827' : '#E5E7EB',
            }}
          >
            <Text style={{ color: priority === p ? '#fff' : '#111827' }}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* REJECT */}
      <TouchableOpacity
        onPress={rejectComplaint}
        style={{
          marginTop: 16,
          backgroundColor: '#DC2626',
          padding: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>
          Reject Complaint
        </Text>
      </TouchableOpacity>
    </View>
  );
}