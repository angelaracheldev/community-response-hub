import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatComplaintStatus } from '../utils/complaintApi';

const STATUS_STYLES: Record<string, { backgroundColor: string; color: string }> = {
  pending: { backgroundColor: '#FEF9C3', color: '#854D0E' },
  under_review: { backgroundColor: '#FEF9C3', color: '#854D0E' },
  assigned: { backgroundColor: '#DBEAFE', color: '#1E40AF' },
  in_progress: { backgroundColor: '#FFEDD5', color: '#9A3412' },
  resolved: { backgroundColor: '#D1FAE5', color: '#065F46' },
  cancelled: { backgroundColor: '#F3F4F6', color: '#4B5563' },
  rejected: { backgroundColor: '#FEE2E2', color: '#991B1B' },
};

type Props = {
  status: string;
  compact?: boolean;
};

export default function ComplaintStatusBadge({ status, compact }: Props) {
  const colors = STATUS_STYLES[status] ?? { backgroundColor: '#E5E7EB', color: '#374151' };

  return (
    <View style={[styles.badge, { backgroundColor: colors.backgroundColor }, compact && styles.compact]}>
      <Text style={[styles.text, { color: colors.color }, compact && styles.compactText]}>
        {formatComplaintStatus(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  compact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
  compactText: {
    fontSize: 11,
  },
});
