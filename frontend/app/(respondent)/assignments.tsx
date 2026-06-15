import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import ComplaintStatusBadge from '../../components/ComplaintStatusBadge';
import { PageShell } from '../../components/common/PageShell';
import { respondentAssignmentsStyles as styles } from '../../styles/app/respondentAssignments';
import {
  ComplaintRecord,
  fetchAssignedComplaints,
  formatDate,
  formatDateTime,
  formatPriorityLevel,
} from '../../utils/complaintApi';

export default function MyAssignmentsScreen() {
  const router = useRouter();
  const scrollPaddingBottom = 32;
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
        style={styles.scroll}
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
            <TouchableOpacity
              key={item.reference_id}
              style={styles.card}
              onPress={() => router.push(`/(respondent)/complaint/${item.reference_id}`)}
              activeOpacity={0.85}
            >
              <View style={styles.row}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <ComplaintStatusBadge status={item.status} compact />
              </View>
              <Text style={styles.metaRow}>
                <Text style={styles.metaLabel}>Reference: </Text>
                {item.reference_id}
              </Text>
              {item.category_name ? (
                <Text style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Category: </Text>
                  {item.category_name}
                </Text>
              ) : null}
              {item.priority_level ? (
                <Text style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Priority: </Text>
                  {formatPriorityLevel(item.priority_level)}
                </Text>
              ) : null}
              <Text style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date Submitted: </Text>
                {formatDate(item.created_at)}
              </Text>
              <Text style={styles.metaRow}>
                <Text style={styles.metaLabel}>Last Updated: </Text>
                {formatDateTime(item.updated_at ?? item.created_at)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </PageShell>
  );
}


