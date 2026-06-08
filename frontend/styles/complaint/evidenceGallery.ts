import { StyleSheet } from 'react-native';

export const complaintEvidenceGalleryStyles = StyleSheet.create({
  row: {
    gap: 10,
    paddingVertical: 4,
  },
  item: {
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoIcon: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 4,
  },
  videoLabel: {
    color: '#d1d5db',
    fontSize: 11,
    fontWeight: '600',
  },
  empty: {
    color: '#6b7280',
    fontSize: 14,
  },
});
