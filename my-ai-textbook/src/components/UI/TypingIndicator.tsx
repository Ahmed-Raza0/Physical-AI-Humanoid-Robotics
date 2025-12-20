import React from 'react';
import { motion } from 'framer-motion';
import styles from './TypingIndicator.module.css';

export interface TypingIndicatorProps {
  className?: string;
  dotCount?: number;
  dotSize?: number;
}

/**
 * Typing indicator animation component
 * Shows animated dots to indicate ongoing response
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  className = '',
  dotCount = 3,
  dotSize = 8,
}) => {
  return (
    <div className={`${styles.typingIndicator} ${className}`} aria-label="Typing...">
      {Array.from({ length: dotCount }).map((_, index) => (
        <motion.span
          key={index}
          className={styles.dot}
          style={{
            width: dotSize,
            height: dotSize,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default TypingIndicator;
