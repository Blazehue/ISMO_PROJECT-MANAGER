import { cn } from '@/lib/utils';

/** Eight-spoke asterisk used as a separator in marquees. Optionally spins. */
export function Asterisk({ className, spin }: { className?: string; spin?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-6 shrink-0', spin && 'animate-spin-slow', className)} aria-hidden>
      {[0, 45, 90, 135].map((angle) => (
        <rect
          key={angle}
          x="10.4"
          y="1"
          width="3.2"
          height="22"
          rx="1.6"
          fill="currentColor"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </svg>
  );
}
