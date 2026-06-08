import { StyleSheet } from 'react-native';

export const sideNavStyles = StyleSheet.create({
  sidebar: {
    flex: 1,
    alignSelf: 'stretch',
    width: 240,
    backgroundColor: '#0F172A',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  brandIcon: {
    fontSize: 28,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
  },
  closeIcon: {
    fontSize: 16,
    color: '#E2E8F0',
    fontWeight: '700',
  },
  nav: {
    flex: 1,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  navItemActive: {
    backgroundColor: '#6366F1',
  },
  navIcon: {
    fontSize: 16,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  navLabelActive: {
    color: '#FFFFFF',
  },
});
