/**
 * Reusable Framer Motion animation variants
 * Provides consistent animations across the application
 * Now with prefers-reduced-motion support
 */

/**
 * Check if user prefers reduced motion
 */
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get transition duration based on reduced motion preference
 */
const getTransitionDuration = (duration: number): number => {
  return prefersReducedMotion() ? 0.01 : duration;
};

/**
 * Create animation variant that respects reduced motion preference
 */
const createVariant = (hiddenProps: any, visibleProps: any, transition: any) => {
  if (prefersReducedMotion()) {
    // For reduced motion, only fade opacity, no transforms
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.01 },
      },
    };
  }
  return {
    hidden: hiddenProps,
    visible: {
      ...visibleProps,
      transition,
    },
  };
};

export const fadeIn = createVariant(
  { opacity: 0 },
  { opacity: 1 },
  { duration: getTransitionDuration(0.6), ease: 'easeOut' }
);

export const fadeInUp = createVariant(
  { opacity: 0, y: 30 },
  { opacity: 1, y: 0 },
  { duration: getTransitionDuration(0.6), ease: 'easeOut' }
);

export const fadeInDown = createVariant(
  { opacity: 0, y: -30 },
  { opacity: 1, y: 0 },
  { duration: getTransitionDuration(0.6), ease: 'easeOut' }
);

export const slideInLeft = createVariant(
  { opacity: 0, x: -50 },
  { opacity: 1, x: 0 },
  { duration: getTransitionDuration(0.6), ease: 'easeOut' }
);

export const slideInRight = createVariant(
  { opacity: 0, x: 50 },
  { opacity: 1, x: 0 },
  { duration: getTransitionDuration(0.6), ease: 'easeOut' }
);

export const scaleIn = createVariant(
  { opacity: 0, scale: 0.8 },
  { opacity: 1, scale: 1 },
  { duration: getTransitionDuration(0.5), ease: 'easeOut' }
);

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: prefersReducedMotion() ? 0 : 0.1,
      delayChildren: prefersReducedMotion() ? 0 : 0.2,
    },
  },
};

export const staggerItem = createVariant(
  { opacity: 0, y: 20 },
  { opacity: 1, y: 0 },
  { duration: getTransitionDuration(0.5), ease: 'easeOut' }
);

// Hover animations - respect reduced motion
export const hoverScale = prefersReducedMotion()
  ? {}
  : {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    };

export const hoverLift = prefersReducedMotion()
  ? {}
  : {
      y: -8,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    };

export const buttonHover = prefersReducedMotion()
  ? {}
  : {
      scale: 1.05,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    };

// Card animations
export const cardVariants = {
  hidden: { opacity: 0, y: prefersReducedMotion() ? 0 : 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: getTransitionDuration(0.6),
      ease: 'easeOut',
    },
  },
  hover: prefersReducedMotion()
    ? {}
    : {
        y: -8,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
};

// Page transition
export const pageTransition = {
  hidden: { opacity: 0, x: prefersReducedMotion() ? 0 : -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: getTransitionDuration(0.5),
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: prefersReducedMotion() ? 0 : 20,
    transition: {
      duration: getTransitionDuration(0.3),
      ease: 'easeIn',
    },
  },
};
