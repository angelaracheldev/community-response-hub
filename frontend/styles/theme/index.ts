export const colors = {
  primary: '#6366F1',
  primaryDark: '#4338CA',
  primaryLight: '#EEF2FF',
  accent: '#4F46E5',

  success: '#10B981',
  successLight: '#DCFCE7',
  successDark: '#166534',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#92400E',

  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  dangerDark: '#991B1B',

  info: '#3B82F6',

  white: '#FFFFFF',
  black: '#111827',

  text: {
    primary: '#111827',
    secondary: '#374151',
    muted: '#6B7280',
    placeholder: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  border: {
    default: '#E5E7EB',
    light: '#F3F4F6',
  },

  background: {
    page: '#F8FAFC',
    surface: '#FFFFFF',
    subtle: '#F9FAFB',
    muted: '#F3F4F6',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 16,
  pill: 999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 15,
  xl: 16,
  xxl: 18,
  title: 20,
} as const;

export const fontWeight = {
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;
