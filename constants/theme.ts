// Actor OS - Deep Coffee-Brown Studio System
// Grounded, theatrical, evening-safe - designed for calm and containment
export const colors = {
  // Base backgrounds
  background: '#342B22', // Deep warm coffee brown (grounded studio foundation)
  surface: '#C8B6A6', // Cards and containers (warm beige/oat - stable surfaces)
  surfaceElevated: '#D6CFC0', // Elevated surfaces (lighter warm beige for hierarchy)
  
  // Text
  textPrimary: '#F2EEE8', // Primary text (soft off-white)
  textSecondary: '#B5AFA7', // Secondary text (muted warm gray - labels, durations, metadata)
  textTertiary: '#A39A8F', // Tertiary text (slightly more muted helper text)
  
  // Accent & CTAs (use sparingly)
  primary: '#D4A574', // Accent - CTAs, progress indicators, selected states (warm, readable on dark)
  primaryDark: '#D4A574', // No auto-derived shades
  primaryLight: '#D4A574', // No auto-derived shades
  accent: '#D4A574', // Accent for status indicators, active states
  
  // Borders
  border: '#6F6257', // Divider lines, borders, and disabled elements (subtle on dark)
  borderMedium: '#6F6257', // Medium separation
  borderStrong: '#6F6257', // Strong separation for cards
  
  // Status
  success: '#D4A574', // Use accent color for success states
  warning: '#D4A574', // Use accent color for warnings
  error: '#D4A574', // Use accent color for errors (restrained)
  
  // Active states
  activeIndicator: '#D4A574', // Active role/tab indicators
  
  // Overlay
  overlay: 'rgba(52, 43, 34, 0.96)', // Deep warm coffee brown overlay
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
