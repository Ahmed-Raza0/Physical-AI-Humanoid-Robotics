import { useEffect, useState } from 'react';

export interface PageTransitionState {
  isTransitioning: boolean;
  direction: 'forward' | 'backward' | null;
}

/**
 * Hook to manage page transition states
 * Useful for coordinating animations during navigation
 * @param duration - Transition duration in milliseconds (default: 300)
 * @returns PageTransitionState object
 */
export const usePageTransition = (duration: number = 300): PageTransitionState & {
  startTransition: (direction?: 'forward' | 'backward') => Promise<void>;
} => {
  const [state, setState] = useState<PageTransitionState>({
    isTransitioning: false,
    direction: null,
  });

  const startTransition = (direction: 'forward' | 'backward' = 'forward'): Promise<void> => {
    return new Promise((resolve) => {
      setState({ isTransitioning: true, direction });

      setTimeout(() => {
        setState({ isTransitioning: false, direction: null });
        resolve();
      }, duration);
    });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      setState({ isTransitioning: false, direction: null });
    };
  }, []);

  return {
    ...state,
    startTransition,
  };
};

/**
 * Hook to detect route changes and trigger page transitions
 * Works with Docusaurus navigation
 */
export const useRouteTransition = (duration: number = 300) => {
  const [state, setState] = useState<PageTransitionState>({
    isTransitioning: false,
    direction: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;

    const handleRouteChange = () => {
      setState({ isTransitioning: true, direction: 'forward' });

      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Reset after transition
      timeoutId = setTimeout(() => {
        setState({ isTransitioning: false, direction: null });
      }, duration);
    };

    // Listen for Docusaurus route changes
    // Docusaurus uses client-side routing, so we can listen to popstate
    window.addEventListener('popstate', handleRouteChange);

    // Also intercept clicks on links for smoother transitions
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href && !link.target && !e.ctrlKey && !e.metaKey) {
        // Only handle internal links
        if (link.href.startsWith(window.location.origin)) {
          handleRouteChange();
        }
      }
    };

    document.addEventListener('click', handleLinkClick, true);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      document.removeEventListener('click', handleLinkClick, true);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [duration]);

  return state;
};

export default usePageTransition;
