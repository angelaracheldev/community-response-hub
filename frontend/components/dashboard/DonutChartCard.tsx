import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChartSegment, getStatusBreakdownTotal } from '../../utils/adminDashboard.mock';

type Props = {
  title: string;
  segments: ChartSegment[];
  filterLabel?: string;
};

export function DonutChartCard({ title, segments, filterLabel = 'This Month' }: Props) {
  const total = getStatusBreakdownTotal(segments);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.filterChip}>
          <Text style={styles.filterText}>{filterLabel}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.donutWrap}>
          <View style={styles.donutOuter}>
            <View style={styles.donutRing} />
            <View style={styles.donutCenter}>
              <Text style={styles.donutTotal}>{total}</Text>
              <Text style={styles.donutLabel}>Total</Text>
            </View>
          </View>
          <View style={styles.segmentBar}>
            {segments.map((segment) => (
              <View
                key={segment.label}
                style={[styles.segmentSlice, { flex: segment.value, backgroundColor: segment.color }]}
              />
            ))}
          </View>
        </View>

        <View style={styles.legend}>
          {segments.map((segment) => {
            const pct = total > 0 ? Math.round((segment.value / total) * 100) : 0;
            return (
              <View key={segment.label} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
                <Text style={styles.legendLabel}>{segment.label}</Text>
                <Text style={styles.legendValue}>
                  {segment.value} ({pct}%)
                </Text>
              </View>
            );
          })}
        </View>
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
  body: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 20,
  },
  donutWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
  },
  donutOuter: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  donutRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 18,
    borderColor: '#6366F1',
    opacity: 0.25,
  },
  segmentBar: {
    flexDirection: 'row',
    width: 140,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  segmentSlice: {
    minWidth: 4,
  },
  donutCenter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  donutTotal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  donutLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  legend: {
    flex: 1,
    minWidth: 160,
    gap: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
});
