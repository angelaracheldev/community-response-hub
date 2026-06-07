import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatDashboardDate } from '../../utils/adminDashboard.mock';

type Props = {
  name: string;
  subtitle?: string;
};

export function WelcomeBanner({ name, subtitle = "Here's what's happening in your community today." }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={styles.greeting}>Welcome back, {name}! 👋</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.dateChip}>
        <Text style={styles.dateIcon}>📅</Text>
        <Text style={styles.dateText}>{formatDashboardDate()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  textBlock: {
    flex: 1,
    minWidth: 200,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  dateIcon: {
    fontSize: 16,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
});
