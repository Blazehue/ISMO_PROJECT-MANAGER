import { AlertCircle, Clock } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const styles = {
  error: {
    icon: AlertCircle,
    className: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300',
  },
  warning: {
    icon: Clock,
    className:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300',
  },
};

export function FormAlert({
  tone = 'error',
  className: extra,
  children,
}: {
  tone?: keyof typeof styles;
  className?: string;
  children: ReactNode;
}) {
  const { icon: Icon, className } = styles[tone];
  return (
    <div
      className={cn('flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-[13px]', className, extra)}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
