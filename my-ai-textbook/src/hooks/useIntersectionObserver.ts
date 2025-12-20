import { useEffect, useRef, useState, RefObject } from 'react';

export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
  onIntersect?: (entry: IntersectionObserverEntry) => void;
}

export interface UseIntersectionObserverReturn {
  ref: RefObject<HTMLElement>;
  isIntersecting: boolean;
  entry?: IntersectionObserverEntry;
}

/**
 * Hook to observe element visibility using Intersection Observer API
 * Useful for lazy loading and reveal-on-scroll animations
 * @param options - Intersection Observer options
 * @returns UseIntersectionObserverReturn object with ref and visibility state
 */
export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn => {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
    onIntersect,
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const frozen = useRef(false);

  const isIntersecting = entry?.isIntersecting ?? false;

  useEffect(() => {
    const node = ref.current;
    const hasIOSupport = typeof window !== 'undefined' && 'IntersectionObserver' in window;

    if (!hasIOSupport || !node) return;

    // If already frozen (visible and freeze enabled), don't observe
    if (frozen.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);

        if (entry.isIntersecting) {
          onIntersect?.(entry);

          if (freezeOnceVisible) {
            frozen.current = true;
            observer.disconnect();
          }
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible, onIntersect]);

  return {
    ref,
    isIntersecting,
    entry,
  };
};

export default useIntersectionObserver;
