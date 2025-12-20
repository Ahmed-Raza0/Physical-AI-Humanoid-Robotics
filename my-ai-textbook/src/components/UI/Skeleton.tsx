import React from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className = '',
  count = 1,
}) => {
  const style: React.CSSProperties = {
    width,
    height,
  };

  // If variant is text and no height is provided, use default text height
  if (variant === 'text' && !height) {
    style.height = '1em';
  }

  const skeletonClasses = [
    styles.skeleton,
    styles[variant],
    styles[animation],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Render multiple skeletons if count > 1
  if (count > 1) {
    return (
      <div className={styles.skeletonGroup}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={skeletonClasses} style={style} />
        ))}
      </div>
    );
  }

  return <div className={skeletonClasses} style={style} />;
};

// Preset skeleton components for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`${styles.skeletonCard} ${className || ''}`}>
    <Skeleton variant="rect" width="100%" height={200} />
    <div className={styles.skeletonCardContent}>
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="90%" count={2} />
      <Skeleton variant="text" width="40%" />
    </div>
  </div>
);

export const SkeletonAvatar: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 40, className }) => (
  <Skeleton
    variant="circle"
    width={size}
    height={size}
    className={className}
  />
);

export const SkeletonButton: React.FC<{
  width?: string | number;
  className?: string;
}> = ({ width = 100, className }) => (
  <Skeleton
    variant="rounded"
    width={width}
    height={40}
    className={className}
  />
);

export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className }) => (
  <div className={`${styles.skeletonTable} ${className || ''}`}>
    {/* Header */}
    <div className={styles.skeletonTableRow}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} variant="text" width="80%" height={20} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className={styles.skeletonTableRow}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" width="90%" height={16} />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;
