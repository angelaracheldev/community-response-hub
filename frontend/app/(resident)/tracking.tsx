import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { fetchMyComplaints, formatComplaintStatus, ComplaintRecord } from '../../utils/complaintApi';

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TrackingScreen() {
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
        contentContainerStyle={styles.container}
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
            <View key={item.complaint_id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{formatComplaintStatus(item.status)}</Text>
                </View>
              </View>
              {item.category_name ? (
                <Text style={styles.category}>{item.category_name}</Text>
              ) : null}
              <Text style={styles.meta}>Logged: {formatDate(item.created_at)}</Text>
              <Text style={styles.complaintId} numberOfLines={1}>
                Ref: {item.reference_id}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { width: '100%', maxWidth: 450, alignSelf: 'center', padding: 24, paddingBottom: 40 },
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
  category: { fontSize: 13, color: '#6b7280', marginTop: 6 },
  badge: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, color: '#1e40af', fontWeight: '700' },
  meta: { color: '#6b7280', fontSize: 12, marginTop: 8 },
  complaintId: { color: '#9ca3af', fontSize: 11, marginTop: 4 },
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
