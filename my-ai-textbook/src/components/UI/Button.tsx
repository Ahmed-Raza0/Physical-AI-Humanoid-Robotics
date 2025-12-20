import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    isLoading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.button
      className={buttonClasses}
      disabled={isDisabled}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {isLoading && (
        <span className={styles.spinner}>
          <span className={styles.spinnerDot}></span>
          <span className={styles.spinnerDot}></span>
          <span className={styles.spinnerDot}></span>
        </span>
      )}

      {!isLoading && leftIcon && (
        <span className={styles.leftIcon}>{leftIcon}</span>
      )}

      <span className={styles.content}>{children}</span>

      {!isLoading && rightIcon && (
        <span className={styles.rightIcon}>{rightIcon}</span>
      )}
    </motion.button>
  );
};

export default Button;
