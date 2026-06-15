import { StyleSheet } from 'react-native';

export const evidenceViewerModalStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    padding: 16,
  },
  closeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  media: {
    width: '100%',
    flex: 1,
    minHeight: 240,
  },
});
