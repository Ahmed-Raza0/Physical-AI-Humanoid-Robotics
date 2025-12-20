import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer } from '../../styles/animations';

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export default function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.1,
}: StaggerContainerProps): JSX.Element {
  const customVariant = {
    ...staggerContainer,
    visible: {
      ...staggerContainer.visible,
      transition: {
        ...staggerContainer.visible.transition,
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={customVariant}
      className={className}
    >
      {children}
    </motion.div>
  );
}
