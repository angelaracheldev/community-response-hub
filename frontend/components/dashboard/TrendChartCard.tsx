import React from 'react';
import { Text, View } from 'react-native';
import { TrendPoint } from '../../utils/adminDashboard.mock';
import { trendChartCardStyles as styles } from '../../styles/dashboard/trendChartCard';

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


