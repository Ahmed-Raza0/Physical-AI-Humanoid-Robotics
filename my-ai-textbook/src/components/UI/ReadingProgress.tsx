import React from 'react';
import { motion } from 'framer-motion';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import styles from './ReadingProgress.module.css';

export interface ReadingProgressProps {
  position?: 'top' | 'bottom';
  height?: number;
  color?: string;
  className?: string;
}

/**
 * Reading progress indicator component
 * Shows a progress bar based on scroll position
 */
export const ReadingProgress: React.FC<ReadingProgressProps> = ({
  position = 'top',
  height = 3,
  color,
  className = '',
}) => {
  const { progress } = useScrollProgress();

  const style: React.CSSProperties = {
    height: `${height}px`,
  };

  if (color) {
    style.backgroundColor = color;
  }

  return (
    <div className={`${styles.container} ${styles[position]} ${className}`}>
      <motion.div
        className={styles.progressBar}
        style={style}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: progress / 100 }}
        transition={{ duration: 0.1, ease: 'linear' }}
      />
    </div>
  );
};

export default ReadingProgress;
