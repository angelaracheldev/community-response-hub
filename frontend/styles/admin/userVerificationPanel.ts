import { StyleSheet } from 'react-native';

export const userVerificationPanelStyles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#92400E',
  },
  countBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 999,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  countBadgeText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  filterHint: {
    fontSize: 13,
    color: '#78716C',
  },
  emptyText: {
    color: '#78716C',
    fontSize: 14,
  },
  cardList: {
    gap: 0,
  },
  tableWrap: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderColor: '#FDE68A',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#FEF9C3',
    alignItems: 'center',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  cell: {
    paddingHorizontal: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  cellHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  colName: { flex: 2, minWidth: 130 },
  colEmail: { flex: 3, minWidth: 180 },
  colDate: { flex: 1, minWidth: 100, maxWidth: 120 },
  colType: { width: 88 },
  colActions: { width: 88, alignItems: 'flex-end' },
  viewBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  viewBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
