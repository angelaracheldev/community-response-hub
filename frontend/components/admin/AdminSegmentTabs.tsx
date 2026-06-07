import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type AdminTab = {
  id: string;
  label: string;
};

type Props = {
  tabs: AdminTab[];
  activeId: string;
  onChange: (id: string) => void;
  compact?: boolean;
};

export function AdminSegmentTabs({ tabs, activeId, onChange, compact }: Props) {
  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, compact && styles.tabCompact, isActive && styles.tabActive]}
            onPress={() => onChange(tab.id)}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]} numberOfLines={1}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rowCompact: {
    flexWrap: 'nowrap',
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tabCompact: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  tabText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#fff',
  },
});
