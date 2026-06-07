import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TrendPoint } from '../../utils/adminDashboard.mock';

type Props = {
  title: string;
  points: TrendPoint[];
  filterLabel?: string;
};

export function TrendChartCard({ title, points, filterLabel = 'This Month' }: Props) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.filterChip}>
          <Text style={styles.filterText}>{filterLabel}</Text>
        </View>
      </View>

      <View style={styles.chartArea}>
        {points.map((point) => {
          const heightPct = (point.value / maxValue) * 100;
          return (
            <View key={point.label} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: `${heightPct}%` as `${number}%` }]} />
              </View>
              <Text style={styles.barLabel} numberOfLines={1}>
                {point.label.replace('May ', '')}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 280,
    minWidth: 280,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  filterChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  chartArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    minHeight: 180,
    paddingTop: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    width: '100%',
    maxWidth: 28,
    height: 140,
    justifyContent: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 6,
    minHeight: 8,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
});
