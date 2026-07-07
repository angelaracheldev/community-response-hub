import React from 'react';
import { Text, View } from 'react-native';
import { DashboardStat } from '../../utils/adminDashboard.mock';
import { statCardStyles as styles } from '../../styles/dashboard/statCard';
import { AppIcon } from '../common/AppIcon';

type Props = {
  stat: DashboardStat;
};

export function StatCard({ stat }: Props) {
  const trendColor = stat.trend?.direction === 'up' ? '#10B981' : '#EF4444';
  const trendIcon = stat.trend?.direction === 'up' ? 'trending-up' : 'trending-down';

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: stat.iconBackground }]}>
        <AppIcon name={stat.icon} size={22} color={stat.accentColor} />
      </View>
      <Text style={styles.label}>{stat.label}</Text>
      <Text style={styles.value}>{stat.value.toLocaleString()}</Text>
      {stat.trend ? (
        <View style={styles.trendRow}>
          <AppIcon name={trendIcon} size={12} color={trendColor} />
          <Text style={[styles.trend, { color: trendColor }]}>{stat.trend.label}</Text>
        </View>
      ) : null}
    </View>
  );
}


