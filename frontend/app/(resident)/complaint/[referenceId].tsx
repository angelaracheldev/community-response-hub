import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import ComplaintStatusBadge from '../../../components/ComplaintStatusBadge';
import ComplaintEvidenceGallery from '../../../components/ComplaintEvidenceGallery';
import ComplaintStatusTimeline from '../../../components/ComplaintStatusTimeline';
import CancelComplaintModal from '../../../components/CancelComplaintModal';
import { PageShell } from '../../../components/common/PageShell';
import { getFloatingQuickActionsPadding } from '../../../components/dashboard/FloatingQuickActionsBar';
import { useAppLayout } from '../../../hooks/useAppLayout';
import {
  cancelComplaint,
  canCancelComplaint,
  fetchComplaintByReferenceId,
  fetchComplaintMedia,
  formatAssigneeName,
  formatDate,
  formatDateTime,
  splitComplaintMedia,
  ComplaintMedia,
  ComplaintRecord,
} from '../../../utils/complaintApi';

function DetailRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, multiline && styles.detailValueMultiline]}>{value}</Text>
    </View>
  );
}

export default function ResidentComplaintDetailScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const layout = useAppLayout();
  const { referenceId } = useLocalSearchParams<{ referenceId: string }>();
  const scrollPaddingBottom = layout.showMobileMenu
    ? getFloatingQuickActionsPadding(width, insets.bottom)
    : 32;
  const [complaint, setComplaint] = useState<ComplaintRecord | null>(null);
  const [media, setMedia] = useState<ComplaintMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelVisible, setCancelVisible] = useState(false);

  const loadDetails = useCallback(async () => {
    if (!referenceId) return;
    setLoading(true);
    setError(null);

    try {
      const [complaintData, mediaData] = await Promise.all([
        fetchComplaintByReferenceId(referenceId),
        fetchComplaintMedia(referenceId),
      ]);
      setComplaint(complaintData);
      setMedia(mediaData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load complaint details');
      setComplaint(null);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, [referenceId]);

  useFocusEffect(
    useCallback(() => {
      loadDetails();
    }, [loadDetails])
  );

  const handleCancel = async (reason: string) => {
    if (!referenceId) return;
    const updated = await cancelComplaint(referenceId, reason);
    setComplaint(updated);
    setCancelVisible(false);
  };

  if (loading) {
    return (
      <PageShell portal="resident" activeNavId="tracking" pageTitle="Complaint Details" scrollEnabled={false}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      </PageShell>
    );
  }

  if (error || !complaint) {
    return (
      <PageShell portal="resident" activeNavId="tracking" pageTitle="Complaint Details" scrollEnabled={false}>
        <View style={[styles.container, { paddingHorizontal: 0 }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.errorText}>{error ?? 'Complaint not found'}</Text>
          <TouchableOpacity onPress={loadDetails}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </PageShell>
    );
  }

  const { residentEvidence, resolutionEvidence } = splitComplaintMedia(
    media,
    complaint.reported_by ?? ''
  );

  return (
    <PageShell portal="resident" activeNavId="tracking" pageTitle="Complaint Details" scrollEnabled={false}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingBottom: scrollPaddingBottom,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerCard}>
          <Text style={styles.headline}>{complaint.title}</Text>
          <ComplaintStatusBadge status={complaint.status} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Complaint Information</Text>
          <DetailRow label="Reference Number" value={complaint.reference_id} />
          <DetailRow label="Headline" value={complaint.title} />
          <DetailRow label="Category" value={complaint.category_name ?? '-'} />
          <DetailRow label="Description" value={complaint.description} multiline />
          <DetailRow label="Location" value={complaint.location_text || '-'} />
          <DetailRow label="Status" value={complaint.status.replace(/_/g, ' ')} />
          <DetailRow label="Date Submitted" value={formatDate(complaint.created_at)} />
          <DetailRow
            label="Last Updated"
            value={formatDateTime(complaint.updated_at ?? complaint.created_at)}
          />
          <DetailRow label="Assigned Responder" value={formatAssigneeName(complaint)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resident Evidence</Text>
          <ComplaintEvidenceGallery
            media={residentEvidence}
            emptyMessage="No evidence uploaded."
          />
        </View>

        {complaint.status === 'resolved' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resolution Details</Text>
            <DetailRow label="Resolved By" value={formatAssigneeName(complaint)} />
            <DetailRow
              label="Date Resolved"
              value={formatDate(complaint.updated_at ?? complaint.created_at)}
            />
            <DetailRow
              label="Resolution Remarks"
              value={complaint.remarks || 'No remarks provided.'}
              multiline
            />
            <Text style={styles.subheading}>Resolution Evidence</Text>
            <ComplaintEvidenceGallery
              media={resolutionEvidence}
              emptyMessage="No resolution evidence uploaded."
            />
          </View>
        ) : null}

        {complaint.status === 'rejected' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rejection Details</Text>
            <DetailRow
              label="Reason"
              value={complaint.remarks || 'No rejection reason provided.'}
              multiline
            />
            <DetailRow
              label="Date Rejected"
              value={formatDate(complaint.updated_at ?? complaint.created_at)}
            />
          </View>
        ) : null}

        {complaint.status === 'cancelled' && complaint.remarks ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cancellation Details</Text>
            <DetailRow label="Cancellation Reason" value={complaint.remarks} multiline />
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Complaint Timeline</Text>
        <ComplaintStatusTimeline complaint={complaint} />

        {canCancelComplaint(complaint.status) ? (
          <View style={styles.cancelSection}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setCancelVisible(true)}>
              <Text style={styles.cancelButtonText}>Cancel Complaint</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      <CancelComplaintModal
        visible={cancelVisible}
        onClose={() => setCancelVisible(false)}
        onConfirm={handleCancel}
      />
    </PageShell>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 24,
  },
  backLink: {
    color: '#4f46e5',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 16,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
  },
  headline: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  subheading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginTop: 8,
    marginBottom: 8,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    color: '#111827',
    fontSize: 14,
  },
  detailValueMultiline: {
    lineHeight: 20,
  },
  cancelSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 15,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    marginVertical: 12,
  },
  retryText: {
    color: '#4f46e5',
    fontWeight: '600',
    fontSize: 14,
  },
});
