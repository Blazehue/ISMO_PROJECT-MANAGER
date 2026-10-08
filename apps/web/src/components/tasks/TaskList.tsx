import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  taskPriorityTone,
  taskStatusTone,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from '@ismo/shared';
import { CalendarDays, Check, ChevronDown, FolderClosed, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { PriorityBadge, TaskStatusBadge } from '@/components/common/ToneBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, isOverdue } from '@/lib/format';
import { ease } from '@/lib/motion';
import { cn } from '@/lib/utils';

const MotionRow = motion.create(TableRow);

const rowMotion = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -12, transition: { duration: 0.2 } },
};

interface TaskListProps {
  tasks: Task[];
  togglingId: string | null;
  onToggleComplete: (task: Task) => void;
  onQuickUpdate: (task: Task, input: { status?: TaskStatus; priority?: TaskPriority }) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  /** Show which project each task belongs to (cross-project list). */
  showProject?: boolean;
}

function DueDate({ task }: { task: Task }) {
  const overdue = isOverdue(task.dueDate, task.status);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap',
        overdue ? 'font-medium text-red-600 dark:text-red-400' : 'text-muted-foreground',
      )}
    >
      <CalendarDays className="size-3.5" strokeWidth={1.7} />
      {formatDate(task.dueDate, 'No due date')}
      {overdue && <span className="text-[11px]">· Overdue</span>}
    </span>
  );
}

function ProjectLink({ task }: { task: Task }) {
  return (
    <Link
      to={`/projects/${task.project.id}`}
      className="inline-flex max-w-full items-center gap-1.5 truncate text-muted-foreground hover:text-foreground"
    >
      <FolderClosed className="size-3.5 shrink-0" strokeWidth={1.7} />
      <span className="truncate">{task.project.name}</span>
    </Link>
  );
}

