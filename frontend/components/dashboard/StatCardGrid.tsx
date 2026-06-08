import React from 'react';
import { View } from 'react-native';
import { DashboardStat } from '../../utils/adminDashboard.mock';
import { StatCard } from './StatCard';
import { statCardGridStyles as styles } from '../../styles/dashboard/statCardGrid';

type Props = {
  stats: DashboardStat[];
  columns: number;
};

export function StatCardGrid({ stats, columns }: Props) {
  const basis = columns === 4 ? '23%' : columns === 2 ? '48%' : '100%';

  return (
    <View style={styles.grid}>
      {stats.map((stat) => (
        <View key={stat.id} style={[styles.cell, { flexBasis: basis }]}>
          <StatCard stat={stat} />
        </View>
      ))}
    </View>
  );
}


