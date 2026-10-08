import type { Project } from '@ismo/shared';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useDeleteProject } from '@/hooks/queries';
import { getErrorMessage } from '@/lib/api';

export function DeleteProjectDialog({
  project,
  onOpenChange,
  onDeleted,
}: {
  project: Project | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}) {
  const deleteProject = useDeleteProject();

  const confirm = async () => {
    if (!project) return;
    try {
      await deleteProject.mutateAsync(project.id);
      toast.success(`Deleted “${project.name}”`);
      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <ConfirmDialog
      open={Boolean(project)}
      onOpenChange={onOpenChange}
      title="Delete this project?"
      description={
        project?.taskCount
          ? `“${project.name}” and its ${project.taskCount} ${project.taskCount === 1 ? 'task' : 'tasks'} will be permanently deleted.`
          : `“${project?.name ?? ''}” will be permanently deleted.`
      }
      confirmLabel="Delete project"
      pending={deleteProject.isPending}
      onConfirm={confirm}
    />
  );
}
