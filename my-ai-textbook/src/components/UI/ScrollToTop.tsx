import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import styles from './ScrollToTop.module.css';

export interface ScrollToTopProps {
  showAfter?: number; // Show button after scrolling this many pixels
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  className?: string;
}

/**
 * Scroll to top button component
 * Appears after scrolling past a threshold
 * Smooth scroll to top on click
 */
export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  showAfter = 300,
  position = 'bottom-right',
  className = '',
}) => {
  const { isScrolled, scrollToTop } = useScrollProgress(showAfter);

  return (
    <AnimatePresence>
      {isScrolled && (
        <motion.button
          className={`${styles.scrollToTop} ${styles[position]} ${className}`}
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          aria-label="Scroll to top"
          title="Back to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
