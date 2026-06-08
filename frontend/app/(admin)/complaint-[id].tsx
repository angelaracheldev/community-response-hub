import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getAuthToken } from '../../utils/sessionAuth';
import { API_BASE } from '../../utils/apiConfig';
import { adminComplaintDetailStyles as styles } from '../../styles/app/adminComplaintDetail';


type ActivityLog = {
  activity_log_id: string;
  action_type: string;
  old_value?: string | null;
  new_value?: string | null;
  description?: string | null;
  created_at: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
};

type Complaint = {
  complaint_id: string;
  reference_id: string;
  title: string;
  status: string;
  priority_level: string;
  category_name: string;
  location_text?: string | null;
  description: string;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
  assigned_to_first_name?: string | null;
  assigned_to_last_name?: string | null;
};

export default function ComplaintDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const authToken = await getAuthToken();
      if (!authToken) {
        router.replace('/(auth)/login');
        return;
      }
      setToken(authToken);
    })();
  }, [router]);

  useEffect(() => {
    if (!token || !id) return;
    loadComplaintAndLogs(token, id);
  }, [token, id]);

  const loadComplaintAndLogs = async (authToken: string, complaintId: string): Promise<void> => {
    try {
      setLoading(true);
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      };

      const complaintRes = await fetch(`${API_BASE}/complaints/${complaintId}`, { headers });
      const complaintData = await complaintRes.json();
      if (complaintRes.ok && complaintData?.data) {
        setComplaint(complaintData.data);
      }

      const logsRes = await fetch(`${API_BASE}/activity-logs/complaint/${complaintId}`, { headers });
      const logsData = await logsRes.json();
      if (logsRes.ok && logsData?.logs) {
        setLogs(logsData.logs);
      }
    } catch (err) {
      console.error('Failed to load complaint:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading complaint details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {complaint ? (
          <>
            <View style={styles.headerCard}>
              <Text style={styles.complaintTitle}>{complaint.title}</Text>
              <View style={styles.badgeRow}>
                <Text style={[styles.badge, { backgroundColor: '#E0E7FF', color: '#3730A3' }]}>
                  {complaint.priority_level}
                </Text>
                <Text
                  style={[
                    styles.badge,
                    complaint.status === 'resolved'
                      ? { backgroundColor: '#D1FAE5', color: '#065F46' }
                      : { backgroundColor: '#FEF3C7', color: '#92400E' },
                  ]}
                >
                  {complaint.status}
                </Text>
              </View>
            </View>

            <View style={styles.detailsCard}>
              <DetailRow label="Reference Number" value={complaint.reference_id || '-'} />
              <DetailRow label="Category" value={complaint.category_name || '-'} />
              <DetailRow label="Location" value={complaint.location_text || '-'} />
              <DetailRow
                label="Assigned To"
                value={
                  complaint.assigned_to_first_name
                    ? `${complaint.assigned_to_first_name} ${complaint.assigned_to_last_name}`
                    : 'Unassigned'
                }
              />
              <DetailRow label="Created" value={new Date(complaint.created_at).toLocaleDateString()} />
              <DetailRow
                label="Description"
                value={complaint.description}
                isMultiline
              />
              {complaint.remarks && (
                <DetailRow label="Remarks" value={complaint.remarks} isMultiline />
              )}
            </View>

            <Text style={styles.timelineHeading}>Activity Timeline</Text>
            {logs.length === 0 ? (
              <Text style={styles.emptyText}>No activities recorded.</Text>
            ) : (
              <View style={styles.timeline}>
                {logs.map((log, index) => (
                  <View key={log.activity_log_id} style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    {index < logs.length - 1 && <View style={styles.timelineLine} />}

                    <View style={styles.timelineContent}>
                      <Text style={styles.actionType}>{log.action_type}</Text>
                      <Text style={styles.activityBy}>
                        {log.first_name} {log.last_name} • {new Date(log.created_at).toLocaleString()}
                      </Text>
                      {log.description && (
                        <Text style={styles.description}>{log.description}</Text>
                      )}
                      {log.old_value && log.new_value && (
                        <Text style={styles.valueChange}>
                          {log.old_value} → {log.new_value}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <Text style={styles.emptyText}>Complaint not found.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  isMultiline,
}: {
  label: string;
  value: string;
  isMultiline?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={[styles.detailValue, isMultiline && styles.detailValueMultiline]}>
        {value}
      </Text>
    </View>
  );
}

