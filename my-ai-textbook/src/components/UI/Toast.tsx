import React, { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Toast.module.css';

export interface ToastProps {
  id?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: ReactNode;
  duration?: number; // in milliseconds, 0 = no auto-dismiss
  onClose?: () => void;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

const defaultIcons = {
  info: 'ℹ️',
  success: '✓',
  warning: '⚠️',
  error: '✕',
};

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration === 0) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  const icon = defaultIcons[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`${styles.toast} ${styles[type]}`}
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          role="alert"
          aria-live="polite"
        >
          <div className={styles.iconWrapper}>
            <span className={styles.icon}>{icon}</span>
          </div>

          <div className={styles.content}>
            {title && <div className={styles.title}>{title}</div>}
            <div className={styles.message}>{message}</div>
          </div>

          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close notification"
          >
            ×
          </button>

          {/* Progress bar for auto-dismiss */}
          {duration > 0 && (
            <motion.div
              className={styles.progressBar}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast Container Component
export interface ToastContainerProps {
  toasts: (ToastProps & { id: string })[];
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = 'top-right',
  onRemove,
}) => {
  return (
    <div className={`${styles.toastContainer} ${styles[position]}`}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
