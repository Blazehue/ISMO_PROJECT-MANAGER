import type { Task } from '@ismo/shared';
import { AlarmClock, CalendarClock, ChartColumn, Check, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { SectionCard } from '@/components/common/SectionCard';
import { PriorityBadge } from '@/components/common/ToneBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUpdateTask } from '@/hooks/queries';
import { getErrorMessage } from '@/lib/api';
import { ease } from '@/lib/motion';
import { cn } from '@/lib/utils';

const DAY = 24 * 60 * 60 * 1000;
const todayUtc = () => {
  const d = new Date();
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
};
const daysUntil = (iso: string) => Math.round((Date.parse(iso.slice(0, 10)) - todayUtc()) / DAY);

const countdown = (days: number) => {
  if (days < 0) return { label: `${-days}d overdue`, tone: 'bg-hue-rose-bg text-hue-rose-fg' };
  if (days === 0) return { label: 'Today', tone: 'bg-lime text-lime-ink' };
  if (days === 1) return { label: 'Tomorrow', tone: 'bg-hue-peach-bg text-hue-peach-fg' };
  return { label: `in ${days} days`, tone: 'bg-muted text-muted-foreground' };
};

/** Unfinished tasks with a due date, soonest first (overdue included). */
export const openTasksWithDates = (tasks: Task[] | undefined) =>
  (tasks ?? []).filter((task) => task.dueDate && task.status !== 'COMPLETED');

export function UpcomingDeadlines({ tasks, loading }: { tasks: Task[] | undefined; loading: boolean }) {
  const upcoming = openTasksWithDates(tasks).slice(0, 6);
  const updateTask = useUpdateTask();
  const [completing, setCompleting] = useState<string | null>(null);
  const complete = async (task: Task) => {
    setCompleting(task.id);
    try {
      await updateTask.mutateAsync({ id: task.id, input: { status: 'COMPLETED' } });
      toast.success(`Completed “${task.name}”`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setCompleting(null);
    }
  };
  return (
    <SectionCard
      icon={CalendarClock}
      title="Upcoming deadlines"
      description="Unfinished tasks, soonest first"
      action={
        <Link
          to="/tasks?sort=dueDate:asc"
          className="text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
        >
          All tasks
        </Link>
      }
    >
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : upcoming.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-8 text-center text-[13px] text-muted-foreground">
          Nothing due. Tasks with a due date will show up here.
        </div>
      ) : (
        <ul className="space-y-1.5">
          {upcoming.map((task, i) => {
            const { label, tone } = countdown(daysUntil(task.dueDate!));
            return (
              <motion.li
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease, delay: 0.15 + i * 0.05 }}
              >
                <div className="group flex items-center gap-2 rounded-xl border bg-card py-1.5 pr-1.5 pl-3 transition-all hover:-translate-y-px hover:border-brand-200 hover:shadow-card">
                  <Link to={`/projects/${task.project.id}`} className="flex min-w-0 flex-1 items-center gap-3 py-1">
                    <span
                      className={cn(
                        'w-[86px] shrink-0 rounded-md px-1.5 py-1 text-center font-mono text-[10.5px]',
                        tone,
                      )}
                    >
                      {label}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{task.name}</span>
                      <span className="block truncate text-[11.5px] text-muted-foreground">{task.project.name}</span>
                    </span>
                    <PriorityBadge priority={task.priority} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => complete(task)}
                    disabled={completing === task.id}
                    aria-label={`Mark ${task.name} as completed`}
                    title="Mark as completed"
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg border text-muted-foreground transition-all hover:border-transparent hover:bg-lime hover:text-lime-ink"
                  >
                    {completing === task.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Check className="size-3.5" />
                    )}
                  </button>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}

/** Tasks due on each of the next 7 days, as animated bars (today in lime). */
export function WorkloadChart({ tasks, loading }: { tasks: Task[] | undefined; loading: boolean }) {
  const navigate = useNavigate();
  const open = openTasksWithDates(tasks);
  const overdue = open.filter((task) => daysUntil(task.dueDate!) < 0).length;
  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(todayUtc() + offset * DAY);
    return {
      offset,
      label: offset === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
      due: open.filter((task) => daysUntil(task.dueDate!) === offset),
    };
  });
  const max = Math.max(1, ...days.map((d) => d.due.length));

  return (
    <SectionCard icon={ChartColumn} title="Next 7 days" description="Open tasks due each day">
      {loading ? (
        <Skeleton className="h-40 w-full rounded-lg" />
      ) : (
        <div className="rounded-xl border p-4">
          <div className="flex h-36 items-end gap-2">
            {days.map((day, i) => (
              <button
                key={day.offset}
                type="button"
                onClick={() => navigate('/tasks?sort=dueDate:asc')}
                aria-label={`${day.label}: ${day.due.length} due. Open tasks by due date`}
                className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {/* Hover card listing what's due that day */}
                {day.due.length > 0 && (
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 w-44 -translate-x-1/2 translate-y-1 rounded-lg border bg-popover p-2 text-left opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="label-mono block text-[9.5px] text-muted-foreground">
                      {day.label} · {day.due.length} due
                    </span>
                    {day.due.slice(0, 3).map((task) => (
                      <span key={task.id} className="mt-1 block truncate text-[11.5px]">
                        {task.name}
                      </span>
                    ))}
                    {day.due.length > 3 && (
                      <span className="mt-1 block text-[11px] text-muted-foreground">+{day.due.length - 3} more</span>
                    )}
                  </span>
                )}
                <span className="font-mono text-[10.5px] text-muted-foreground">{day.due.length || ''}</span>
                <motion.div
                  className={cn(
                    'w-full rounded-md',
                    day.offset === 0
                      ? 'bg-lime'
                      : day.due.length > 0
                        ? 'bg-brand-300 group-hover:bg-brand-400'
                        : 'bg-muted',
                  )}
                  initial={{ height: 4 }}
                  animate={{ height: `${Math.max(6, (day.due.length / max) * 92)}%` }}
                  transition={{ duration: 0.8, ease, delay: 0.2 + i * 0.06 }}
                  style={{ maxHeight: '100%' }}
                />
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            {days.map((day) => (
              <span
                key={day.offset}
                className={cn(
                  'flex-1 text-center text-[10.5px]',
                  day.offset === 0 ? 'font-medium text-foreground' : 'text-muted-foreground',
                )}
              >
                {day.label}
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-3 text-[12px]">
            <span className="text-muted-foreground">
              {days.reduce((sum, d) => sum + d.due.length, 0)} due this week
            </span>
            <span
              className={cn(
                'flex items-center gap-1.5',
                overdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground',
              )}
            >
              <AlarmClock className="size-3.5" /> {overdue} overdue
            </span>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
