import { motion, useScroll, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';

/** Thin lime reading-progress line pinned to the top of the viewport. */
export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 32, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className={cn('fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-lime', className)}
      style={{ scaleX }}
    />
  );
}
