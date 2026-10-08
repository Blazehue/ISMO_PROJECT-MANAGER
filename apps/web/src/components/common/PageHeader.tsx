import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  pill,
}: {
  /** Small mono label above the title, e.g. "Overview". */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Small lavender status pill shown on the right, as in the dashboard header. */
  pill?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="label-mono mb-2 text-[10.5px] text-muted-foreground">// {eyebrow}</div>}
        <h1 className="text-[26px] leading-tight tracking-[-0.035em] sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {pill && (
          <span className="inline-flex items-center gap-2 rounded-md bg-brand-50 px-2 py-1 text-[11.5px] font-medium text-brand-600">
            {pill}
          </span>
        )}
        {actions}
      </div>
    </div>
  );
}
