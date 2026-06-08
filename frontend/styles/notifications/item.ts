import { StyleSheet } from 'react-native';

export const notificationItemStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  itemUnread: {
    backgroundColor: '#EFF6FF',
  },
  itemRead: {
    backgroundColor: '#FFFFFF',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconSymbol: {
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingRight: 4,
  },
  time: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    flexShrink: 0,
  },
  statusDotUnread: {
    backgroundColor: '#2563EB',
  },
  statusDotRead: {
    backgroundColor: '#D1D5DB',
  },
});
