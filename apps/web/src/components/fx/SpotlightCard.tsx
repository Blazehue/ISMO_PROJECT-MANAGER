import { useRef, type HTMLAttributes, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';

/** Card with a soft glow that follows the cursor (React Bits-style spotlight). */
export function SpotlightCard({
  className,
  children,
  color = 'var(--brand-400)',
  ...props
}: HTMLAttributes<HTMLDivElement> & { color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || !ref.current) return;
    ref.current.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    ref.current.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  };
  return (
    <div ref={ref} onMouseMove={onMove} className={cn('group/spot relative overflow-hidden', className)} {...props}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{
          background: `radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in oklab, ${color} 22%, transparent), transparent 60%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
