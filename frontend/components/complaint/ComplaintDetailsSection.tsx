import React from 'react';
import { Text, View } from 'react-native';
import ComplaintDetailField from './ComplaintDetailField';
import { residentComplaintDetailStyles as styles } from '../../styles/app/residentComplaintDetail';
import {
  ComplaintRecord,
  formatAssigneeName,
  formatDate,
  formatDateTime,
  formatPriorityLevel,
} from '../../utils/complaintApi';

type Viewer = 'resident' | 'responder';

type Props = {
  complaint: ComplaintRecord;
  viewer: Viewer;
};

export default function ComplaintDetailsSection({ complaint, viewer }: Props) {
  const gridFields = [
    { label: 'Category', value: complaint.category_name ?? '-' },
    { label: 'Location', value: complaint.location_text || '-' },
    ...(complaint.priority_level
      ? [{ label: 'Priority', value: formatPriorityLevel(complaint.priority_level) }]
      : []),
    { label: 'Date Submitted', value: formatDate(complaint.created_at) },
    {
      label: 'Last Updated',
      value: formatDateTime(complaint.updated_at ?? complaint.created_at),
    },
    ...(viewer === 'resident'
      ? [{ label: 'Assigned Responder', value: formatAssigneeName(complaint) }]
      : []),
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Complaint Information</Text>

      <ComplaintDetailField
        label="Description"
        value={complaint.description}
        multiline
        containerStyle={styles.detailFullWidth}
      />

      <View style={styles.detailGrid}>
        {gridFields.map((field) => (
          <ComplaintDetailField
            key={field.label}
            label={field.label}
            value={field.value}
            containerStyle={styles.detailGridItem}
          />
        ))}
      </View>
    </View>
  );
}
