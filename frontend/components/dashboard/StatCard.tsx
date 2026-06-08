import React from 'react';
import { Text, View } from 'react-native';
import { DashboardStat } from '../../utils/adminDashboard.mock';
import { statCardStyles as styles } from '../../styles/dashboard/statCard';

type Props = {
  stat: DashboardStat;
};

export function StatCard({ stat }: Props) {
  const trendColor = stat.trend?.direction === 'up' ? '#10B981' : '#EF4444';
  const trendArrow = stat.trend?.direction === 'up' ? '↑' : '↓';

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: stat.iconBackground }]}>
        <Text style={styles.icon}>{stat.icon}</Text>
      </View>
      <Text style={styles.label}>{stat.label}</Text>
      <Text style={styles.value}>{stat.value.toLocaleString()}</Text>
      {stat.trend ? (
        <Text style={[styles.trend, { color: trendColor }]}>
          {trendArrow} {stat.trend.label}
        </Text>
      ) : null}
    </View>
  );
}


