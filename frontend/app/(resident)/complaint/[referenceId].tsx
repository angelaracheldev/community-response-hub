import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import CancelComplaintModal from '../../../components/CancelComplaintModal';
import ComplaintDetailContent from '../../../components/complaint/ComplaintDetailContent';
import { PageShell } from '../../../components/common/PageShell';
import { residentComplaintDetailStyles as styles } from '../../../styles/app/residentComplaintDetail';
import {
  cancelComplaint,
  canCancelComplaint,
  fetchComplaintByReferenceId,
  fetchComplaintMedia,
  ComplaintMedia,
  ComplaintRecord,
} from '../../../utils/complaintApi';

export default function ResidentComplaintDetailScreen() {
  const router = useRouter();
  const { referenceId } = useLocalSearchParams<{ referenceId: string }>();
  const scrollPaddingBottom = 32;
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

  return (
    <PageShell portal="resident" activeNavId="tracking" pageTitle="Complaint Details" scrollEnabled={false}>
      <ComplaintDetailContent
        complaint={complaint}
        media={media}
        viewer="resident"
        scrollPaddingBottom={scrollPaddingBottom}
        onBack={() => router.back()}
        actionSection={
          canCancelComplaint(complaint.status) ? (
            <View style={styles.cancelSection}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setCancelVisible(true)}>
                <Text style={styles.cancelButtonText}>Cancel Complaint</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      <CancelComplaintModal
        visible={cancelVisible}
        onClose={() => setCancelVisible(false)}
        onConfirm={handleCancel}
      />
    </PageShell>
  );
}
