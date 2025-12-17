import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cardVariants } from '../../theme/animations';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimatedCard({ children, className = '', delay = 0 }: AnimatedCardProps): JSX.Element {
  const customVariant = {
    ...cardVariants,
    visible: {
      ...cardVariants.visible,
      transition: {
        ...cardVariants.visible.transition,
        delay,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, margin: '-50px' }}
      variants={customVariant}
      className={className}
    >
      {children}
    </motion.div>
  );
}
