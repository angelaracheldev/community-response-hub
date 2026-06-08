import React from 'react';
import { Text, View } from 'react-native';
import { formatDashboardDate } from '../../utils/adminDashboard.mock';
import { welcomeBannerStyles as styles } from '../../styles/dashboard/welcomeBanner';

type Props = {
  name: string;
  subtitle?: string;
};

export function WelcomeBanner({ name, subtitle = "Here's what's happening in your community today." }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={styles.greeting}>Welcome back, {name}! 👋</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.dateChip}>
        <Text style={styles.dateIcon}>📅</Text>
        <Text style={styles.dateText}>{formatDashboardDate()}</Text>
      </View>
    </View>
  );
}