/** A pill that opens a menu to change the value in place, with no need for the edit dialog. */
function QuickMenu<T extends string>({
  label,
  trigger,
  value,
  options,
  labels,
  onSelect,
}: {
  label: string;
  trigger: ReactNode;
  value: T;
  options: readonly T[];
  labels: Record<T, { label: string }>;
  onSelect: (value: T) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group/pill inline-flex items-center gap-0.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label={label}
      >
        {trigger}
        <ChevronDown className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover/pill:opacity-100 group-focus-visible/pill:opacity-100" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {options.map((option) => (
          <DropdownMenuItem key={option} onClick={() => option !== value && onSelect(option)}>
            {labels[option].label}
            {option === value && <Check className="ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StatusMenu({ task, onSelect }: { task: Task; onSelect: (status: TaskStatus) => void }) {
  return (
    <QuickMenu
      label={`Change status of ${task.name}`}
      trigger={<TaskStatusBadge status={task.status} />}
      value={task.status}
      options={TASK_STATUSES}
      labels={taskStatusTone}
      onSelect={onSelect}
    />
  );
}

function PriorityMenu({ task, onSelect }: { task: Task; onSelect: (priority: TaskPriority) => void }) {
  return (
    <QuickMenu
      label={`Change priority of ${task.name}`}
      trigger={<PriorityBadge priority={task.priority} />}
      value={task.priority}
      options={TASK_PRIORITIES}
      labels={taskPriorityTone}
      onSelect={onSelect}
    />
  );
}

function TaskActions({ task, onEdit, onDelete }: { task: Task; onEdit: () => void; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          aria-label={`Actions for ${task.name}`}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil /> Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CompleteToggle({ task, disabled, onToggle }: { task: Task; disabled: boolean; onToggle: () => void }) {
  const done = task.status === 'COMPLETED';
  return (
    <Checkbox
      checked={done}
      disabled={disabled}
      onCheckedChange={onToggle}
      aria-label={done ? `Mark “${task.name}” as not done` : `Mark “${task.name}” as completed`}
      className="size-[18px] rounded-[5px] data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600 data-[state=checked]:text-white dark:data-[state=checked]:border-brand-400 dark:data-[state=checked]:bg-brand-400"
    />
  );
}

/** Table on desktop, stacked cards on small screens. */
export function TaskList({
  tasks,
  togglingId,
  onToggleComplete,
  onQuickUpdate,
  onEdit,
  onDelete,
  showProject,
}: TaskListProps) {
  return (
    <>
      <div className="surface hidden overflow-hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-subtle hover:bg-subtle">
              <TableHead className="w-11" />
              <TableHead className="label-mono text-[10px] font-normal text-muted-foreground">Task</TableHead>
              {showProject && (
                <TableHead className="w-48 label-mono text-[10px] font-normal text-muted-foreground">Project</TableHead>
              )}
              <TableHead className="w-24 label-mono text-[10px] font-normal text-muted-foreground">Priority</TableHead>
              <TableHead className="w-28 label-mono text-[10px] font-normal text-muted-foreground">Status</TableHead>
              <TableHead className="w-44 label-mono text-[10px] font-normal text-muted-foreground">Due date</TableHead>
              <TableHead className="hidden w-32 label-mono text-[10px] font-normal text-muted-foreground lg:table-cell">
                Created
              </TableHead>
              <TableHead className="w-11" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence initial={false}>
              {tasks.map((task, index) => {
                const done = task.status === 'COMPLETED';
                return (
                  <MotionRow
                    key={task.id}
                    layout="position"
                    {...rowMotion}
                    transition={{ duration: 0.35, ease, delay: Math.min(index, 10) * 0.025 }}
                  >
                    <TableCell className="pl-4">
                      <CompleteToggle
                        task={task}
                        disabled={togglingId === task.id}
                        onToggle={() => onToggleComplete(task)}
                      />
                    </TableCell>
                    <TableCell className="max-w-0 whitespace-normal">
                      <button type="button" onClick={() => onEdit(task)} className="block max-w-full text-left">
                        <span
                          className={cn(
                            'block truncate text-[13.5px] font-medium transition-colors duration-300',
                            done && 'text-muted-foreground line-through',
                          )}
                        >
                          {task.name}
                        </span>
                        {task.description && (
                          <span className="block truncate text-xs text-muted-foreground">{task.description}</span>
                        )}
                      </button>
                    </TableCell>
                    {showProject && (
                      <TableCell className="max-w-0 text-[13px]">
                        <ProjectLink task={task} />
                      </TableCell>
                    )}
                    <TableCell>
                      <PriorityMenu task={task} onSelect={(priority) => onQuickUpdate(task, { priority })} />
                    </TableCell>
                    <TableCell>
                      <StatusMenu task={task} onSelect={(status) => onQuickUpdate(task, { status })} />
                    </TableCell>
                    <TableCell className="text-[13px]">
                      <DueDate task={task} />
                    </TableCell>
                    <TableCell className="hidden text-[13px] whitespace-nowrap text-muted-foreground lg:table-cell">
                      {formatDate(task.createdAt)}
                    </TableCell>
                    <TableCell className="pr-3 text-right">
                      <TaskActions task={task} onEdit={() => onEdit(task)} onDelete={() => onDelete(task)} />
                    </TableCell>
                  </MotionRow>
                );
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-2 md:hidden">
        <AnimatePresence initial={false}>
          {tasks.map((task, index) => {
            const done = task.status === 'COMPLETED';
            return (
              <motion.li
                key={task.id}
                layout="position"
                {...rowMotion}
                transition={{ duration: 0.35, ease, delay: Math.min(index, 10) * 0.03 }}
                className="surface flex gap-3 p-3.5"
              >
                <div className="pt-0.5">
                  <CompleteToggle
                    task={task}
                    disabled={togglingId === task.id}
                    onToggle={() => onToggleComplete(task)}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <button type="button" onClick={() => onEdit(task)} className="block w-full text-left">
                    <span
                      className={cn('block text-[13.5px] font-medium', done && 'text-muted-foreground line-through')}
                    >
                      {task.name}
                    </span>
                    {task.description && (
                      <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                        {task.description}
                      </span>
                    )}
                  </button>
                  {showProject && (
                    <div className="mt-1.5 text-xs">
                      <ProjectLink task={task} />
                    </div>
                  )}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                    <PriorityMenu task={task} onSelect={(priority) => onQuickUpdate(task, { priority })} />
                    <StatusMenu task={task} onSelect={(status) => onQuickUpdate(task, { status })} />
                    <DueDate task={task} />
                    <span className="text-muted-foreground">· Created {formatDate(task.createdAt)}</span>
                  </div>
                </div>
                <TaskActions task={task} onEdit={() => onEdit(task)} onDelete={() => onDelete(task)} />
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </>
  );
}
