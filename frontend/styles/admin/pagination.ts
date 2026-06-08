import { StyleSheet } from 'react-native';

export const adminPaginationStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#6366F1',
    borderRadius: 8,
    minWidth: 72,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.45 },
  btnText: { color: '#fff', fontWeight: '700' },
  pageText: { fontWeight: '700', minWidth: 64, textAlign: 'center' },
});
