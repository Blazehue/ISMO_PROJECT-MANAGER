import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Infinite horizontal marquee. The content is rendered twice and the track
 * slides by -50%, so the loop is seamless. Pauses on hover; disabled when the
 * user prefers reduced motion.
 */
export function Marquee({
  children,
  duration = 30,
  reverse,
  className,
  trackClassName,
  fade = true,
}: {
  children: ReactNode;
  /** Seconds per loop. */
  duration?: number;
  reverse?: boolean;
  className?: string;
  trackClassName?: string;
  /** Fade the left and right edges. */
  fade?: boolean;
}) {
  return (
    <div
      className={cn(
        'marquee-pause relative flex overflow-hidden',
        fade && '[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
        className,
      )}
    >
      <div
        className={cn('flex w-max shrink-0', reverse ? 'animate-marquee-reverse' : 'animate-marquee', trackClassName)}
        style={{ '--marquee-duration': `${duration}s` } as CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
