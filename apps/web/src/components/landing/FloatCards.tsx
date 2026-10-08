import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Makro-style floating stat card: title, caption, change chip and a big number. */
export function StatFloat({
  title,
  caption,
  change,
  value,
  unit,
  className,
  days,
}: {
  title: string;
  caption: string;
  change: string;
  value: string;
  unit?: string;
  className?: string;
  /** Optional little day selector (as in the reference's "Reduction" card). */
  days?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'w-[200px] rounded-2xl border border-white/60 bg-card/95 p-4 shadow-[0_30px_60px_-25px_rgb(36_36_38/0.45)] backdrop-blur-md select-none dark:border-white/10',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[13px] font-medium">{title}</div>
          <div className="text-[10.5px] text-muted-foreground">{caption}</div>
        </div>
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9.5px] text-muted-foreground">{change}</span>
      </div>
      {days && (
        <div className="mt-3 grid grid-cols-3 gap-1 text-center text-[9px] text-muted-foreground">
          {[
            ['1', 'Mon'],
            ['2', 'Tue'],
            ['3', 'Wed'],
          ].map(([n, d], i) => (
            <div key={d} className={cn('rounded-md py-1', i === 0 && 'bg-muted text-foreground')}>
              <div className="font-medium">{n}</div>
              {d}
            </div>
          ))}
        </div>
      )}
      <div className="mt-5 flex items-end justify-between">
        <span className="text-[30px] leading-none tracking-[-0.04em]">
          {value}
          {unit && <span className="ml-0.5 text-[18px] text-muted-foreground">{unit}</span>}
        </span>
        <TrendingUp className="size-4 text-[#9db53a]" />
      </div>
    </div>
  );
}
