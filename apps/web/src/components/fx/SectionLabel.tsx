import { motion } from 'motion/react';
import { ease } from '@/lib/motion';
import { cn } from '@/lib/utils';

/** Mono uppercase label with a rule that draws itself in, ending in a small pill outline. */
export function SectionLabel({
  children,
  className,
  align = 'left',
}: {
  children: string;
  className?: string;
  align?: 'left' | 'right';
}) {
  const line = (
    <motion.span
      className="h-px flex-1 bg-border"
      style={{ originX: align === 'left' ? 0 : 1 }}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.1, ease }}
    />
  );
  return (
    <div className={cn('flex items-center gap-4 text-muted-foreground', className)}>
      {align === 'right' && <span className="h-3 w-6 shrink-0 rounded-full border-2 border-current" />}
      {align === 'right' && line}
      <span className="label-mono shrink-0">{children}</span>
      {align === 'left' && line}
      {align === 'left' && <span className="h-3 w-6 shrink-0 rounded-full border-2 border-current" />}
    </div>
  );
}
