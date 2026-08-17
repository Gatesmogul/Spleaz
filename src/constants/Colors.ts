// ==========================================
// Spleaz Theme Colors
// Single source of truth for the application
// ==========================================

/**
 * Brand palette
 */
const brandDarkBrown = '#542a11';
const brandOrange = '#f8bf3e';

// ==========================================
// 1. BRAND PALETTE
// ==========================================

export const Palette = {
  // Core Brand
  primary: brandDarkBrown,
  primaryLight: '#6d3817',
  primaryDark: '#3b1d0b',

  secondary: brandOrange,
  secondaryLight: '#fad372',
  secondaryDark: '#e0a31b',

  // Light Mode
  white: '#FFFFFF',
  backgroundLight: '#FDFBF9',
  surfaceLight: '#FFFFFF',
  cardLight: '#FFFFFF',
  borderLight: '#E8E2DC',

  // Dark Mode
  black: '#000000',
  backgroundDark: '#17120E',
  surfaceDark: '#241A14',
  cardDark: '#2E221A',
  borderDark: '#423226',

  // Text
  textDark: '#2A170C',
  textMutedLight: '#7A6B62',
  textLight: '#FBF8F5',
  textMutedDark: '#A8998F',

  // Status
  success: '#10B981',
  successBackground: '#DCFCE7',
  successText: '#15803D',

  error: '#EF4444',
  errorBackground: '#FEE2E2',
  errorText: '#B91C1C',

  warning: '#F59E0B',
  warningBackground: '#FEF3C7',
  warningText: '#B45309',

  info: '#3B82F6',
  infoBackground: '#DBEAFE',
  infoText: '#1D4ED8',

  // Overlay
  overlay: 'rgba(84, 42, 17, 0.4)',
  transparent: 'transparent',
} as const;

// ==========================================
// 2. SHARED THEME TYPE
// ==========================================

/**
 * Shared structure used by BOTH light and dark themes.
 *
 * Do NOT use:
 *
 * type ThemeColors = typeof Colors.light
 *
 * because that makes TypeScript infer the exact
 * literal values from the light theme and prevents
 * the dark theme from being assignable to it.
 */
export interface ThemeColors {
  // Brand
  primary: string;
  secondary: string;
  accent: string;

  // Backgrounds / surfaces
  background: string;
  surface: string;
  card: string;
  border: string;

  // Typography
  text: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textLight: string;

  // Tint
  tint: string;

  // Primary button
  buttonPrimaryBg: string;
  buttonPrimaryText: string;

  // Secondary button
  buttonSecondaryBg: string;
  buttonSecondaryText: string;

  // Status
  success: string;
  error: string;
  warning: string;
  info: string;

  // Status backgrounds
  successBackground: string;
  errorBackground: string;
  warningBackground: string;
  infoBackground: string;

  // Status text
  successText: string;
  errorText: string;
  warningText: string;
  infoText: string;

  // Disabled
  disabled: string;
  disabledText: string;

  // Effects
  overlay: string;
  shadow: string;

  // Transparency
  transparent: string;
}

// ==========================================
// 3. LIGHT THEME
// ==========================================

const lightTheme: ThemeColors = {
  // Brand
  primary: Palette.primary,
  secondary: Palette.secondary,
  accent: Palette.secondaryDark,

  // Backgrounds / surfaces
  background: Palette.backgroundLight,
  surface: Palette.surfaceLight,
  card: Palette.cardLight,
  border: Palette.borderLight,

  // Typography
  text: Palette.textDark,
  textPrimary: Palette.textDark,
  textSecondary: Palette.textMutedLight,
  textMuted: Palette.textMutedLight,
  textLight: Palette.textLight,

  // Tint
  tint: Palette.primary,

  // Primary button
  buttonPrimaryBg: Palette.primary,
  buttonPrimaryText: Palette.white,

  // Secondary button
  buttonSecondaryBg: Palette.secondary,
  buttonSecondaryText: Palette.textDark,

  // Status
  success: Palette.success,
  error: Palette.error,
  warning: Palette.warning,
  info: Palette.info,

  // Status backgrounds
  successBackground: Palette.successBackground,
  errorBackground: Palette.errorBackground,
  warningBackground: Palette.warningBackground,
  infoBackground: Palette.infoBackground,

  // Status text
  successText: Palette.successText,
  errorText: Palette.errorText,
  warningText: Palette.warningText,
  infoText: Palette.infoText,

  // Disabled
  disabled: '#D6D0CB',
  disabledText: '#9A918A',

  // Effects
  overlay: Palette.overlay,
  shadow: 'rgba(42, 23, 12, 0.15)',

  // Transparency
  transparent: Palette.transparent,
};

// ==========================================
// 4. DARK THEME
// ==========================================

const darkTheme: ThemeColors = {
  // Brand
  primary: Palette.secondary,
  secondary: Palette.primary,
  accent: Palette.secondaryLight,

  // Backgrounds / surfaces
  background: Palette.backgroundDark,
  surface: Palette.surfaceDark,
  card: Palette.cardDark,
  border: Palette.borderDark,

  // Typography
  text: Palette.textLight,
  textPrimary: Palette.textLight,
  textSecondary: Palette.textMutedDark,
  textMuted: Palette.textMutedDark,
  textLight: Palette.textLight,

  // Tint
  tint: Palette.secondary,

  // Primary button
  buttonPrimaryBg: Palette.secondary,
  buttonPrimaryText: Palette.textDark,

  // Secondary button
  buttonSecondaryBg: Palette.surfaceDark,
  buttonSecondaryText: Palette.textLight,

  // Status
  success: Palette.success,
  error: Palette.error,
  warning: Palette.warning,
  info: Palette.info,

  // Status backgrounds
  successBackground: '#123D2B',
  errorBackground: '#451A1A',
  warningBackground: '#422F0A',
  infoBackground: '#172E4D',

  // Status text
  successText: '#6EE7B7',
  errorText: '#FCA5A5',
  warningText: '#FCD34D',
  infoText: '#93C5FD',

  // Disabled
  disabled: '#493B32',
  disabledText: '#8B7D73',

  // Effects
  overlay: 'rgba(0, 0, 0, 0.55)',
  shadow: 'rgba(0, 0, 0, 0.40)',

  // Transparency
  transparent: Palette.transparent,
};

// ==========================================
// 5. EXPORTED THEMES
// ==========================================

export const Colors: {
  readonly light: ThemeColors;
  readonly dark: ThemeColors;
} = {
  light: lightTheme,
  dark: darkTheme,
};

// ==========================================
// 6. DEFAULT EXPORT
// ==========================================

export default Colors;