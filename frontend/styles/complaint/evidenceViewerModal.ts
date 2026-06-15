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
  videoFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  videoFallbackTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  videoFallbackHint: {
    color: '#d1d5db',
    fontSize: 14,
    textAlign: 'center',
  },
  openLinkButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6366f1',
  },
  openLinkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
