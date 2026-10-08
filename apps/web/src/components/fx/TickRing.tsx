import { cn } from '@/lib/utils';

/** Radial ring of ticks with a highlight sweeping around it. */
export function TickRing({ className, ticks = 48 }: { className?: string; ticks?: number }) {
  return (
    <div className={cn('relative size-40', className)} aria-hidden>
      <svg viewBox="0 0 100 100" className="absolute inset-0 text-muted-foreground/30">
        {Array.from({ length: ticks }, (_, i) => (
          <line
            key={i}
            x1="50"
            y1="4"
            x2="50"
            y2={i % 4 === 0 ? 15 : 12}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            transform={`rotate(${(360 / ticks) * i} 50 50)`}
          />
        ))}
      </svg>
      {/* Sweeping highlight: a conic gradient masked to the tick band */}
      <div className="animate-spin-slow absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,var(--brand-400)_60deg,transparent_120deg)] [mask-image:radial-gradient(circle,transparent_33%,black_34%,black_49%,transparent_50%)] [animation-duration:4s]" />
    </div>
  );
}
