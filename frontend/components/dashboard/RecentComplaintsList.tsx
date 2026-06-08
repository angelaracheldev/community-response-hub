import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import ComplaintStatusBadge from '../ComplaintStatusBadge';
import { RecentComplaintItem } from '../../utils/adminDashboard.mock';
import { recentComplaintsListStyles as styles } from '../../styles/dashboard/recentComplaintsList';

type Props = {
  title?: string;
  items: RecentComplaintItem[];
  onViewAll?: () => void;
  onItemPress?: (item: RecentComplaintItem) => void;
};

export function RecentComplaintsList({
  title = 'Recent Complaints',
  items,
  onViewAll,
  onItemPress,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onViewAll ? (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {items.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.row, index < items.length - 1 && styles.rowBorder]}
          activeOpacity={0.85}
          onPress={() => onItemPress?.(item)}
          disabled={!onItemPress}
        >
          <View style={styles.thumb}>
            <Text style={styles.thumbEmoji}>{item.emoji}</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.ref}>#{item.referenceId}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>
          <ComplaintStatusBadge status={item.status} compact />
        </TouchableOpacity>
      ))}
    </View>
  );
}


