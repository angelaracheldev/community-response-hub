import { StyleSheet } from 'react-native';

export const residentComplaintDetailStyles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 24,
  },
  backLink: {
    color: '#4f46e5',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 16,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
  },
  headline: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  subheading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginTop: 8,
    marginBottom: 8,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    color: '#111827',
    fontSize: 14,
  },
  detailValueMultiline: {
    lineHeight: 20,
  },
  cancelSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 15,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    marginVertical: 12,
  },
  retryText: {
    color: '#4f46e5',
    fontWeight: '600',
    fontSize: 14,
  },
});
