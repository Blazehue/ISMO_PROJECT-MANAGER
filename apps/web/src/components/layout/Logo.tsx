import { cn } from '@/lib/utils';

/** Six-petal mark in the brand lavender. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-7', className)} aria-hidden>
      <g fill="var(--brand-500)">
        <circle cx="16" cy="9" r="5" />
        <circle cx="22.06" cy="12.5" r="5" />
        <circle cx="22.06" cy="19.5" r="5" />
        <circle cx="16" cy="23" r="5" />
        <circle cx="9.94" cy="19.5" r="5" />
        <circle cx="9.94" cy="12.5" r="5" />
      </g>
      <circle cx="16" cy="16" r="4" fill="var(--background)" />
    </svg>
  );
}

export function Logo({ className, subtitle = true }: { className?: string; subtitle?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      <div className="leading-tight">
        <div className="text-[17px] font-semibold tracking-[-0.03em] text-foreground">ISMO</div>
        {subtitle && <div className="text-[11px] text-muted-foreground">Project Workspace</div>}
      </div>
    </div>
  );
}
