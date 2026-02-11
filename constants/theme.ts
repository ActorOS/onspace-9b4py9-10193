// Actor OS - Warm Beige System
// Calm, material, backstage - designed for visual restraint and containment
export const colors = {
  // Base backgrounds
  background: '#EFE9DD', // Warm beige (global foundation)
  surface: '#D6CFC0', // Cards and containers (grounded)
  surfaceElevated: '#E4DDCF', // Section backgrounds (subtle hierarchy)
  
  // Text
  textPrimary: '#2A2926', // Primary text (headings, key prompts)
  textSecondary: '#6E6A63', // Secondary text (labels, metadata, helper text)
  textTertiary: '#6E6A63', // Tertiary text (same as secondary)
  
  // Accent & CTAs (use sparingly)
  primary: '#8A6F4E', // Accent - CTAs, progress indicators, selected states only
  primaryDark: '#8A6F4E', // No auto-derived shades
  primaryLight: '#8A6F4E', // No auto-derived shades
  accent: '#8A6F4E', // Accent for status indicators, active states
  
  // Borders
  border: '#C7C0B3', // Divider lines and disabled elements
  borderMedium: '#C7C0B3', // Medium separation
  borderStrong: '#C7C0B3', // Strong separation for cards
  
  // Status
  success: '#8A6F4E', // Use accent color for success states
  warning: '#8A6F4E', // Use accent color for warnings
  error: '#8A6F4E', // Use accent color for errors (restrained)
  
  // Active states
  activeIndicator: '#8A6F4E', // Active role/tab indicators
  
  // Overlay
  overlay: 'rgba(239, 233, 221, 0.96)', // Warm beige overlay
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
