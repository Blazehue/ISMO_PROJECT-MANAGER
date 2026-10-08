import { ArrowRight, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Full-width form submit in the landing CTA style: ink pill with a lime arrow tile, centred label. */
export function ArrowSubmit({
  children,
  loading,
  className,
}: {
  children: ReactNode;
  loading?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={cn(
        'group relative flex h-12 w-full items-center rounded-[14px] bg-[#242426] px-1.5 text-[14px] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_rgb(36_36_38/0.55)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60 dark:bg-white dark:text-[#111113]',
        className,
      )}
    >
      <span
        className="relative flex size-9 items-center justify-center overflow-hidden rounded-[10px] bg-lime text-lime-ink"
        aria-hidden
      >
        <ArrowRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-[180%]" />
        <ArrowRight className="absolute size-4 -translate-x-[180%] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-0" />
      </span>
      <span className="absolute inset-x-12 flex items-center justify-center gap-2">
        {loading && <Loader2 className="size-4 animate-spin" />}
        {children}
      </span>
    </button>
  );
}
