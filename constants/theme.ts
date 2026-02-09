// Actor OS - Light Taupe Color Scheme (from onboarding logo)
export const colors = {
  // Base backgrounds
  background: '#a89d87', // Taupe (from logo background)
  surface: '#9a8f77', // Darker taupe
  surfaceElevated: '#b5a894', // Lighter taupe
  
  // Text
  textPrimary: '#3d3935', // Deep charcoal for primary text
  textSecondary: '#5a544d', // Medium charcoal
  textTertiary: '#7a7265', // Light charcoal
  
  // Accent
  primary: '#3d3935', // Deep charcoal for buttons/accents
  primaryDark: '#2a2826', // Darker charcoal
  accent: '#c4b59a', // Light warm taupe
  
  // Borders
  border: '#8a806d',
  borderLight: '#9a8f77',
  
  // Status
  success: '#8a9d7a',
  warning: '#3d3935', // High-contrast warm charcoal (was low-contrast yellow)
  error: '#b87a6f',
  
  // Additional contrast colors for important messaging
  cautionText: '#2a2826', // Extra dark for critical visibility
  supportIcon: '#5a544d', // Medium charcoal for calm support indicators
  
  // Overlay
  overlay: 'rgba(168, 157, 135, 0.95)',
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
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};
