import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  icon?: ReactNode | string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Empty state component for displaying when no data is available
 * Shows icon, title, description, and optional action button
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  action,
  className = '',
}) => {
  const renderIcon = () => {
    if (typeof icon === 'string') {
      return <div className={styles.iconEmoji}>{icon}</div>;
    }
    return <div className={styles.iconCustom}>{icon}</div>;
  };

  return (
    <motion.div
      className={`${styles.emptyState} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {renderIcon()}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <motion.button
          className={styles.actionButton}
          onClick={action.onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
