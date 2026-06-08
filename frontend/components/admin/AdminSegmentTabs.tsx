import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { adminSegmentTabsStyles as styles } from '../../styles/admin/segmentTabs';

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


