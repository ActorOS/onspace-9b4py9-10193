// Actor OS - Warm Stone Design System
// Grounded, warm, legible, emotionally containing
export const colors = {
  // Base backgrounds
  background: '#C5BAAB', // Warm stone / theatre wall (darker, grounded base)
  surface: '#D9D0C3', // Lighter warm tone (cards, containers) - clear contrast
  surfaceElevated: '#E2DAD0', // Elevated surfaces (modals, overlays)
  
  // Text
  textPrimary: '#2A2520', // Deep warm charcoal (headings, key prompts) - stronger
  textSecondary: '#524D44', // Supporting copy - improved contrast
  textTertiary: '#6E6860', // Helper text - still readable
  
  // Accent & CTAs
  primary: '#3B352E', // Deep warm brown (primary CTAs, floating tool icon)
  primaryDark: '#2A2520', // Darker variant
  primaryLight: '#F4F1EB', // Light warm text for dark backgrounds
  accent: '#7A6F60', // Muted warm clay (active role indicators, subtle highlights)
  
  // Borders
  border: 'rgba(42, 37, 32, 0.12)', // Subtle warm border - more visible
  borderMedium: 'rgba(42, 37, 32, 0.18)', // Medium separation
  borderStrong: 'rgba(42, 37, 32, 0.24)', // Strong separation for cards
  
  // Status
  success: '#7A8F6D', // Soft natural green - grounded
  warning: '#9A8468', // Warm clay (calm warning) - more visible
  error: '#A86D60', // Soft terracotta - deeper
  
  // Active states
  activeIndicator: '#6B5D4F', // Warm brown for active role/tab indicators - stronger
  
  // Overlay
  overlay: 'rgba(197, 186, 171, 0.96)', // Warm stone overlay
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
