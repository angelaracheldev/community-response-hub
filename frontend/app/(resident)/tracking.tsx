import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge';
import {
  fetchMyComplaints,
  formatAssigneeName,
  formatDate,
  formatDateTime,
  ComplaintRecord,
} from '../../utils/complaintApi';
import { getContentMaxWidth, getScrollBottomPadding } from '../../utils/responsiveLayout';

export default function TrackingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const contentMaxWidth = getContentMaxWidth(width);
  const scrollPaddingBottom = getScrollBottomPadding(width);
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { maxWidth: contentMaxWidth, paddingBottom: scrollPaddingBottom },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadComplaints(true)} />
        }
      >
        <Text style={styles.title}>My Complaints</Text>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: {
    width: '100%',
    alignSelf: 'center',
    padding: 24,
  },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 20, color: '#111827' },
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
