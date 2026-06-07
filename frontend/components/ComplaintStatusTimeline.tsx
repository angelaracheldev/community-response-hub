import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ComplaintRecord } from '../utils/complaintApi';

type TimelineStep = {
  label: string;
};

function buildTimelineSteps(complaint: ComplaintRecord): TimelineStep[] {
  const steps: TimelineStep[] = [{ label: 'Complaint Submitted' }];

  if (complaint.status === 'rejected') {
    steps.push({ label: 'Complaint Rejected' });
    return steps;
  }

  const wasAssigned =
    complaint.assigned_to ||
    ['assigned', 'in_progress', 'resolved', 'cancelled'].includes(complaint.status);

  if (wasAssigned) {
    steps.push({ label: 'Assigned to Responder' });
  }

  if (['in_progress', 'resolved'].includes(complaint.status)) {
    steps.push({ label: 'Work Started' });
  }

  if (complaint.status === 'resolved') {
    steps.push({ label: 'Complaint Resolved' });
  } else if (complaint.status === 'cancelled') {
    steps.push({ label: 'Complaint Cancelled by Resident' });
  }

  return steps;
}

type Props = {
  complaint: ComplaintRecord;
};

export default function ComplaintStatusTimeline({ complaint }: Props) {
  const steps = buildTimelineSteps(complaint);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View key={step.label} style={styles.item}>
          <View style={styles.markerColumn}>
            <View style={styles.dot}>
              <Text style={styles.check}>✓</Text>
            </View>
            {index < steps.length - 1 ? <View style={styles.line} /> : null}
          </View>
          <Text style={styles.label}>{step.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  markerColumn: {
    alignItems: 'center',
    marginRight: 14,
    width: 24,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 20,
    backgroundColor: '#e5e7eb',
    marginTop: 4,
  },
  label: {
    flex: 1,
    color: '#111827',
    fontWeight: '600',
    fontSize: 14,
    paddingTop: 2,
  },
});
