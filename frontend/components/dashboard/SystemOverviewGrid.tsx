import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SystemMetric } from '../../utils/adminDashboard.mock';

type Props = {
  title?: string;
  metrics: SystemMetric[];
  columns?: number;
};

export function SystemOverviewGrid({ title = 'System Overview', metrics, columns = 2 }: Props) {
  const basis = columns === 4 ? '23%' : '48%';

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.grid}>
        {metrics.map((metric) => (
          <View key={metric.label} style={[styles.cell, { flexBasis: basis }]}>
            <View style={styles.card}>
              <Text style={styles.icon}>{metric.icon}</Text>
              <Text style={styles.value}>{metric.value.toLocaleString()}</Text>
              <Text style={styles.label}>{metric.label}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  cell: {
    flexGrow: 1,
    minWidth: 140,
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  icon: {
    fontSize: 18,
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
  },
});
