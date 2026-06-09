import { StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../theme';

export const addUserModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold as any,
    color: colors.text.primary,
  },
  closeBtn: {
    padding: spacing.sm,
  },
  closeBtnText: {
    fontSize: 24,
    color: colors.text.secondary,
  },
  scroll: {
    padding: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold as any,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.surface,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginTop: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    backgroundColor: colors.background.surface,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border.default,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.subtle,
    gap: spacing.sm,
  },
  uploadBoxError: {
    borderColor: colors.danger,
  },
  uploadTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold as any,
    color: colors.primary,
  },
  uploadSubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background.muted,
    borderRadius: radius.md,
  },
  fileName: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  removeFile: {
    color: colors.danger,
    fontWeight: fontWeight.bold as any,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  cancelBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  cancelBtnText: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    fontWeight: fontWeight.semibold as any,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    minWidth: 120,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: colors.border.default,
  },
  submitBtnText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontWeight: fontWeight.bold as any,
  },
  successBox: {
    padding: spacing.lg,
    backgroundColor: colors.successLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.success,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold as any,
    color: colors.successDark,
  },
  successMessage: {
    fontSize: fontSize.sm,
    color: colors.successDark,
    lineHeight: 18,
  },
});
