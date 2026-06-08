import React, { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { adminListCardStyles as styles } from '../../styles/admin/listCard';

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


