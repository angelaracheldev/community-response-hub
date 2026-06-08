import { StyleSheet } from 'react-native';

export const residentTrackingStyles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600', flex: 1, color: '#111827' },
  metaRow: { color: '#4b5563', fontSize: 13, marginTop: 8 },
  metaLabel: { color: '#6b7280', fontWeight: '600' },
  refRow: { color: '#9ca3af', fontSize: 11, marginTop: 6 },
  emptyBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyText: { color: '#6b7280', fontSize: 14, textAlign: 'center' },
  errorBox: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: { color: '#b91c1c', fontSize: 14, marginBottom: 8 },
  retryText: { color: '#4f46e5', fontWeight: '600', fontSize: 14 },
});
