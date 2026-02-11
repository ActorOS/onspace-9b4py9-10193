// Actor OS - Warm Oat & Parchment System
// Grounded rehearsal notebook aesthetic - natural, calm, paper-like
export const colors = {
  // Base backgrounds
  background: '#DDD2C4', // Warm parchment background (calm, grounded, cinematic foundation)
  surface: '#DDD0BE', // Cards and containers (darker sand tone - clear separation)
  surfaceElevated: '#E8DFD0', // Section backgrounds (subtle structure)
  
  // Text
  textPrimary: '#3A2F2A', // Primary text (deep espresso brown for titles - increased contrast)
  textSecondary: '#5C5046', // Secondary text (soft brown for body text, labels, metadata)
  textTertiary: '#5C5046', // Tertiary text (same as secondary)
  
  // Accent & CTAs (use sparingly)
  primary: '#7A4A2E', // Accent - CTAs, progress indicators, selected states only
  primaryDark: '#7A4A2E', // No auto-derived shades
  primaryLight: '#7A4A2E', // No auto-derived shades
  accent: '#7A4A2E', // Accent for status indicators, active states
  
  // Borders
  border: '#CFC4B3', // Divider lines, borders, and disabled elements (subtle)
  borderMedium: '#CFC4B3', // Medium separation
  borderStrong: '#CFC4B3', // Strong separation for cards
  
  // Status
  success: '#7A4A2E', // Use accent color for success states
  warning: '#7A4A2E', // Use accent color for warnings
  error: '#7A4A2E', // Use accent color for errors (restrained)
  
  // Active states
  activeIndicator: '#7A4A2E', // Active role/tab indicators
  
  // Overlay
  overlay: 'rgba(242, 233, 220, 0.96)', // Warm oat overlay
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
