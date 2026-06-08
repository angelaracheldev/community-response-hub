import { StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../theme';

export const adminListStyles = StyleSheet.create({
  toolbar: {
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  toolbarDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    color: colors.text.primary,
    marginBottom: spacing.sm + 2,
    marginTop: spacing.md,
  },
  tableSection: {
    flex: 1,
    minHeight: 0,
  },
  tableWrap: {
    flex: 1,
    backgroundColor: colors.background.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
  },
  searchRow: {
    gap: spacing.sm,
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
    backgroundColor: colors.background.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    fontSize: fontSize.base,
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
    gap: spacing.sm,
  },
  btnRowCompact: {
    width: '100%',
  },
  textBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  textBtnOutline: {
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  textBtnLabel: {
    color: colors.text.inverse,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.md,
  },
  textBtnLabelOutline: {
    color: colors.primary,
  },
  linkBtn: {
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
  },
  linkBtnText: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  loader: {
    marginTop: spacing.xxl,
  },
  list: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.subtle,
    borderBottomWidth: 1,
    borderColor: colors.border.default,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.surface,
    borderBottomWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  col: {
    paddingHorizontal: spacing.sm,
    fontSize: fontSize.base,
    lineHeight: 20,
    color: colors.text.secondary,
  },
  colHeader: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text.muted,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  actionBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
  },
  actionBtnSuccess: {
    backgroundColor: colors.success,
  },
  actionBtnText: {
    color: colors.text.inverse,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
  },
  cardListContent: {
    paddingBottom: spacing.xs,
  },
  emptyBox: {
    padding: spacing.xxl + spacing.sm,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text.muted,
    textAlign: 'center',
  },
  filtersStack: {
    gap: spacing.sm,
  },
  filterInput: {
    width: '100%',
    backgroundColor: colors.background.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    fontSize: fontSize.base,
  },
  loadBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  loadBtnCompact: {
    width: '100%',
  },
  loadBtnText: {
    color: colors.text.inverse,
    fontWeight: fontWeight.bold,
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sortText: {
    fontWeight: fontWeight.bold,
    color: colors.text.secondary,
  },
  countText: {
    color: colors.text.muted,
    fontWeight: fontWeight.semibold,
  },
  modalSafe: {
    flex: 1,
    backgroundColor: colors.background.page,
  },
  modalHeader: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  modalTitle: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.extrabold,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: spacing.lg,
  },
  detail: {
    marginBottom: spacing.sm,
    color: colors.text.secondary,
    fontSize: fontSize.base,
  },
  detailLabel: {
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  closeBtn: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.background.surface,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  closeText: {
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  confirmOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.overlay,
  },
  confirmBox: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: colors.background.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  confirmTitle: {
    fontWeight: fontWeight.extrabold,
    marginBottom: spacing.sm,
    fontSize: fontSize.xl,
  },
  confirmMessage: {
    marginBottom: spacing.lg,
    color: colors.text.secondary,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.lg,
  },
  confirmCancelText: {
    color: colors.text.secondary,
  },
  confirmOkText: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  verifyBtn: {
    padding: spacing.md,
    backgroundColor: colors.success,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  verifyText: {
    color: colors.text.inverse,
    fontWeight: fontWeight.extrabold,
  },
});
