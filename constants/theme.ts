// Actor OS - Warm Linen Design System
// Calm, warm, legible, emotionally containing
export const colors = {
  // Base backgrounds
  background: '#D8D1C3', // Warm linen / sand tone (primary background)
  surface: '#E6DFD2', // Lighter warm tone (cards, containers)
  surfaceElevated: '#EAE4D9', // Slightly elevated surfaces
  
  // Text
  textPrimary: '#2E2A24', // Deep warm charcoal (headings, key prompts)
  textSecondary: '#5A544A', // Supporting copy
  textTertiary: '#7A7266', // Helper text
  
  // Accent & CTAs
  primary: '#3B352E', // Deep warm brown (primary CTAs, floating tool icon)
  primaryDark: '#2E2A24', // Darker variant
  primaryLight: '#F4F1EB', // Light warm text for dark backgrounds
  accent: '#8A7F6D', // Muted clay (active role indicators, subtle highlights)
  
  // Borders
  border: 'rgba(46, 42, 36, 0.08)', // Subtle warm border
  borderMedium: 'rgba(46, 42, 36, 0.12)', // Slightly more visible
  borderStrong: 'rgba(46, 42, 36, 0.16)', // Stronger separation
  
  // Status
  success: '#8A9D7A', // Soft natural green
  warning: '#8A7F6D', // Muted clay (calm warning)
  error: '#B87A6F', // Soft terracotta
  
  // Active states
  activeIndicator: '#8A7F6D', // Muted clay for active role/tab indicators
  
  // Overlay
  overlay: 'rgba(216, 209, 195, 0.95)', // Warm linen overlay
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
