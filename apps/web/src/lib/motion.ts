import type { Transition, Variants } from 'motion/react';

/** One easing curve everywhere: quick start, soft landing. */
export const ease = [0.22, 1, 0.36, 1] as const;

export const spring: Transition = { type: 'spring', stiffness: 380, damping: 32, mass: 0.8 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export const staggerContainer = (stagger = 0.06, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});
