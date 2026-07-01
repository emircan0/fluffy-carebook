// Fluffy Carebook Design System
// Warm light-mode base with one restrained sage accent.
import { Platform } from 'react-native';

export const colors = {
  // Background system
  background: '#FDFBF7',
  surface: '#FFFFFF',
  surfaceRaised: '#F6F2EA',
  surfaceBorder: '#E8E0D3',

  // Primary accent
  accent: '#8EA48C',
  accentDark: '#6F836E',
  accentSoft: 'rgba(142,164,140,0.16)',
  accentSofter: 'rgba(142,164,140,0.08)',

  // Text hierarchy
  textPrimary: '#252820',
  textSecondary: '#6F746A',
  textTertiary: '#A19A8D',
  textInverse: '#FFFFFF',

  // Semantic colors
  success: '#6F836E',
  successBg: 'rgba(142,164,140,0.14)',
  warning: '#A78B58',
  warningBg: 'rgba(167,139,88,0.12)',
  danger: '#B87569',
  dangerBg: 'rgba(184,117,105,0.12)',
  info: '#7C8F7A',
  infoBg: 'rgba(142,164,140,0.12)',

  // Role colors stay tonal to avoid visual noise.
  roleOwner: '#6F836E',
  roleOwnerBg: 'rgba(142,164,140,0.16)',
  roleEditor: '#7C8F7A',
  roleEditorBg: 'rgba(142,164,140,0.12)',
  roleViewer: '#8B8F82',
  roleViewerBg: 'rgba(111,116,106,0.10)',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Species palette is intentionally tonal.
  speciesDog: '#8EA48C',
  speciesCat: '#9BAD99',
  speciesBird: '#7F967D',
  speciesRabbit: '#A9B8A6',
  speciesOther: '#8B8F82',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
  pill: 9999,
} as const;

export const typography = {
  micro: 11,
  caption: 13,
  body: 15,
  bodyLg: 17,
  title: 22,
  titleLg: 26,
  hero: 34,
  display: 42,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
};

const createShadow = (
  webShadow: string,
  nativeShadow: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  },
) => (Platform.OS === 'web' ? { boxShadow: webShadow } : nativeShadow);

export const shadows = {
  sm: createShadow('0 4px 14px rgba(111, 116, 106, 0.08)', {
    shadowColor: '#6F746A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 1,
  }),
  md: createShadow('0 12px 26px rgba(111, 116, 106, 0.10)', {
    shadowColor: '#6F746A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,
    shadowRadius: 26,
    elevation: 4,
  }),
  lg: createShadow('0 18px 34px rgba(111, 116, 106, 0.14)', {
    shadowColor: '#6F746A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 34,
    elevation: 8,
  }),
  accent: createShadow('0 10px 22px rgba(142, 164, 140, 0.18)', {
    shadowColor: '#8EA48C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 5,
  }),
} as const;

export const layout = {
  screenPadding: 20,
  maxWidth: 760,
  formWidth: 440,
  tabBarHeight: 76,
  tabBarBottom: 24,
} as const;

// Species config: emoji + tonal tint.
export const speciesConfig = {
  cat:    { emoji: '🐱', color: colors.speciesCat },
  dog:    { emoji: '🐶', color: colors.speciesDog },
  bird:   { emoji: '🐦', color: colors.speciesBird },
  rabbit: { emoji: '🐰', color: colors.speciesRabbit },
  other:  { emoji: '🐾', color: colors.speciesOther },
} as const;

// Backward-compat alias used in many screens
export const petSpeciesEmoji = {
  cat: '🐱',
  dog: '🐶',
  bird: '🐦',
  rabbit: '🐰',
  other: '🐾',
} as const;

export const careEventEmoji = {
  food:     '🍽️',
  water:    '💧',
  medicine: '💊',
  litter:   '✨',
  walk:     '🦮',
  bath:     '🛁',
  grooming: '✂️',
  play:     '🎾',
  training: '🎯',
  teeth:    '🪥',
  other:    '🐾',
} as const;

export const careEventColors = {
  food:     '#8EA48C',
  water:    '#8EA48C',
  medicine: '#8EA48C',
  litter:   '#8EA48C',
  walk:     '#8EA48C',
  bath:     '#8EA48C',
  grooming: '#8EA48C',
  play:     '#8EA48C',
  training: '#8EA48C',
  teeth:    '#8EA48C',
  other:    '#8EA48C',
} as const;
