import {
  projectStatusTone,
  taskPriorityTone,
  taskStatusTone,
  type BadgeTone,
  type ProjectStatus,
  type TaskPriority,
  type TaskStatus,
} from '@ismo/shared';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

/** Soft pastel pill; the tone carries separate light and dark colours. */
function ToneBadge({ tone, className }: { tone: BadgeTone; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[11.5px] font-medium whitespace-nowrap',
        'bg-(--tone-bg) text-(--tone-fg) dark:bg-(--tone-bg-dark) dark:text-(--tone-fg-dark)',
        className,
      )}
      style={
        {
          '--tone-bg': tone.light.bg,
          '--tone-fg': tone.light.fg,
          '--tone-bg-dark': tone.dark.bg,
          '--tone-fg-dark': tone.dark.fg,
        } as CSSProperties
      }
    >
      {tone.label}
    </span>
  );
}

export const ProjectStatusBadge = ({ status }: { status: ProjectStatus }) => (
  <ToneBadge tone={projectStatusTone[status]} />
);

export const TaskStatusBadge = ({ status }: { status: TaskStatus }) => <ToneBadge tone={taskStatusTone[status]} />;

export const PriorityBadge = ({ priority }: { priority: TaskPriority }) => (
  <ToneBadge tone={taskPriorityTone[priority]} />
);
