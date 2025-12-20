/**
 * Custom Hooks Library
 * Reusable hooks for common UI patterns and behaviors
 */

export { useScroll } from './useScroll';
export type { ScrollState } from './useScroll';

export { useBreakpoint } from './useBreakpoint';
export type { Breakpoint, BreakpointState } from './useBreakpoint';

export { useTheme } from './useTheme';
export type { Theme, UseThemeReturn } from './useTheme';

export { usePageTransition, useRouteTransition } from './usePageTransition';
export type { PageTransitionState } from './usePageTransition';

export { useLocalStorage } from './useLocalStorage';
