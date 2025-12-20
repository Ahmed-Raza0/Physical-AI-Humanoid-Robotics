import React, { forwardRef, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'outlined' | 'filled' | 'standard';
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'outlined',
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);
    const hasSuccess = success && !hasError;

    const inputClasses = [
      styles.input,
      styles[variant],
      hasError && styles.error,
      hasSuccess && styles.success,
      disabled && styles.disabled,
      leftIcon && styles.hasLeftIcon,
      rightIcon && styles.hasRightIcon,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const containerClasses = [
      styles.container,
      fullWidth && styles.fullWidth,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={containerClasses}>
        {label && (
          <label className={styles.label}>
            {label}
            {props.required && <span className={styles.required}>*</span>}
          </label>
        )}

        <div className={styles.inputWrapper}>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}

          <input
            ref={ref}
            className={inputClasses}
            disabled={disabled}
            {...props}
          />

          {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}

          {hasError && (
            <motion.span
              className={styles.errorIcon}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              ⚠️
            </motion.span>
          )}

          {hasSuccess && (
            <motion.span
              className={styles.successIcon}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              ✓
            </motion.span>
          )}
        </div>

        {(error || helperText) && (
          <motion.div
            className={styles.helperTextWrapper}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error ? (
              <span className={styles.errorText}>{error}</span>
            ) : (
              helperText && <span className={styles.helperText}>{helperText}</span>
            )}
          </motion.div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
