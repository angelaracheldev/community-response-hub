import { StyleSheet } from 'react-native';

export const adminListStyles = StyleSheet.create({
  toolbar: {
    marginBottom: 12,
    gap: 12,
  },
  toolbarDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  tableSection: {
    flex: 1,
    minHeight: 0,
  },
  tableWrap: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  searchRow: {
    gap: 8,
  },
  searchRowCompact: {
    flexDirection: 'column',
  },
  searchRowDesktop: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    flex: 1,
    maxWidth: 420,
    minWidth: 280,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 14,
  },
  searchInputCompact: {
    width: '100%',
  },
  searchInputDesktop: {
    flex: 1,
    minWidth: 160,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnRowCompact: {
    width: '100%',
  },
  textBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#6366F1',
    borderRadius: 10,
    alignItems: 'center',
  },
  textBtnOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textBtnLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  textBtnLabelOutline: {
    color: '#6366F1',
  },
  linkBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  linkBtnText: {
    color: '#6366F1',
    fontWeight: '700',
  },
  loader: {
    marginTop: 24,
  },
  list: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  col: {
    paddingHorizontal: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  colHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  actionBtnSuccess: {
    backgroundColor: '#10B981',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  cardListContent: {
    paddingBottom: 4,
  },
  emptyBox: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  filtersStack: {
    gap: 8,
  },
  filterInput: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 14,
  },
  loadBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#6366F1',
    borderRadius: 10,
    alignItems: 'center',
  },
  loadBtnCompact: {
    width: '100%',
  },
  loadBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortText: {
    fontWeight: '700',
    color: '#374151',
  },
  countText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  modalSafe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: 16,
  },
  detail: {
    marginBottom: 8,
    color: '#374151',
    fontSize: 14,
  },
  detailLabel: {
    fontWeight: '700',
    color: '#111827',
  },
  sectionTitle: {
    marginTop: 12,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  closeText: {
    fontWeight: '700',
    color: '#111827',
  },
  confirmOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  confirmBox: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  confirmTitle: {
    fontWeight: '800',
    marginBottom: 8,
    fontSize: 16,
  },
  confirmMessage: {
    marginBottom: 16,
    color: '#374151',
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  confirmCancelText: {
    color: '#374151',
  },
  confirmOkText: {
    color: '#6366F1',
    fontWeight: '700',
  },
  verifyBtn: {
    padding: 12,
    backgroundColor: '#10B981',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  verifyText: {
    color: '#fff',
    fontWeight: '800',
  },
});
