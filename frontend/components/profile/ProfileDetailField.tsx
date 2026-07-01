// Filepath = frontend/styles/profile/profileSettingsModal.ts
import React from 'react';
import {
  View,
  Text,
} from 'react-native';

import { profileSettingsModalStyles as s } from '../../styles/profile/profileSettingsModal';

interface Props {
  label: string;
  value?: string | null;
  valueStyle?: object;
}

export default function ProfileDetailField({
  label,
  value,
  valueStyle,
}: Props) {
  return (
    <View style={s.detailField}>
      <Text style={s.detailLabel}>
        {label}
      </Text>

      <Text
        style={[
          s.detailValue,
          valueStyle,
        ]}
        numberOfLines={2}
      >
        {value?.trim() || '-'}
      </Text>
    </View>
  );
}