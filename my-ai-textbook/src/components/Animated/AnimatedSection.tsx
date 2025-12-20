import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../styles/animations';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimatedSection({ children, className = '', delay = 0 }: AnimatedSectionProps): JSX.Element {
  const customVariant = {
    hidden: fadeInUp.hidden,
    visible: {
      ...fadeInUp.visible,
      transition: {
        ...fadeInUp.visible.transition,
        delay,
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
