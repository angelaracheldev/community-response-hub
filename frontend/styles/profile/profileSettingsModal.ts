//  Filepath = frontend\styles\profile\profileSettingsModal.ts
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
} from '../theme';


export const profileSettingsModalStyles = StyleSheet.create({

    backButton: {
  marginRight: 12,
  alignSelf: 'flex-start',
},

backButtonText: {
  fontSize: 22,
  fontWeight: '700',
  color: colors.text.primary,
},

headerLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
},
headerText: {
    marginLeft: 16,
    flex: 1,
},
  /* -------------------------------------------------------------------------- */
  /* Overlay                                                                     */
  /* -------------------------------------------------------------------------- */

  backdrop: {
    flex: 1,
    backgroundColor: colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },

  /* -------------------------------------------------------------------------- */
  /* Desktop Dialog                                                              */
  /* -------------------------------------------------------------------------- */

//   dialog: {
//     width: '100%',
//     maxWidth: 760,
//     backgroundColor: colors.white,
//     borderRadius: radius.xxl,
//     overflow: 'hidden',
//   },
dialog: {
  width: 760,
  maxWidth: '100%',
  maxHeight: '92%',
  backgroundColor: '#fff',
  borderRadius: 18,
},

scroll: {
  flex: 1,
},

scrollContent: {
  paddingHorizontal: 24,
  paddingBottom: 24,
},


  /* -------------------------------------------------------------------------- */
  /* Mobile Dialog                                                               */ 

  /* -------------------------------------------------------------------------- */
  /* Header                                                                      */
  /* -------------------------------------------------------------------------- */

  header: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

 
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'left',
},


  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'left',
},

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: colors.background.muted,
  },

  closeText: {
    fontSize: 18,
    color: colors.text.primary,
    fontWeight: '700',
  },

  /* -------------------------------------------------------------------------- */
  /* Body                                                                        */
  /* -------------------------------------------------------------------------- */

  body: {
    padding: spacing.xxl,
  },

  card: {
    backgroundColor: colors.background.subtle,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },

  detailGrid: {
    gap: spacing.md,
  },

  /* -------------------------------------------------------------------------- */
  /* Role Badge                                                                  */
  /* -------------------------------------------------------------------------- */

  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,

    paddingHorizontal: spacing.md,
    paddingVertical: 6,

    borderRadius: 999,

    backgroundColor: colors.primaryLight,
  },

  badgeText: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: fontSize.sm,
    textTransform: 'capitalize',
  },

  /* -------------------------------------------------------------------------- */
  /* Action Section                                                              */
  /* -------------------------------------------------------------------------- */

  actionCard: {
    backgroundColor: colors.background.subtle,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
  },

  actionRow: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },

  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  actionIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },

  actionTitle: {
    fontSize: fontSize.xl,
    color: colors.text.primary,
    fontWeight: '600',
  },

  actionSubtitle: {
    marginTop: 2,
    color: colors.text.muted,
    fontSize: fontSize.sm,
  },

  chevron: {
    fontSize: 20,
    color: colors.text.placeholder,
  },

  /* -------------------------------------------------------------------------- */
  /* Footer                                                                      */
  /* -------------------------------------------------------------------------- */

  footer: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },

  closeFooterButton: {
    backgroundColor: colors.background.muted,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },

  closeFooterText: {
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: fontSize.base,
  },

  /* -------------------------------------------------------------------------- */
  /* Loading                                                                     */
  /* -------------------------------------------------------------------------- */

  loading: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* -------------------------------------------------------------------------- */
  /* Mobile                                                                      */
  /* -------------------------------------------------------------------------- */

  mobileScreen: {
    flex: 1,
    backgroundColor: colors.white,
  },

  mobileHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,

    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  mobileBody: {
    flex: 1,
    padding: spacing.lg,
  },

  mobileTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },

  mobileCard: {
    marginBottom: spacing.lg,
  },

  /* -------------------------------------------------------------------------- */
/* Detail Fields                                                              */
/* -------------------------------------------------------------------------- */

detailField: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',

  paddingVertical: spacing.md,

  borderBottomWidth: 1,
  borderBottomColor: colors.border.light,
},

detailLabel: {
  width: 110,

  color: colors.text.muted,

  fontSize: fontSize.base,

  fontWeight: '600',
},

detailValue: {
  flex: 1,

  textAlign: 'right',

  color: colors.text.primary,

  fontSize: fontSize.base,

  fontWeight: '600',
},
});