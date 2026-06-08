import { StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../theme';

export const adminUsersStyles = StyleSheet.create({
  colCode: { flex: 1, minWidth: 96, maxWidth: 120 },
  colName: { flex: 2, minWidth: 130 },
  colEmail: { flex: 3, minWidth: 180 },
  colPhone: { flex: 2, minWidth: 120 },
  colSmall: { width: 72, textAlign: 'center' },
  colActions: { width: 88, textAlign: 'center' },
  colActionsCell: { width: 88, alignItems: 'flex-end' },
  addUserBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md + 2,
  },
  addUserBtnText: {
    color: colors.text.inverse,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
  },
});
