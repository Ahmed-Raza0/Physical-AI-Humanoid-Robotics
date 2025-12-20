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

// Additional animation variants for enhanced interactions
export const bounceIn = createVariant(
  { opacity: 0, scale: 0.3 },
  { opacity: 1, scale: 1 },
  {
    duration: getTransitionDuration(0.6),
    ease: [0.68, -0.55, 0.265, 1.55], // bounce effect
  }
);

export const rotateIn = createVariant(
  { opacity: 0, rotate: -180 },
  { opacity: 1, rotate: 0 },
  { duration: getTransitionDuration(0.6), ease: 'easeOut' }
);

export const flipIn = createVariant(
  { opacity: 0, rotateY: -90 },
  { opacity: 1, rotateY: 0 },
  { duration: getTransitionDuration(0.6), ease: 'easeOut' }
);

export const expandIn = createVariant(
  { opacity: 0, scaleX: 0 },
  { opacity: 1, scaleX: 1 },
  { duration: getTransitionDuration(0.5), ease: 'easeOut' }
);

export const collapseOut = {
  exit: {
    opacity: 0,
    scaleY: prefersReducedMotion() ? 1 : 0,
    transition: {
      duration: getTransitionDuration(0.3),
      ease: 'easeIn',
    },
  },
};

// List animations with stagger
export const listContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: prefersReducedMotion() ? 0 : 0.07,
      delayChildren: prefersReducedMotion() ? 0 : 0.1,
    },
  },
};

export const listItem = createVariant(
  { opacity: 0, x: -20 },
  { opacity: 1, x: 0 },
  { duration: getTransitionDuration(0.4), ease: 'easeOut' }
);

// Notification/Toast animations
export const notificationSlideIn = {
  initial: {
    opacity: 0,
    y: prefersReducedMotion() ? 0 : -50,
    scale: prefersReducedMotion() ? 1 : 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: getTransitionDuration(0.3),
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: prefersReducedMotion() ? 0 : -20,
    scale: prefersReducedMotion() ? 1 : 0.95,
    transition: {
      duration: getTransitionDuration(0.2),
      ease: 'easeIn',
    },
  },
};

// Modal/Dialog animations
export const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: getTransitionDuration(0.2),
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: getTransitionDuration(0.2),
    },
  },
};

export const modalContent = {
  hidden: {
    opacity: 0,
    scale: prefersReducedMotion() ? 1 : 0.95,
    y: prefersReducedMotion() ? 0 : 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: getTransitionDuration(0.3),
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: prefersReducedMotion() ? 1 : 0.95,
    y: prefersReducedMotion() ? 0 : 20,
    transition: {
      duration: getTransitionDuration(0.2),
      ease: 'easeIn',
    },
  },
};

// Skeleton loading shimmer
export const shimmer = prefersReducedMotion()
  ? {}
  : {
      backgroundImage: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    };

// Progress animations
export const progressBar = {
  initial: { scaleX: 0, transformOrigin: 'left' },
  animate: (custom: number) => ({
    scaleX: custom / 100,
    transition: {
      duration: getTransitionDuration(0.5),
      ease: 'easeOut',
    },
  }),
};

// Accordion/Collapsible animations
export const accordionContent = {
  collapsed: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
    transition: {
      duration: getTransitionDuration(0.3),
      ease: 'easeInOut',
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    overflow: 'visible',
    transition: {
      duration: getTransitionDuration(0.3),
      ease: 'easeInOut',
    },
  },
};
