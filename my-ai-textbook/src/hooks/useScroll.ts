import { useState, useEffect } from 'react';

export interface ScrollState {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right' | null;
  isScrollingUp: boolean;
  isScrollingDown: boolean;
  isAtTop: boolean;
  isAtBottom: boolean;
}

/**
 * Hook to track scroll position and direction
 * @param threshold - Minimum scroll distance to detect direction change (default: 10)
 * @returns ScrollState object with scroll information
 */
export const useScroll = (threshold: number = 10): ScrollState => {
  const [scrollState, setScrollState] = useState<ScrollState>({
    x: 0,
    y: 0,
    direction: null,
    isScrollingUp: false,
    isScrollingDown: false,
    isAtTop: true,
    isAtBottom: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastScrollY = window.scrollY;
    let lastScrollX = window.scrollX;
    let ticking = false;

    const updateScrollState = () => {
      const currentScrollY = window.scrollY;
      const currentScrollX = window.scrollX;

      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      let direction: 'up' | 'down' | 'left' | 'right' | null = null;

      // Detect vertical scroll direction
      if (Math.abs(currentScrollY - lastScrollY) > threshold) {
        direction = currentScrollY > lastScrollY ? 'down' : 'up';
      }
      // Detect horizontal scroll direction (if vertical didn't change significantly)
      else if (Math.abs(currentScrollX - lastScrollX) > threshold) {
        direction = currentScrollX > lastScrollX ? 'right' : 'left';
      }

      setScrollState({
        x: currentScrollX,
        y: currentScrollY,
        direction,
        isScrollingUp: direction === 'up',
        isScrollingDown: direction === 'down',
        isAtTop: currentScrollY === 0,
        isAtBottom: currentScrollY + clientHeight >= scrollHeight - 10, // 10px threshold
      });

      lastScrollY = currentScrollY;
      lastScrollX = currentScrollX;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial update
    updateScrollState();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return scrollState;
};

export default useScroll;
