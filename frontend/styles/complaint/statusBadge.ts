import { StyleSheet } from 'react-native';

export const complaintStatusBadgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  compact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
  compactText: {
    fontSize: 11,
  },
});
