import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { buttonHover } from '../../theme/animations';

interface AnimatedButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function AnimatedButton({
  children,
  className = '',
  onClick,
  type = 'button',
  disabled = false,
}: AnimatedButtonProps): JSX.Element {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : buttonHover}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}
