import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { ease } from '@/lib/motion';
import { cn } from '@/lib/utils';

/** Lime highlighter-pen block that sweeps in behind a word when it scrolls into view. */
export function Highlight({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('relative inline-block px-[0.18em] whitespace-nowrap', className)}>
      <motion.span
        aria-hidden
        className="absolute inset-x-0 inset-y-[0.04em] -z-0 rounded-[0.22em] bg-lime"
        style={{ originX: 0 }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.8, ease, delay: 0.25 }}
      />
      <span className="relative text-lime-ink">{children}</span>
    </span>
  );
}
