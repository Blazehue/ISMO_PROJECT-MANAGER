import { motion } from 'motion/react';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { ease } from '@/lib/motion';
import { cn } from '@/lib/utils';

const clamp = (value: number) => Math.min(100, Math.max(0, value));

/** Thin solid bar for compact places. Fills in when it scrolls into view. */
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-brand-100', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full bg-brand-400"
        initial={{ width: 0 }}
        whileInView={{ width: `${clamp(value)}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease }}
      />
    </div>
  );
}

/** Signature striped bar: lavender ticks over a faint track, with an animated value beside it. */
export function TickProgress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className="relative h-4 w-full overflow-hidden rounded-[3px] bg-[repeating-linear-gradient(90deg,var(--brand-100)_0_2px,transparent_2px_5px)]"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="absolute inset-y-0 left-0 bg-[repeating-linear-gradient(90deg,var(--brand-400)_0_2px,transparent_2px_5px)]"
          initial={{ width: 0 }}
          whileInView={{ width: `${clamp(value)}%` }}
          viewport={{ once: true }}
          // Later changes (e.g. completing a task) animate from the current width.
          animate={{ width: `${clamp(value)}%` }}
          transition={{ duration: 1, ease }}
        />
      </div>
      <span className="w-11 shrink-0 text-right text-[17px] font-medium tracking-tight text-brand-500">
        <AnimatedNumber value={value} />
        <span className="ml-px text-[10px] font-normal">%</span>
      </span>
    </div>
  );
}
