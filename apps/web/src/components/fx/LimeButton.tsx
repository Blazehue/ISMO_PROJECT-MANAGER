import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';

type Variant = 'ink' | 'light' | 'lime';

const styles: Record<Variant, { button: string; tile: string }> = {
  ink: { button: 'bg-[#242426] text-white dark:bg-white dark:text-[#111113]', tile: 'bg-lime text-lime-ink' },
  light: { button: 'border bg-card text-foreground', tile: 'bg-muted text-foreground' },
  lime: { button: 'bg-lime text-lime-ink', tile: 'bg-[#242426] text-lime' },
};

/** The arrow inside the tile slides out and a new one slides in on hover. */
function Tile({ variant, size }: { variant: Variant; size: 'md' | 'lg' }) {
  return (
    <span
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] transition-[width] duration-500 ease-[cubic-bezier(.22,1,.36,1)]',
        size === 'lg' ? 'size-10' : 'size-8',
        styles[variant].tile,
      )}
      aria-hidden
    >
      <ArrowRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-[180%]" />
      <ArrowRight className="absolute size-4 -translate-x-[180%] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-0" />
    </span>
  );
}

/**
 * Pill CTA with an arrow tile (lime on ink by default). Renders a router Link,
 * an external anchor, or a button depending on the props.
 */
export function LimeButton({
  children,
  to,
  href,
  onClick,
  variant = 'ink',
  size = 'md',
  className,
  type = 'button',
  disabled,
}: {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const classes = cn(
    'group inline-flex items-center gap-3 rounded-[14px] p-1.5 pr-5 font-medium shadow-[0_8px_24px_-12px_rgb(36_36_38/0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_rgb(36_36_38/0.55)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-60',
    size === 'lg' ? 'h-[52px] text-[15px]' : 'h-11 text-[14px]',
    styles[variant].button,
    className,
  );
  const content = (
    <>
      <Tile variant={variant} size={size} />
      {children}
    </>
  );
  if (to)
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  if (href)
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  );
}
