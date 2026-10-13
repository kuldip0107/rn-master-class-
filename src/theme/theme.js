// Single source for every screen color. Import { colors } from here.
// Do not paste hex values into screens.

export const colors = {
  brand: {
    primary: '#007AFF',
    accent: '#00C1FD',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    streak: '#FF6B3D',
    streakEnd: '#FF9A1F',
    white: '#FFFFFF',
    black: '#000000',
  },
  light: {
    background: '#FAF9FE',
    card: '#FFFFFF',
    elevated: '#F4F3F8',
    border: '#E3E2E7',
    text: '#1A1B1F',
    textSecondary: '#717786',
    textMuted: '#717786',
    chevron: '#C1C6D7',
  },
  dark: {
    background: '#050510',
    card: '#0F111A',
    elevated: '#161823',
    border: 'rgba(255, 255, 255, 0.08)',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    chevron: '#64748B',
  },
  category: {
    blue: '#007AFF',
    purple: '#8B5CF6',
    green: '#10B981',
    pink: '#EC4899',
    orange: '#F97316',
    sky: '#0EA5E9',
    indigo: '#6366F1',
    teal: '#14B8A6',
    amber: '#F59E0B',
  },
};

export const palette = {
  // Primary & Accent Tones
  primary: colors.brand.primary,
  primaryDark: '#0058BC',
  primaryContainer: colors.brand.primary,
  primaryFixed: '#D8E2FF',
  primaryFixedDim: '#ADC6FF',
  
  secondary: '#006688',
  secondaryContainer: colors.brand.accent,
  secondaryFixed: '#C2E8FF',
  secondaryFixedDim: '#75D1FF',
  
  tertiary: '#BC000A',
  tertiaryContainer: '#E2241F',
  
  // Status Colors
  success: colors.brand.success,
  successContainer: '#D1FAE5',
  error: colors.brand.error,
  errorContainer: '#FFDAD6',
  warning: colors.brand.warning,
  warningContainer: '#FEF3C7',
  info: colors.brand.info,

  // Gradients
  streakGradient: [colors.brand.streak, colors.brand.streakEnd],
  primaryGradient: [colors.brand.primary, colors.brand.accent],
  splashGradient: ['#0A0B10', '#1A1B26'],
  premiumGradient: [colors.brand.primary, colors.brand.accent],
  
  // Neutral Spectrum
  white: colors.brand.white,
  black: colors.brand.black,
  grey50: colors.light.background,
  grey100: '#F4F3F8',
  grey200: '#EEEDF3',
  grey300: '#E3E2E7',
  grey400: '#C1C6D7',
  grey500: colors.light.textSecondary,
  grey600: '#414755',
  grey700: '#2F3034',
  grey800: colors.light.text,
  grey900: colors.dark.card,
  grey950: '#0A0B10',
};

export const darkPalette = {
  background: colors.dark.background,
  surface: colors.dark.card,
  surfaceCard: colors.dark.card,
  surfaceContainerLow: colors.dark.elevated,
  surfaceContainerLowest: '#0A0B10',
  surfaceContainerHigh: '#1E202E',
  surfaceVariant: '#242738',
  textPrimary: colors.dark.text,
  textSecondary: colors.dark.textSecondary,
  textMuted: colors.dark.textMuted,
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  outline: '#64748B',
  outlineVariant: 'rgba(255, 255, 255, 0.08)',
  inputBackground: colors.dark.elevated,
};

export const lightPalette = {
  background: colors.light.background,
  surface: colors.light.background,
  surfaceCard: colors.light.card,
  surfaceContainerLow: colors.light.elevated,
  surfaceContainerLowest: colors.light.card,
  surfaceContainerHigh: '#E9E7ED',
  surfaceVariant: '#E3E2E7',
  textPrimary: colors.light.text,
  textSecondary: colors.light.textSecondary,
  textMuted: colors.light.textMuted,
  border: colors.light.border,
  borderLight: '#C1C6D7',
  outline: '#717786',
  outlineVariant: '#C1C6D7',
  inputBackground: '#F2F2F7',
};

export const theme = {
  colors: {
    primary: palette.primary,
    primaryContainer: palette.primaryContainer,
    secondary: palette.secondary,
    secondaryContainer: palette.secondaryContainer,
    tertiary: palette.tertiary,
    
    background: darkPalette.background,
    surface: darkPalette.surface,
    card: darkPalette.surfaceCard,
    surfaceLow: darkPalette.surfaceContainerLow,
    surfaceVariant: darkPalette.surfaceVariant,
    inputBg: darkPalette.inputBackground,
    
    text: {
      primary: darkPalette.textPrimary,
      secondary: darkPalette.textSecondary,
      muted: darkPalette.textMuted,
      light: palette.white,
      dark: palette.grey800,
      highlight: palette.secondaryContainer,
    },
    
    border: darkPalette.border,
    outline: darkPalette.outline,
    outlineVariant: darkPalette.outlineVariant,
    
    success: palette.success,
    error: palette.error,
    warning: palette.warning,
    info: palette.info,
    
    gradient: {
      primary: palette.primaryGradient,
      secondary: ['#006688', colors.brand.accent],
      streak: palette.streakGradient,
      premium: palette.premiumGradient,
      dark: palette.splashGradient,
      splash: palette.splashGradient,
    },
    
    palette: palette
  },
  
  spacing: {
    base: 8,
    xs: 4,
    s: 8,
    sm: 8,
    t: 12,
    m: 16,
    md: 16,
    l: 24,
    lg: 24,
    xl: 32,
    xxl: 48,
    marginHorizontal: 20,
    touchTarget: 44,
  },
  
  typography: {
    fontFamily: {
      regular: 'Inter',
      medium: 'Inter',
      bold: 'Inter',
      code: 'Courier Prime',
    },
    size: {
      headlineXl: 30,
      headlineLg: 24,
      headlineMd: 20,
      h1: 30,
      h2: 24,
      h3: 20,
      bodyLg: 17,
      bodyMd: 15,
      body: 15,
      caption: 13,
      small: 11,
      code: 14,
    },
    weight: {
      regular: '400',
      medium: '500',
      bold: '700',
      heavy: '900',
    }
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    glow: {
      shadowColor: palette.secondaryContainer,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    }
  },
  
  borderRadius: {
    xs: 4,
    s: 8,
    sm: 8,
    m: 12,
    md: 12,
    input: 12,
    button: 12,
    l: 16,
    lg: 16,
    xl: 24,
    round: 9999,
    full: 9999,
  }
};

export const darkTheme = theme;

export const lightTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: lightPalette.background,
    surface: lightPalette.surface,
    card: lightPalette.surfaceCard,
    surfaceLow: lightPalette.surfaceContainerLow,
    surfaceVariant: lightPalette.surfaceVariant,
    inputBg: lightPalette.inputBackground,
    text: {
      ...theme.colors.text,
      primary: lightPalette.textPrimary,
      secondary: lightPalette.textSecondary,
      muted: lightPalette.textMuted,
    },
    border: lightPalette.border,
    outline: lightPalette.outline,
    outlineVariant: lightPalette.outlineVariant,
  }
};
