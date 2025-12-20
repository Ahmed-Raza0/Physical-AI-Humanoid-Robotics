import { useState, useEffect } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BreakpointState {
  current: Breakpoint;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2xl: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Hook to detect and track responsive breakpoints
 * @returns BreakpointState object with current breakpoint information
 */
export const useBreakpoint = (): BreakpointState => {
  const [breakpointState, setBreakpointState] = useState<BreakpointState>(() => {
    const initialWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    return getBreakpointState(initialWidth);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ticking = false;

    const handleResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setBreakpointState(getBreakpointState(window.innerWidth));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return breakpointState;
};

function getBreakpointState(width: number): BreakpointState {
  let current: Breakpoint = 'xs';

  if (width >= breakpoints['2xl']) {
    current = '2xl';
  } else if (width >= breakpoints.xl) {
    current = 'xl';
  } else if (width >= breakpoints.lg) {
    current = 'lg';
  } else if (width >= breakpoints.md) {
    current = 'md';
  } else if (width >= breakpoints.sm) {
    current = 'sm';
  }

  return {
    current,
    isXs: current === 'xs',
    isSm: current === 'sm',
    isMd: current === 'md',
    isLg: current === 'lg',
    isXl: current === 'xl',
    is2xl: current === '2xl',
    isMobile: width < breakpoints.md,
    isTablet: width >= breakpoints.md && width < breakpoints.lg,
    isDesktop: width >= breakpoints.lg,
  };
}

export default useBreakpoint;
