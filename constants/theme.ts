export const Colors = {
  // Brand
  primary: '#0D7B6B',
  primaryLight: '#E8F5F2',
  primaryDark: '#095E52',
  accent: '#F59E0B',
  accentLight: '#FEF3C7',

  // Surfaces
  background: '#F7F9F8',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F4F3',
  border: '#E2EAE8',
  borderLight: '#EEF3F2',

  // Text
  textPrimary: '#0F2420',
  textSecondary: '#4A6B65',
  textMuted: '#8AA39E',
  textInverse: '#FFFFFF',

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Role Colors
  customerPrimary: '#0D7B6B',
  workerPrimary: '#1D4ED8',
  adminPrimary: '#7C3AED',

  // Neutrals
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Typography = {
  pageTitle: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  button: { fontSize: 15, fontWeight: '600' as const, lineHeight: 20 },
  amount: { fontSize: 24, fontWeight: '700' as const, lineHeight: 30 },
  amountSmall: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
};

export const Shadow = {
  sm: {
    shadowColor: '#0F2420',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F2420',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F2420',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
};
