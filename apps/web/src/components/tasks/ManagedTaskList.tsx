import type { Task, TaskPriority, TaskStatus } from '@ismo/shared';
import { taskPriorityTone, taskStatusTone } from '@ismo/shared';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useDeleteTask, useTask, useUpdateTask } from '@/hooks/queries';
import { getErrorMessage } from '@/lib/api';
import { TaskFormDialog } from './TaskFormDialog';
import { TaskList } from './TaskList';

/** Task list plus its complete / edit / delete behaviour and dialogs. */
export function ManagedTaskList({ tasks, showProject }: { tasks: Task[]; showProject?: boolean }) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [editing, setEditing] = useState<Task | null>(null);
  // Load the latest copy of the task being edited (GET /tasks/:id); the list row is shown until it arrives.
  const { data: latest } = useTask(editing?.id);
  const editingTask = editing && latest?.id === editing.id ? latest : editing;
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const toggleComplete = async (task: Task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    setTogglingId(task.id);
    try {
      await updateTask.mutateAsync({ id: task.id, input: { status: nextStatus } });
      toast.success(nextStatus === 'COMPLETED' ? 'Task completed' : 'Task reopened');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setTogglingId(null);
    }
  };

  const quickUpdate = async (task: Task, input: { status?: TaskStatus; priority?: TaskPriority }) => {
    try {
      await updateTask.mutateAsync({ id: task.id, input });
      toast.success(
        input.status
          ? `Status set to ${taskStatusTone[input.status].label}`
          : `Priority set to ${taskPriorityTone[input.priority!].label}`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteTask.mutateAsync(deleting.id);
      toast.success('Task deleted');
      setDeleting(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <TaskList
        tasks={tasks}
        showProject={showProject}
        togglingId={togglingId}
        onToggleComplete={toggleComplete}
        onQuickUpdate={quickUpdate}
        onEdit={setEditing}
        onDelete={setDeleting}
      />
      <TaskFormDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        projectId={editingTask?.projectId ?? ''}
        task={editingTask ?? undefined}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this task?"
        description={`“${deleting?.name ?? ''}” will be permanently deleted.`}
        confirmLabel="Delete task"
        pending={deleteTask.isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
