import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { residentComplaintDetailStyles as styles } from '../../styles/app/residentComplaintDetail';

type Props = {
  label: string;
  value: string;
  multiline?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function ComplaintDetailField({ label, value, multiline, containerStyle }: Props) {
  return (
    <View style={[styles.detailRow, containerStyle]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, multiline && styles.detailValueMultiline]}>{value}</Text>
    </View>
  );
}
