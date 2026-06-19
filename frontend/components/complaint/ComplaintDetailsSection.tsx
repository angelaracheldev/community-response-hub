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
  const safeComplaint = sanitizeComplaintForViewer(complaint, viewer);
  const gridFields = [
    { label: 'Category', value: safeComplaint.category_name ?? '-' },
    { label: 'Location', value: safeComplaint.location_text || '-' },
    ...(safeComplaint.priority_level
      ? [{ label: 'Priority', value: formatPriorityLevel(safeComplaint.priority_level) }]
      : []),
    { label: 'Date Submitted', value: formatDate(safeComplaint.created_at) },
    {
      label: 'Last Updated',
      value: formatDateTime(safeComplaint.updated_at ?? safeComplaint.created_at),
    },
    ...(viewer === 'resident'
      ? [{ label: 'Assigned Responder', value: formatAssigneeName(safeComplaint) }]
      : []),
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Complaint Information</Text>

      <ComplaintDetailField
        label="Description"
        value={safeComplaint.description}
        multiline
        containerStyle={styles.detailFullWidth}
      />

      {viewer === 'resident' ? (
        <ComplaintDetailField
          label="Assigned By"
          value={
            safeComplaint.assigned_by_first_name
              ? `${safeComplaint.assigned_by_first_name} ${safeComplaint.assigned_by_last_name ?? ''}`
              : 'Not Assigned'
          }
        />
      ) : null}
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

function sanitizeComplaintForViewer(
  complaint: ComplaintRecord,
  viewer: Viewer
): ComplaintRecord {
  if (viewer === 'responder') {
    return {
      ...complaint,
      assigned_by_first_name: undefined,
      assigned_by_last_name: undefined,
    };
  }

  return complaint;
}


