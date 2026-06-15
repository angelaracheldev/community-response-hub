import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import ComplaintDetailContent from '../../../components/complaint/ComplaintDetailContent';
import ResolveComplaintModal from '../../../components/complaint/ResolveComplaintModal';
import { PageShell } from '../../../components/common/PageShell';
import { residentComplaintDetailStyles as styles } from '../../../styles/app/residentComplaintDetail';
import {
  canResolveComplaint,
  canStartWork,
  fetchComplaintByReferenceId,
  fetchComplaintMedia,
  resolveComplaint,
  updateComplaintStatus,
  ComplaintMedia,
  ComplaintRecord,
} from '../../../utils/complaintApi';

export default function RespondentComplaintDetailScreen() {
  const router = useRouter();
  const { referenceId } = useLocalSearchParams<{ referenceId: string }>();
  const scrollPaddingBottom = 32;
  const [complaint, setComplaint] = useState<ComplaintRecord | null>(null);
  const [media, setMedia] = useState<ComplaintMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolveVisible, setResolveVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  const handleStartWork = async () => {
    if (!referenceId || !complaint) return;

    setUpdatingStatus(true);
    try {
      await updateComplaintStatus(referenceId, 'in_progress');
      await loadDetails();
    } catch (err) {
      Alert.alert(
        'Unable to start work',
        err instanceof Error ? err.message : 'Please try again.'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleResolve = async (remarks: string, assets: Parameters<typeof resolveComplaint>[2]) => {
    if (!referenceId) return;

    await resolveComplaint(referenceId, remarks, assets);
    await loadDetails();
  };

  if (loading) {
    return (
      <PageShell portal="respondent" activeNavId="assignments" pageTitle="Complaint Details" scrollEnabled={false}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      </PageShell>
    );
  }

  if (error || !complaint) {
    return (
      <PageShell portal="respondent" activeNavId="assignments" pageTitle="Complaint Details" scrollEnabled={false}>
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

  const showStartWork = canStartWork(complaint.status);
  const showResolve = canResolveComplaint(complaint.status);

  return (
    <PageShell portal="respondent" activeNavId="assignments" pageTitle="Complaint Details" scrollEnabled={false}>
      <ComplaintDetailContent
        complaint={complaint}
        media={media}
        viewer="responder"
        scrollPaddingBottom={scrollPaddingBottom}
        onBack={() => router.back()}
        actionSection={
          showStartWork || showResolve ? (
            <>
              {showStartWork ? (
                <TouchableOpacity
                  style={styles.primaryActionButton}
                  onPress={handleStartWork}
                  disabled={updatingStatus}
                >
                  {updatingStatus ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.primaryActionButtonText}>Start Work</Text>
                  )}
                </TouchableOpacity>
              ) : null}
              {showResolve ? (
                <TouchableOpacity
                  style={styles.resolveActionButton}
                  onPress={() => setResolveVisible(true)}
                  disabled={updatingStatus}
                >
                  <Text style={styles.resolveActionButtonText}>Mark as Resolved</Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : null
        }
      />

      <ResolveComplaintModal
        visible={resolveVisible}
        onClose={() => setResolveVisible(false)}
        onConfirm={handleResolve}
      />
    </PageShell>
  );
}
