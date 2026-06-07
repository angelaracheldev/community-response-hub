import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ComplaintStatusBadge from '../ComplaintStatusBadge';
import { RecentComplaintItem } from '../../utils/adminDashboard.mock';

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

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  ref: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});
