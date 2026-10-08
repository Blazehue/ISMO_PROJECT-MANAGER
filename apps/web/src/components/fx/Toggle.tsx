import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

/** Small animated switch (decorative unless onChange is passed). */
export function Toggle({
  on,
  onChange,
  className,
  label,
}: {
  on: boolean;
  onChange?: (on: boolean) => void;
  className?: string;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange?.(!on)}
      className={cn(
        'flex h-6 w-11 items-center rounded-full p-0.5 transition-colors duration-300',
        on ? 'bg-lime' : 'bg-muted',
        className,
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn('size-5 rounded-full shadow-sm', on ? 'ml-auto bg-[#242426]' : 'bg-card')}
      />
    </button>
  );
}
