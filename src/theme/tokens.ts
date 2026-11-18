/**
 * XOOG design tokens — single source of truth for colour, type, shape and spacing.
 * Palette ratio: midnight 60% · graphite 20% · violet 12% · lime 6% · ember (alerts only).
 */

export const colors = {
  bg: '#0E0E14', // midnight
  surface: '#1A1A24', // graphite
  surface2: '#24242F',
  border: '#26263A',

  primary: '#6B4EFF', // violet — primary buttons, active nav, selections
  onPrimary: '#FFFFFF',

  accent: '#C8FF2E', // volt-lime — start CTAs, today, streaks, PRs, progress
  onAccent: '#0E0E14',

  ember: '#FF6B4A', // calories / warnings only

  text: '#FFFFFF',
  textMuted: '#9A9AB0',
  textLabel: '#C9C9D6',

  selectedFill: '#1E1940',
  selectedBorder: '#6B4EFF',

  overlay: 'rgba(14,14,20,0.72)',
  ring: 'rgba(107,78,255,0.10)', // faint background barbell rings
  primaryDim: 'rgba(107,78,255,0.35)',
} as const;

export const fonts = {
  heading: 'SpaceGrotesk_700Bold',
  headingMedium: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
} as const;

export const type = {
  display: { fontFamily: fonts.heading, fontSize: 44, lineHeight: 48, letterSpacing: -1.2 },
  h1: { fontFamily: fonts.heading, fontSize: 32, lineHeight: 38, letterSpacing: -0.8 },
  h2: { fontFamily: fonts.heading, fontSize: 24, lineHeight: 30, letterSpacing: -0.5 },
  h3: { fontFamily: fonts.heading, fontSize: 19, lineHeight: 24, letterSpacing: -0.3 },
  number: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 26, letterSpacing: -0.5 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
  bodyStrong: { fontFamily: fonts.bodySemibold, fontSize: 16, lineHeight: 23 },
  small: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18 },
  eyebrow: { fontFamily: fonts.bodySemibold, fontSize: 12, lineHeight: 16, letterSpacing: 1.4 },
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;

export const radius = {
  card: 24,
  cardLg: 28,
  cardSm: 20,
  input: 16,
  tile: 14,
  pill: 999,
} as const;

export const sizes = {
  buttonHeight: 58,
  touch: 44,
  navHeight: 64,
  iconStroke: 2,
} as const;

export const motion = {
  pressScale: 0.97,
  fast: 140,
  base: 240,
  slow: 420,
} as const;

/** Tailwind / NativeWind compatible theme extension mirroring the tokens above. */
export const tailwindTheme = {
  colors: {
    midnight: colors.bg,
    graphite: colors.surface,
    'graphite-2': colors.surface2,
    line: colors.border,
    violet: colors.primary,
    lime: colors.accent,
    ember: colors.ember,
    muted: colors.textMuted,
    label: colors.textLabel,
    selected: colors.selectedFill,
  },
  borderRadius: { card: '24px', input: '16px', pill: '999px' },
  spacing: { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '20px', 6: '24px', 8: '32px' },
  fontFamily: { heading: [fonts.heading], body: [fonts.body] },
} as const;

export const theme = { colors, fonts, type, space, radius, sizes, motion } as const;
export type Theme = typeof theme;
