import { useState, useEffect, useCallback } from 'react';

export interface UseScrollProgressReturn {
  progress: number; // 0-100
  isScrolled: boolean; // Has scrolled past threshold
  isAtTop: boolean;
  isAtBottom: boolean;
  scrollToTop: () => void;
  scrollToBottom: () => void;
}

/**
 * Hook to track scroll progress and position
 * @param threshold - Pixel threshold to consider "scrolled" (default: 100)
 * @returns UseScrollProgressReturn object with scroll state
 */
export const useScrollProgress = (threshold: number = 100): UseScrollProgressReturn => {
  const [progress, setProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    // Calculate progress percentage
    const currentProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    setProgress(Math.min(100, Math.max(0, currentProgress)));

    // Update scroll state
    setIsScrolled(scrollTop > threshold);
    setIsAtTop(scrollTop <= 10);
    setIsAtBottom(scrollTop >= scrollHeight - 10);
  }, [threshold]);

  useEffect(() => {
    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToBottom = useCallback(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  }, []);

  return {
    progress,
    isScrolled,
    isAtTop,
    isAtBottom,
    scrollToTop,
    scrollToBottom,
  };
};

export default useScrollProgress;
