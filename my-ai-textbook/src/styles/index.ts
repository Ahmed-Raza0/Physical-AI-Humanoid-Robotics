/**
 * Theme System - Central Export
 * Import everything from '@site/src/theme'
 */

export * from './colors';
export * from './animations';
export * from './design-system';

// Re-export as named objects for convenience
export { colors, cssVariables } from './colors';
export {
  spacing,
  typography,
  shadows,
  borderRadius,
  breakpoints,
  zIndex,
  transitions,
  opacity,
  designSystem,
} from './design-system';

// Re-export all animation variants
export {
  fadeIn,
  fadeInUp,
  fadeInDown,
  slideInLeft,
  slideInRight,
  scaleIn,
  staggerContainer,
  staggerItem,
  hoverScale,
  hoverLift,
  buttonHover,
  cardVariants,
  pageTransition,
  bounceIn,
  rotateIn,
  flipIn,
  expandIn,
  collapseOut,
  listContainer,
  listItem,
  notificationSlideIn,
  modalBackdrop,
  modalContent,
  shimmer,
  progressBar,
  accordionContent,
} from './animations';
