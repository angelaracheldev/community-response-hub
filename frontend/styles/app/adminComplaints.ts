import { StyleSheet } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

export const adminComplaintsStyles = StyleSheet.create({
  colId: { width: 152, flexShrink: 0, paddingHorizontal: 6 },
  colIdText: { fontSize: fontSize.xs, lineHeight: 16 },
  colTitle: { flex: 1, minWidth: 96, flexShrink: 1 },
  colCat: { width: 156, flexShrink: 0 },
  colCatText: { fontSize: fontSize.xs },
  colStatus: { width: 100, flexShrink: 0 },
  colSmall: { width: 64, flexShrink: 0 },
  colAssigned: { width: 108, flexShrink: 0 },
  colActions: { width: 72, flexShrink: 0 },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 8,
    overflow: 'visible',
    zIndex: 20,
  },
  filterSelect: {
    flex: 1,
    minWidth: 140,
    maxWidth: 200,
  },
  controlsSection: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
    flexShrink: 0,
    zIndex: 20,
    overflow: 'visible',
  },
  filterSelectCompact: {
    width: '100%',
  },
  searchField: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchFieldDesktop: {
    flex: 1,
    minWidth: 160,
  },
  searchFieldCompact: {
    width: '100%',
  },
  searchInputInField: {
    width: '100%',
  },
  searchInputWithClear: {
    paddingRight: 36,
  },
  searchClearBtn: {
    position: 'absolute',
    right: 10,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.background.muted,
  },
  searchClearText: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    fontWeight: '700',
    lineHeight: 16,
  },
  filterSelectWrap: {
    position: 'relative',
  },
  filterSelectWrapInline: {
    overflow: 'hidden',
  },
  filterSelectWrapOpen: {
    zIndex: 1000,
    overflow: 'visible',
  },
  filterSelectTrigger: {
    minHeight: 40,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  filterSelectOptionsPanel: {
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    backgroundColor: colors.background.surface,
    overflow: 'hidden',
  },
  filterSelectOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    backgroundColor: colors.background.surface,
    maxHeight: 240,
    overflow: 'hidden',
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  filterSelectScroll: {
    flexGrow: 0,
  },
  filterSelectOptionsInline: {
    position: 'relative',
    marginTop: 0,
    maxHeight: undefined,
    shadowOpacity: 0,
    elevation: 0,
    zIndex: 1,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
  },
  filterSelectScrollInline: {
    maxHeight: 260,
  },
  filterSelectOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterSelectOptionLast: {
    borderBottomWidth: 0,
  },
  tableSectionRaised: {
    zIndex: 1,
  },
  addComplaintBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md + 2,
  },
  addComplaintBtnText: {
    color: colors.text.inverse,
    fontWeight: '700',
    fontSize: fontSize.base,
  },
});
