import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { SpotlightCard } from '@/components/fx/SpotlightCard';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { Skeleton } from '@/components/ui/skeleton';
import { fadeUp } from '@/lib/motion';
import { cn } from '@/lib/utils';

export type Hue = 'lime' | 'lavender' | 'peach' | 'sky' | 'mint' | 'rose';

const hueClasses: Record<Hue, { tile: string; glow: string }> = {
  lime: { tile: 'bg-hue-lime-bg text-hue-lime-fg', glow: 'var(--lime)' },
  lavender: { tile: 'bg-hue-lavender-bg text-hue-lavender-fg', glow: 'var(--brand-400)' },
  peach: { tile: 'bg-hue-peach-bg text-hue-peach-fg', glow: '#FFB38A' },
  sky: { tile: 'bg-hue-sky-bg text-hue-sky-fg', glow: '#7CC4FF' },
  mint: { tile: 'bg-hue-mint-bg text-hue-mint-fg', glow: '#6EE7B7' },
  rose: { tile: 'bg-hue-rose-bg text-hue-rose-fg', glow: '#FF8FB1' },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  hue = 'lavender',
  to,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  hint?: ReactNode;
  hue?: Hue;
  /** Makes the card a shortcut to the matching filtered list. */
  to?: string;
}) {
  const colors = hueClasses[hue];
  const card = (
    <SpotlightCard color={colors.glow} className="surface group h-full transition-colors hover:border-brand-200">
      <div className="flex h-full flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="label-mono text-[10.5px] text-muted-foreground">{label}</span>
          <span
            className={cn(
              'flex size-8 items-center justify-center rounded-lg transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12',
              colors.tile,
            )}
          >
            <Icon className="size-4" strokeWidth={1.8} />
          </span>
        </div>
        <div className="mt-3 text-[34px] leading-none font-normal tracking-[-0.04em]">
          <AnimatedNumber value={value} />
        </div>
        {hint && <div className="mt-3 text-[11.5px] text-muted-foreground">{hint}</div>}
      </div>
    </SpotlightCard>
  );
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      {to ? (
        <Link
          to={to}
          aria-label={`${label}: ${value}. View`}
          className="block h-full rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {card}
        </Link>
      ) : (
        card
      )}
    </motion.div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="surface p-4">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="mt-5 h-8 w-14" />
      <Skeleton className="mt-3 h-3 w-28" />
    </div>
  );
}
