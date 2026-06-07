import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DashboardStat } from '../../utils/adminDashboard.mock';

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

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  trend: {
    fontSize: 12,
    fontWeight: '600',
  },
});
