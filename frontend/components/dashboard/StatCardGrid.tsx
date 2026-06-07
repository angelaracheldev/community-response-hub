import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DashboardStat } from '../../utils/adminDashboard.mock';
import { StatCard } from './StatCard';

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

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  cell: {
    flexGrow: 1,
    minWidth: 150,
    paddingHorizontal: 6,
    marginBottom: 12,
  },
});
