import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ComplaintStatusBadge from '../ComplaintStatusBadge';
import ComplaintEvidenceGallery from '../ComplaintEvidenceGallery';
import ComplaintStatusTimeline from '../ComplaintStatusTimeline';
import ComplaintDetailsSection from './ComplaintDetailsSection';
import ComplaintDetailField from './ComplaintDetailField';
import { residentComplaintDetailStyles as styles } from '../../styles/app/residentComplaintDetail';
import {
  ComplaintMedia,
  ComplaintRecord,
  formatAssigneeName,
  formatDate,
  splitComplaintMedia,
} from '../../utils/complaintApi';

type Viewer = 'resident' | 'responder';

type Props = {
  complaint: ComplaintRecord;
  media: ComplaintMedia[];
  viewer: Viewer;
  scrollPaddingBottom?: number;
  onBack: () => void;
  actionSection?: React.ReactNode;
};

export default function ComplaintDetailContent({
  complaint,
  media,
  viewer,
  scrollPaddingBottom = 32,
  onBack,
  actionSection,
}: Props) {
  const { residentEvidence, resolutionEvidence } = splitComplaintMedia(
    media,
    complaint.reported_by ?? ''
  );

  const showActionsAtTop = viewer === 'responder' && actionSection;
  const showActionsAtBottom = viewer === 'resident' && actionSection;
  console.log('COMPLAINT DETAILS', complaint);
  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingBottom: scrollPaddingBottom,
        },
      ]}
    >
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.backLink}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.headerCard}>
        <Text style={styles.headline}>{complaint.title}</Text>
        <View style={styles.headerMetaRow}>
          <Text style={styles.referenceNumber}>{complaint.reference_id}</Text>
          <ComplaintStatusBadge status={complaint.status} />
        </View>
      </View>

      {showActionsAtTop ? <View style={styles.actionSectionTop}>{actionSection}</View> : null}

      <ComplaintDetailsSection complaint={complaint} viewer={viewer} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resident Evidence</Text>
        <ComplaintEvidenceGallery media={residentEvidence} emptyMessage="No evidence uploaded." />
      </View>

      {complaint.status === 'resolved' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resolution Details</Text>
          <ComplaintDetailField label="Resolved By" value={formatAssigneeName(complaint)} />
          <ComplaintDetailField
            label="Date Resolved"
            value={formatDate(complaint.updated_at ?? complaint.created_at)}
          />
          <ComplaintDetailField
            label="Resolution Remarks"
            value={complaint.remarks || 'No remarks provided.'}
            multiline
          />
          <Text style={styles.subheading}>Resolution Evidence</Text>
          <ComplaintEvidenceGallery
            media={resolutionEvidence}
            emptyMessage="No resolution evidence uploaded."
          />
        </View>
      ) : null}

      {viewer === 'resident' && complaint.status === 'rejected' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rejection Details</Text>
          <ComplaintDetailField
            label="Reason"
            value={complaint.remarks || 'No rejection reason provided.'}
            multiline
          />
          <ComplaintDetailField
            label="Date Rejected"
            value={formatDate(complaint.updated_at ?? complaint.created_at)}
          />
        </View>
      ) : null}

      {viewer === 'resident' && complaint.status === 'cancelled' && complaint.remarks ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cancellation Details</Text>
          <ComplaintDetailField label="Cancellation Reason" value={complaint.remarks} multiline />
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Complaint Timeline</Text>
      <ComplaintStatusTimeline complaint={complaint} />

      {showActionsAtBottom ? actionSection : null}
    
    </ScrollView>
  );
}
