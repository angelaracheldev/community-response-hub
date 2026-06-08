import { StyleSheet } from 'react-native';

export const complaintStatusTimelineStyles = StyleSheet.create({
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
