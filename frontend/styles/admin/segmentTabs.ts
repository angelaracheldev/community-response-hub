import { StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../theme';

export const adminSegmentTabsStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rowCompact: {
    flexWrap: 'nowrap',
  },
  tab: {
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  tabCompact: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.text.secondary,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.md,
  },
  tabTextActive: {
    color: colors.text.inverse,
  },
});
