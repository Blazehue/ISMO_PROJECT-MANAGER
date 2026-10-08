import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema, type Project } from '@ismo/shared';
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
import { useCreateProject, useUpdateProject } from '@/hooks/queries';
import { formatDate, toDateInput } from '@/lib/format';
import { applyServerErrors } from '@/lib/forms';
import { projectStatusOptions } from '@/lib/options';

// The same schema the API validates with, from packages/shared.
type FormInput = z.input<typeof createProjectSchema>;
type FormOutput = z.output<typeof createProjectSchema>;

const emptyValues = (): FormInput => ({
  name: '',
  description: '',
  status: 'NOT_STARTED',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
});

const toFormValues = (project: Project): FormInput => ({
  name: project.name,
  description: project.description ?? '',
  status: project.status,
  startDate: toDateInput(project.startDate),
  endDate: toDateInput(project.endDate),
});

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing. */
  project?: Project;
  onSaved?: (project: Project) => void;
}) {
  const isEdit = Boolean(project);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    if (open) {
      reset(project ? toFormValues(project) : emptyValues());
      setFormError(null);
    }
  }, [open, project, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const saved = project
        ? await updateProject.mutateAsync({ id: project.id, input: values })
        : await createProject.mutateAsync(values);
      toast.success(isEdit ? 'Project updated' : 'Project created');
      onOpenChange(false);
      onSaved?.(saved);
    } catch (error) {
      setFormError(applyServerErrors(error, setError));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit project' : 'New project'}</DialogTitle>
          <DialogDescription>
            {project
              ? `Created ${formatDate(project.createdAt)}. Update the project details.`
              : 'Set up a project to group related tasks.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {formError && <FormAlert>{formError}</FormAlert>}
          <FormField id="project-name" label="Project name" error={errors.name?.message}>
            <Input
              id="project-name"
              placeholder="e.g. Organoid imaging pipeline"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
          </FormField>
          <FormField id="project-description" label="Description" optional error={errors.description?.message}>
            <Textarea
              id="project-description"
              rows={3}
              placeholder="What is this project about?"
              {...register('description')}
            />
          </FormField>
          <FormField id="project-status" label="Status" error={errors.status?.message}>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="project-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="project-start" label="Start date" error={errors.startDate?.message}>
              <Input id="project-start" type="date" aria-invalid={!!errors.startDate} {...register('startDate')} />
            </FormField>
            <FormField id="project-end" label="End date" optional error={errors.endDate?.message}>
              <Input id="project-end" type="date" aria-invalid={!!errors.endDate} {...register('endDate')} />
            </FormField>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isEdit ? 'Save changes' : 'Create project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
