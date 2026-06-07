import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge';
import { PageShell } from '../../components/common/PageShell';
import { getFloatingQuickActionsPadding } from '../../components/dashboard/FloatingQuickActionsBar';
import { useAppLayout } from '../../hooks/useAppLayout';
import {
  ComplaintRecord,
  fetchAssignedComplaints,
  formatDate,
  formatDateTime,
} from '../../utils/complaintApi';

export default function MyAssignmentsScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const layout = useAppLayout();
  const scrollPaddingBottom = layout.showMobileMenu
    ? getFloatingQuickActionsPadding(width, insets.bottom)
    : 32;
  const [assignments, setAssignments] = useState<ComplaintRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAssignments = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await fetchAssignedComplaints();
      setAssignments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load assignments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAssignments();
    }, [loadAssignments])
  );

  if (loading) {
    return (
      <PageShell portal="respondent" activeNavId="assignments" pageTitle="My Assignments" scrollEnabled={false}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      </PageShell>
    );
  }

  return (
    <PageShell portal="respondent" activeNavId="assignments" pageTitle="My Assignments" scrollEnabled={false}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: scrollPaddingBottom }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadAssignments(true)} />
        }
      >
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => loadAssignments()}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : assignments.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No complaints have been assigned to you yet.</Text>
          </View>
        ) : (
          assignments.map((item) => (
            <View key={item.reference_id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <ComplaintStatusBadge status={item.status} compact />
              </View>
              {item.category_name ? (
                <Text style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Category: </Text>
                  {item.category_name}
                </Text>
              ) : null}
              <Text style={styles.metaRow}>
                <Text style={styles.metaLabel}>Location: </Text>
                {item.location_text || 'Not specified'}
              </Text>
              <Text style={styles.metaRow}>
                <Text style={styles.metaLabel}>Assigned: </Text>
                {formatDate(item.created_at)}
              </Text>
              <Text style={styles.metaRow}>
                <Text style={styles.metaLabel}>Last Updated: </Text>
                {formatDateTime(item.updated_at ?? item.created_at)}
              </Text>
              <Text style={styles.refRow}>Ref: {item.reference_id}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600', flex: 1, color: '#111827' },
  metaRow: { color: '#4b5563', fontSize: 13, marginTop: 8 },
  metaLabel: { color: '#6b7280', fontWeight: '600' },
  refRow: { color: '#9ca3af', fontSize: 11, marginTop: 6 },
  emptyBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyText: { color: '#6b7280', fontSize: 14, textAlign: 'center' },
  errorBox: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: { color: '#b91c1c', fontSize: 14, marginBottom: 8 },
  retryText: { color: '#4f46e5', fontWeight: '600', fontSize: 14 },
});
