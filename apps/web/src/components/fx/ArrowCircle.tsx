import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Round arrow that turns from ↗ to → when its `group` parent is hovered. */
export function ArrowCircle({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover:scale-110',
        className,
      )}
      aria-hidden
    >
      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
    </span>
  );
}
