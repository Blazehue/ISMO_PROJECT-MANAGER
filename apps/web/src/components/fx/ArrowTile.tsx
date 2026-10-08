import { ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Square tile with a double chevron that slides through on hover (put the
 * tile inside an element with the `group` class).
 */
export function ArrowTile({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <span
      className={cn(
        'relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg',
        inverted ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground',
        className,
      )}
      aria-hidden
    >
      <ChevronsRight className="size-4 transition-transform group-hover:animate-[chevron-out_0.45s_ease-in_forwards]" />
      <ChevronsRight className="absolute size-4 -translate-x-[140%] opacity-0 group-hover:animate-[chevron-in_0.45s_0.18s_ease-out_forwards]" />
    </span>
  );
}
