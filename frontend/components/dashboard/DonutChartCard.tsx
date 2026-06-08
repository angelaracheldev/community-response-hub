import React from 'react';
import { Text, View } from 'react-native';
import { ChartSegment, getStatusBreakdownTotal } from '../../utils/adminDashboard.mock';
import { donutChartCardStyles as styles } from '../../styles/dashboard/donutChartCard';

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


