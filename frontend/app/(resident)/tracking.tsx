import React, { useCallback, useState } from 'react';
import { Text, View, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge';
import { PageShell } from '../../components/common/PageShell';
import { getFloatingQuickActionsPadding } from '../../components/dashboard/FloatingQuickActionsBar';
import { useAppLayout } from '../../hooks/useAppLayout';
import { residentTrackingStyles as styles } from '../../styles/app/residentTracking';
import {
  fetchMyComplaints,
  formatAssigneeName,
  formatDate,
  formatDateTime,
  ComplaintRecord,
} from '../../utils/complaintApi';

export default function TrackingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const layout = useAppLayout();
  const scrollPaddingBottom = layout.showMobileMenu
    ? getFloatingQuickActionsPadding(width, insets.bottom)
    : 32;
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComplaints = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await fetchMyComplaints();
      setComplaints(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load complaints');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadComplaints();
    }, [loadComplaints])
  );

  if (loading) {
    return (
      <PageShell portal="resident" activeNavId="tracking" pageTitle="My Complaints" scrollEnabled={false}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      </PageShell>
    );
  }

  return (
    <PageShell portal="resident" activeNavId="tracking" pageTitle="My Complaints" scrollEnabled={false}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: scrollPaddingBottom }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadComplaints(true)} />
        }
      >

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => loadComplaints()}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : complaints.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>You have not submitted any complaints yet.</Text>
          </View>
        ) : (
          complaints.map((item) => (
            <TouchableOpacity
              key={item.reference_id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: '/(resident)/complaint/[referenceId]',
                  params: { referenceId: item.reference_id },
                })
              }
            >
              <View style={styles.row}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <ComplaintStatusBadge status={item.status} compact />
              </View>
              <Text style={styles.metaRow}>
                <Text style={styles.metaLabel}>Assigned To: </Text>
                {formatAssigneeName(item)}
              </Text>
              <Text style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date Submitted: </Text>
                {formatDate(item.created_at)}
              </Text>
              <Text style={styles.metaRow}>
                <Text style={styles.metaLabel}>Last Updated: </Text>
                {formatDateTime(item.updated_at ?? item.created_at)}
              </Text>
              <Text style={styles.refRow}>Ref: {item.reference_id}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </PageShell>
  );
}


