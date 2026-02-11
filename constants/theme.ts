// Actor OS - Ritual-Led System
// Grounded, calm, adult, backstage - designed for containment and presence
export const colors = {
  // Base backgrounds
  background: '#1F1E1B', // Warm charcoal (global foundation)
  surface: '#2B2925', // Primary cards and containers
  surfaceElevated: '#35322D', // Secondary surfaces (use only where hierarchy needed)
  
  // Text
  textPrimary: '#ECE9E2', // Primary text (headings, key prompts)
  textSecondary: '#B7B2A6', // Secondary text (labels, metadata, helper text)
  textTertiary: '#B7B2A6', // Tertiary text (same as secondary)
  
  // Accent & CTAs (use sparingly)
  primary: '#8C7A4F', // Accent - CTAs, progress indicators, active states only
  primaryDark: '#8C7A4F', // No auto-derived shades
  primaryLight: '#8C7A4F', // No auto-derived shades
  accent: '#8C7A4F', // Accent for status indicators, active states
  
  // Borders
  border: 'rgba(183, 178, 166, 0.12)', // Very subtle dividers
  borderMedium: 'rgba(183, 178, 166, 0.20)', // Medium separation
  borderStrong: 'rgba(183, 178, 166, 0.28)', // Strong separation for cards
  
  // Status
  success: '#8C7A4F', // Use accent color for success states
  warning: '#8C7A4F', // Use accent color for warnings
  error: '#8C7A4F', // Use accent color for errors (restrained)
  
  // Active states
  activeIndicator: '#8C7A4F', // Active role/tab indicators
  
  // Overlay
  overlay: 'rgba(31, 30, 27, 0.96)', // Dark warm overlay
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
