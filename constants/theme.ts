// Actor OS - Dark Neutral System
// Containing, professional, steady - designed for nervous-system regulation
export const colors = {
  // Base backgrounds
  background: '#2E2B27', // Deep warm stone / charcoal-beige (primary background)
  surface: '#3F3A34', // Warm slate (cards, containers) - clear hierarchy
  surfaceElevated: '#4A453F', // Elevated surfaces (modals, overlays)
  
  // Text
  textPrimary: '#F2EEE8', // Warm off-white (headings, key prompts) - high clarity
  textSecondary: '#CFC9C1', // Softened light grey-beige (supporting copy)
  textTertiary: '#A9A39B', // Muted warm grey (helper text, icons)
  
  // Accent & CTAs
  primary: '#B89968', // Muted clay / warm amber-brown (sparingly used)
  primaryDark: '#9A7F52', // Darker amber variant
  primaryLight: '#D4B88A', // Lighter amber for emphasis
  accent: '#8E9B7A', // Desaturated sage (status indicators, active states)
  
  // Borders
  border: 'rgba(169, 163, 155, 0.15)', // Very subtle, low-contrast dividers
  borderMedium: 'rgba(169, 163, 155, 0.25)', // Medium separation
  borderStrong: 'rgba(169, 163, 155, 0.35)', // Strong separation for cards
  
  // Status
  success: '#7D8F73', // Muted olive-sage (OPEN, ACTIVE states)
  warning: '#B89968', // Muted clay (calm warning)
  error: '#B8826D', // Soft terracotta (errors, alerts)
  
  // Active states
  activeIndicator: '#B89968', // Warm amber for active role/tab indicators
  
  // Overlay
  overlay: 'rgba(46, 43, 39, 0.96)', // Dark warm overlay
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  // Font families
  fonts: {
    display: 'Cinzel_600SemiBold', // For logo and hero text
    displayBold: 'Cinzel_700Bold', // For section headers
    body: 'System', // Inter fallback to system default
  },
  
  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    title: 22, // Screen titles (H1)
    display: 28,
    displayLarge: 36, // Hero/brand only
  },
  
  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    relaxed: 0.5,
    title: 0.5, // For screen titles (H1) - calm, grounded
    sectionHeader: 0.5, // For section headers (H2) - near-normal, human
    hero: 35, // For logo and hero text in Cinzel - 30 to 40
  },
};

export const borderRadius = {
  sm: 6, // Slightly increased for softness
  md: 10,
  lg: 14,
  xl: 18,
  round: 999,
};
