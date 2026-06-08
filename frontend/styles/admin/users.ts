import { StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../theme';

export const adminUsersStyles = StyleSheet.create({
  colName: { flex: 2, minWidth: 150 },
  colRole: { width: 100 },
  colEmail: { flex: 3, minWidth: 180 },
  colPhone: { width: 120 },
  colStatus: { width: 80, textAlign: 'center' },
  colDate: { width: 100, textAlign: 'center' },
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
