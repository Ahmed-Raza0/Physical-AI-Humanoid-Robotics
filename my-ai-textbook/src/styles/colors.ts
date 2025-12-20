/**
 * Premium color palette configuration
 * Modern, professional color scheme with high contrast and readability
 */

export const colors = {
  // Primary colors
  primary: {
    main: '#1E40AF', // Deep Blue
    light: '#3B82F6', // Lighter Blue
    dark: '#1E3A8A', // Darker Blue
    lighter: '#DBEAFE', // Very Light Blue
  },

  // Secondary colors
  secondary: {
    main: '#0891B2', // Cyan/Teal
    light: '#06B6D4', // Lighter Cyan
    dark: '#0E7490', // Darker Cyan
    lighter: '#CFFAFE', // Very Light Cyan
  },

  // Accent colors
  accent: {
    main: '#7C3AED', // Purple
    light: '#8B5CF6', // Lighter Purple
    dark: '#6D28D9', // Darker Purple
    lighter: '#EDE9FE', // Very Light Purple
  },

  // Neutral colors
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Semantic colors
  success: '#10B981', // Green
  warning: '#F59E0B', // Amber
  error: '#EF4444', // Red
  info: '#3B82F6', // Blue

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
    secondary: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
    accent: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
    hero: 'linear-gradient(135deg, #1E40AF 0%, #0891B2 50%, #7C3AED 100%)',
    subtle: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
  },
};

// CSS variable mappings for Docusaurus
export const cssVariables = {
  light: {
    '--color-primary': colors.primary.main,
    '--color-primary-light': colors.primary.light,
    '--color-primary-dark': colors.primary.dark,
    '--color-secondary': colors.secondary.main,
    '--color-accent': colors.accent.main,
    '--color-background': colors.neutral[50],
    '--color-surface': '#FFFFFF',
    '--color-text-primary': colors.neutral[900],
    '--color-text-secondary': colors.neutral[600],
    '--color-border': colors.neutral[200],
  },
  dark: {
    '--color-primary': colors.primary.light,
    '--color-primary-light': colors.primary.lighter,
    '--color-primary-dark': colors.primary.main,
    '--color-secondary': colors.secondary.light,
    '--color-accent': colors.accent.light,
    '--color-background': colors.neutral[900],
    '--color-surface': colors.neutral[800],
    '--color-text-primary': colors.neutral[50],
    '--color-text-secondary': colors.neutral[300],
    '--color-border': colors.neutral[700],
  },
};
