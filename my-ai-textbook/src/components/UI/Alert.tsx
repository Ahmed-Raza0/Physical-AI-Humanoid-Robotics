import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Alert.module.css';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  icon?: ReactNode;
  variant?: 'filled' | 'outlined' | 'standard';
}

const defaultIcons = {
  info: 'ℹ️',
  success: '✓',
  warning: '⚠️',
  error: '✕',
};

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  icon,
  variant = 'standard',
}) => {
  const displayIcon = icon || defaultIcons[type];

  return (
    <motion.div
      className={`${styles.alert} ${styles[type]} ${styles[variant]}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      role="alert"
    >
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>{displayIcon}</span>
      </div>

      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.message}>{children}</div>
      </div>

      {onClose && (
        <button className={styles.closeButton} onClick={onClose} aria-label="Close alert">
          ×
        </button>
      )}
    </motion.div>
  );
};

export default Alert;
