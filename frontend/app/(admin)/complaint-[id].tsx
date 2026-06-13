import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AdminComplaintActions from '../../components/admin/AdminComplaintActions';


//Working Import Before adding new API calls
import {
  AdminComplaint,
  ComplaintActivityLog,
  fetchAdminComplaint,
  fetchComplaintActivityLogs,
} from '../../utils/adminApi';

// import {
//   fetchAdminComplaint,
//   fetchComplaintActivityLogs,
//   fetchComplaintMedia,
//   ComplaintMedia,
// } from '../../utils/adminApi';

import ComplaintEvidenceGallery from '../../components/ComplaintEvidenceGallery';

import { adminComplaintDetailStyles as styles } from '../../styles/app/adminComplaintDetail';

function formatActionType(action: string) {
  const map: Record<string,string> = {
    complaint_created: 'Complaint Submitted',
    complaint_assigned: 'Responder Assigned',
    complaint_reassigned: 'Responder Reassigned',
    priority_changed: 'Priority Changed',
    complaint_rejected: 'Complaint Rejected',
    complaint_resolved: 'Complaint Resolved',
  };

  return map[action] || action;
}

export default function ComplaintDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [complaint, setComplaint] = useState<AdminComplaint | null>(null);
  const [logs, setLogs] = useState<ComplaintActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    void loadComplaintAndLogs(id);
  }, [id]);

  const loadComplaintAndLogs = async (complaintId: string): Promise<void> => {
    try {
      setLoading(true);
      const [complaintData, logsData] = await Promise.all([
        fetchAdminComplaint(complaintId),
        fetchComplaintActivityLogs(complaintId),
      ]);
      setComplaint(complaintData);
      setLogs(logsData);
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
          <AdminComplaintActions
  complaintId={complaint.complaint_id}
  currentStatus={complaint.status}
  currentPriority={complaint.priority_level}
  onRefresh={() => {
    if (id) {
      void loadComplaintAndLogs(id);
    }
  }}
/>
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

            <Text style={styles.timelineHeading}>  
                Activity Timeline
            </Text>
            {logs.length === 0 ? (
              <Text style={styles.emptyText}>No activities recorded.</Text>
            ) : (
              <View style={styles.timeline}>
                {logs.map((log, index) => (
                  <View key={log.activity_log_id} style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    {index < logs.length - 1 && <View style={styles.timelineLine} />}

                    <View style={styles.timelineContent}>
                      <Text style={styles.actionType}>{formatActionType(log.action_type)  }</Text>
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

