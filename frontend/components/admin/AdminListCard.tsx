import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type AdminListCardField = {
  label: string;
  value: string;
};

type Props = {
  title: string;
  subtitle?: string;
  fields: AdminListCardField[];
  actions?: ReactNode;
};

export function AdminListCard({ title, subtitle, fields, actions }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.fields}>
        {fields.map((field) => (
          <View key={field.label} style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <Text style={styles.fieldValue} numberOfLines={3}>
              {field.value}
            </Text>
          </View>
        ))}
      </View>

      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  fields: {
    gap: 8,
    marginBottom: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fieldLabel: {
    width: 88,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  fieldValue: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});
