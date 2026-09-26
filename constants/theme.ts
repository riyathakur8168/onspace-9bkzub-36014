// Cooperative Service Platform — Design System
// Physical Metaphor: Paper (matte, clean, layered cards)

export const Colors = {
  // Brand
  primary: '#1A6B5A',        // Deep teal — trust, reliability
  primaryLight: '#E8F5F1',   // Tinted surface
  primaryDark: '#134E41',    // Pressed state
  accent: '#F59E0B',         // Amber — earnings, CTAs
  accentLight: '#FEF3C7',
  accentDark: '#D97706',

  // Backgrounds
  background: '#F6F8F7',     // Tinted surface — not plain white
  surface: '#FFFFFF',
  surfaceTinted: '#EEF5F2',  // Subtle brand tint for hero areas
  surfaceElevated: '#FFFFFF',

  // Text
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  textAccent: '#F59E0B',
  textPrimary_brand: '#1A6B5A',

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Borders
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',
  divider: '#F3F4F6',

  // Role colors
  customerColor: '#3B82F6',
  workerColor: '#1A6B5A',
  adminColor: '#7C3AED',

  // Status
  statusPending: '#F59E0B',
  statusActive: '#10B981',
  statusCompleted: '#6B7280',
  statusCancelled: '#EF4444',
  statusMatching: '#3B82F6',
};

export const Typography = {
  // Families
  fontRegular: undefined,   // System default (Inter-like on most devices)
  fontMedium: undefined,
  fontSemiBold: undefined,
  fontBold: undefined,

  // Scale (1.25 ratio from 16)
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,

  // Line heights
  lineHeightTight: 1.25,
  lineHeightBase: 1.5,
  lineHeightRelaxed: 1.625,

  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
  },
};
