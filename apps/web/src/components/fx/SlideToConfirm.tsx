import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const KNOB = 44;

/**
 * Drag the arrow to the end of the track to confirm (an intentional gesture for
 * destructive actions). The knob is also a button: Enter / Space confirms, so
 * it works without a pointer.
 */
export function SlideToConfirm({
  label,
  onConfirm,
  pending,
  tone = 'danger',
  className,
}: {
  label: string;
  onConfirm: () => void;
  pending?: boolean;
  tone?: 'danger' | 'lime';
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [max, setMax] = useState(0);
  const [done, setDone] = useState(false);
  const x = useMotionValue(0);
  const fill = useTransform(x, (value) => value + KNOB);
  const labelOpacity = useTransform(x, [0, Math.max(1, max * 0.6)], [1, 0]);

  useEffect(() => {
    const measure = () => setMax(Math.max(0, (trackRef.current?.offsetWidth ?? 0) - KNOB - 8));
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // If the action fails (pending ends without unmounting), let the user try again.
  useEffect(() => {
    if (!pending && done) {
      const timer = setTimeout(() => {
        setDone(false);
        animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [pending, done, x]);

  const confirm = () => {
    if (done) return;
    setDone(true);
    animate(x, max, { type: 'spring', stiffness: 500, damping: 40 });
    onConfirm();
  };

  const colors = tone === 'danger' ? { track: 'bg-red-50 dark:bg-red-500/10', fill: 'bg-red-500', text: 'text-red-600 dark:text-red-400' } : { track: 'bg-muted', fill: 'bg-lime', text: 'text-foreground' };

  return (
    <div ref={trackRef} className={cn('relative h-[52px] w-full overflow-hidden rounded-[14px] p-1 select-none', colors.track, className)}>
      <motion.div className={cn('absolute inset-y-1 left-1 rounded-[11px] opacity-20', colors.fill)} style={{ width: fill }} />
      <motion.span
        style={{ opacity: labelOpacity }}
        className={cn('pointer-events-none absolute inset-0 flex items-center justify-center pl-10 text-[13.5px] font-medium', colors.text)}
      >
        {label}
        <span className="ml-1.5 inline-flex animate-pulse">→</span>
      </motion.span>
      <motion.button
        type="button"
        aria-label={`${label} (press Enter to confirm)`}
        drag={done ? false : 'x'}
        dragConstraints={{ left: 0, right: max }}
        dragElastic={0.04}
        dragMomentum={false}
        style={{ x }}
        onDragEnd={() => {
          if (x.get() > max * 0.85) confirm();
          else animate(x, 0, { type: 'spring', stiffness: 500, damping: 32 });
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            confirm();
          }
        }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'relative z-10 flex h-[44px] w-[44px] cursor-grab items-center justify-center rounded-[11px] text-white shadow-md focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none active:cursor-grabbing',
          tone === 'danger' ? 'bg-red-500' : 'bg-[#242426] text-lime',
        )}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : done ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
      </motion.button>
    </div>
  );
}
