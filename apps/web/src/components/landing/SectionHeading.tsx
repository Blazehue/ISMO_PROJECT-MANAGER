import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

/** Chip badge, large regular-weight title and a muted description (reference style). */
export function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  description,
  center,
  className,
}: {
  icon?: LucideIcon;
  eyebrow: string;
  title: ReactNode;
  description?: string;
  center?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={cn('max-w-2xl', center && 'mx-auto text-center', className)}>
      <span className="inline-flex items-center gap-2 rounded-lg bg-muted px-2.5 py-1.5 text-[12.5px]">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        {eyebrow}
      </span>
      <h2 className="mt-6 text-[36px] leading-[1.06] font-normal tracking-[-0.045em] sm:text-[50px]">{title}</h2>
      {description && (
        <p className={cn('mt-5 max-w-xl text-[15.5px] leading-relaxed text-muted-foreground', center && 'mx-auto')}>
          {description}
        </p>
      )}
    </Reveal>
  );
}
