import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Card with an icon + title + subtitle header, as used for each dashboard section. */
export function SectionCard({
  icon: Icon,
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn('surface', className)}>
      <header className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 sm:px-5">
        <div className="flex items-start gap-2.5">
          <Icon className="mt-0.5 size-[18px] text-muted-foreground" strokeWidth={1.6} />
          <div>
            <h2 className="text-[17px] leading-tight">{title}</h2>
            {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action}
      </header>
      <div className={cn('px-3 pb-3 sm:px-4 sm:pb-4', bodyClassName)}>{children}</div>
    </section>
  );
}
