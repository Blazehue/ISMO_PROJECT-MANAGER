import { TASK_STATUSES, taskStatusTone, type Task, type TaskStatus } from '@ismo/shared';
import { CalendarDays, GripVertical, Plus } from 'lucide-react';
import { LayoutGroup, motion } from 'motion/react';
import { useState, type DragEvent } from 'react';
import { toast } from 'sonner';
import { PriorityBadge } from '@/components/common/ToneBadge';
import { useUpdateTask } from '@/hooks/queries';
import { getErrorMessage } from '@/lib/api';
import { formatDate, isOverdue } from '@/lib/format';
import { cn } from '@/lib/utils';
import { TaskFormDialog } from './TaskFormDialog';

const columnAccent: Record<TaskStatus, string> = {
  PENDING: 'bg-hue-rose-bg',
  IN_PROGRESS: 'bg-hue-peach-bg',
  COMPLETED: 'bg-hue-mint-bg',
};

/**
 * Kanban board: drag a card to another column to change its status. Moves are
 * shown immediately (optimistic) and saved with PUT /tasks/:id.
 */
export function TaskBoard({ tasks, projectId }: { tasks: Task[]; projectId: string }) {
  const updateTask = useUpdateTask();
  const [pending, setPending] = useState<Record<string, TaskStatus>>({});
  const [dragId, setDragId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);

  const statusOf = (task: Task) => pending[task.id] ?? task.status;

  const move = async (taskId: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || statusOf(task) === status) return;
    setPending((p) => ({ ...p, [taskId]: status }));
    try {
      await updateTask.mutateAsync({ id: taskId, input: { status } });
      toast.success(`Moved to ${taskStatusTone[status].label}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPending(({ [taskId]: _done, ...rest }) => rest);
    }
  };

  const onDrop = (status: TaskStatus) => (event: DragEvent) => {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/task-id');
    setOverColumn(null);
    setDragId(null);
    if (id) void move(id, status);
  };

  return (
    <LayoutGroup>
      <div className="grid gap-3 md:grid-cols-3">
        {TASK_STATUSES.map((status) => {
          const columnTasks = tasks.filter((task) => statusOf(task) === status);
          const tone = taskStatusTone[status];
          return (
            <section
              key={status}
              aria-label={`${tone.label} column`}
              onDragOver={(event) => {
                event.preventDefault();
                setOverColumn(status);
              }}
              onDragLeave={() => setOverColumn((c) => (c === status ? null : c))}
              onDrop={onDrop(status)}
              className={cn(
                'flex min-h-[260px] flex-col rounded-2xl p-2.5 transition-all duration-200',
                columnAccent[status],
                overColumn === status && 'ring-2 ring-brand-400 ring-offset-2 ring-offset-background',
              )}
            >
              <header className="flex items-center justify-between px-1.5 py-1">
                <span className="flex items-center gap-2 text-[13px] font-medium">
                  <span className="size-2 rounded-full" style={{ backgroundColor: tone.solid }} />
                  {tone.label}
                </span>
                <span className="rounded-md bg-card/70 px-1.5 font-mono text-[11px] text-muted-foreground">
                  {columnTasks.length}
                </span>
              </header>
              <div className="mt-2 flex flex-1 flex-col gap-2">
                {columnTasks.map((task) => {
                  const done = status === 'COMPLETED';
                  const overdue = isOverdue(task.dueDate, status);
                  return (
                    <motion.article
                      key={task.id}
                      layout
                      layoutId={`board-${task.id}`}
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      draggable
                      // HTML5 drag-and-drop (desktop); the status menu below is the keyboard-friendly alternative.
                      onDragStart={(event) => {
                        const native = event as unknown as DragEvent;
                        native.dataTransfer.setData('text/task-id', task.id);
                        native.dataTransfer.effectAllowed = 'move';
                        setDragId(task.id);
                      }}
                      onDragEnd={() => setDragId(null)}
                      className={cn(
                        'group cursor-grab rounded-xl border bg-card p-3 shadow-card transition-shadow hover:shadow-md active:cursor-grabbing',
                        dragId === task.id && 'opacity-50',
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-muted-foreground" />
                        <button type="button" onClick={() => setEditing(task)} className="min-w-0 flex-1 text-left">
                          <span
                            className={cn(
                              'block text-[13.5px] leading-snug font-medium',
                              done && 'text-muted-foreground line-through',
                            )}
                          >
                            {task.name}
                          </span>
                          {task.description && (
                            <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                              {task.description}
                            </span>
                          )}
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5 pl-5.5 text-[11.5px]">
                        <PriorityBadge priority={task.priority} />
                        <span
                          className={cn(
                            'flex items-center gap-1',
                            overdue ? 'font-medium text-red-600 dark:text-red-400' : 'text-muted-foreground',
                          )}
                        >
                          <CalendarDays className="size-3" />
                          {formatDate(task.dueDate, 'No date')}
                        </span>
                        <select
                          aria-label={`Move ${task.name}`}
                          value={status}
                          onChange={(event) => void move(task.id, event.target.value as TaskStatus)}
                          className="ml-auto rounded-md border-0 bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                        >
                          {TASK_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {taskStatusTone[s].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.article>
                  );
                })}
                {columnTasks.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-current/10 py-8 text-[12px] text-muted-foreground">
                    <Plus className="mr-1 size-3.5" /> Drop a task here
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
      <TaskFormDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        projectId={projectId}
        task={editing ?? undefined}
      />
    </LayoutGroup>
  );
}
