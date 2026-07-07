import React from 'react';
import { Text, View } from 'react-native';
import { SystemMetric } from '../../utils/adminDashboard.mock';
import { systemOverviewGridStyles as styles } from '../../styles/dashboard/systemOverviewGrid';
import { AppIcon } from '../common/AppIcon';

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
              <AppIcon name={metric.icon} size={22} color={metric.accentColor} />
              <Text style={styles.value}>{metric.value.toLocaleString()}</Text>
              <Text style={styles.label}>{metric.label}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}


