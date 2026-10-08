import { zodResolver } from '@hookform/resolvers/zod';
import { createTaskSchema, type Task } from '@ismo/shared';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { FormAlert } from '@/components/common/FormAlert';
import { FormField } from '@/components/common/FormField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTask, useProjects, useUpdateTask } from '@/hooks/queries';
import { formatDate, toDateInput } from '@/lib/format';
import { applyServerErrors } from '@/lib/forms';
import { taskPriorityOptions, taskStatusOptions } from '@/lib/options';

type FormInput = z.input<typeof createTaskSchema>;
type FormOutput = z.output<typeof createTaskSchema>;

const toFormValues = (projectId: string | undefined, task?: Task): FormInput =>
  task
    ? {
        projectId: task.projectId,
        name: task.name,
        description: task.description ?? '',
        priority: task.priority,
        status: task.status,
        dueDate: toDateInput(task.dueDate),
      }
    : { projectId: projectId ?? '', name: '', description: '', priority: 'MEDIUM', status: 'PENDING', dueDate: '' };

export function TaskFormDialog({
  open,
  onOpenChange,
  projectId,
  task,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to let the user pick the project (e.g. "New task" from anywhere). */
  projectId?: string;
  task?: Task;
}) {
  const isEdit = Boolean(task);
  const chooseProject = !projectId && !task;
  const projectsQuery = useProjects(
    { page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc' },
    { enabled: chooseProject && open },
  );
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: toFormValues(projectId),
  });

  // Reset only when the dialog opens or the task itself changed (a fresher copy
  // with an identical `updatedAt` must not wipe what the user is typing).
  const taskVersion = task ? `${task.id}:${task.updatedAt}` : 'new';
  useEffect(() => {
    if (open) {
      reset(toFormValues(projectId, task));
      setFormError(null);
    }
  }, [open, projectId, taskVersion, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (task) await updateTask.mutateAsync({ id: task.id, input: values });
      else await createTask.mutateAsync(values);
      toast.success(isEdit ? 'Task updated' : 'Task created');
      onOpenChange(false);
    } catch (error) {
      setFormError(applyServerErrors(error, setError));
    }
  });

  const selectField = (name: 'priority' | 'status', id: string, options: { value: string; label: string }[]) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select value={field.value as string} onValueChange={field.onChange}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit task' : 'New task'}</DialogTitle>
          <DialogDescription>
            {task ? `Created ${formatDate(task.createdAt)}. Update the task details.` : 'Add a task to this project.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {formError && <FormAlert>{formError}</FormAlert>}
          {chooseProject && (
            <FormField id="task-project" label="Project" error={errors.projectId?.message}>
              <Controller
                control={control}
                name="projectId"
                render={({ field }) => (
                  <Select value={(field.value as string) || undefined} onValueChange={field.onChange}>
                    <SelectTrigger id="task-project" className="w-full" aria-invalid={!!errors.projectId}>
                      <SelectValue placeholder={projectsQuery.isPending ? 'Loading projects…' : 'Choose a project'} />
                    </SelectTrigger>
                    <SelectContent>
                      {projectsQuery.data?.data.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          )}
          <FormField id="task-name" label="Task name" error={errors.name?.message}>
            <Input
              id="task-name"
              placeholder="e.g. Calibrate the imaging stage"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
          </FormField>
          <FormField id="task-description" label="Description" optional error={errors.description?.message}>
            <Textarea id="task-description" rows={3} placeholder="Add any details" {...register('description')} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField id="task-priority" label="Priority" error={errors.priority?.message}>
              {selectField('priority', 'task-priority', taskPriorityOptions)}
            </FormField>
            <FormField id="task-status" label="Status" error={errors.status?.message}>
              {selectField('status', 'task-status', taskStatusOptions)}
            </FormField>
            <FormField id="task-due" label="Due date" optional error={errors.dueDate?.message}>
              <Input id="task-due" type="date" aria-invalid={!!errors.dueDate} {...register('dueDate')} />
            </FormField>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isEdit ? 'Save changes' : 'Create task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
