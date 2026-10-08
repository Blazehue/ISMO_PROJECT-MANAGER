import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { ease } from '@/lib/motion';

/** Soft fade-and-lift whenever the route changes. Query-string changes (filters) don't re-trigger it. */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.45, ease }}
    >
      {children}
    </motion.div>
  );
}
