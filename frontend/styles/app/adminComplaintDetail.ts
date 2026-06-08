import { StyleSheet } from 'react-native';

export const adminComplaintDetailStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
  },
  backButton: {
    marginBottom: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 16,
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  complaintTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '700',
    fontSize: 12,
    overflow: 'hidden',
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailRow: {
    marginBottom: 14,
  },
  detailLabel: {
    color: '#374151',
    fontWeight: '700',
    marginBottom: 4,
  },
  detailValue: {
    color: '#4b5563',
    fontSize: 14,
  },
  detailValueMultiline: {
    lineHeight: 20,
  },
  timelineHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  timeline: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#2563EB',
    marginTop: 6,
    marginRight: 16,
    flexShrink: 0,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 12,
    width: 2,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  timelineContent: {
    flex: 1,
  },
  actionType: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  activityBy: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 6,
  },
  description: {
    color: '#4b5563',
    marginBottom: 6,
  },
  valueChange: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 24,
  },
});
