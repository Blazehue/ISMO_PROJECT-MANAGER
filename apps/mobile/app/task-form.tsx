import { zodResolver } from '@hookform/resolvers/zod';
import {
  createTaskSchema,
  TASK_PRIORITIES,
  TASK_STATUSES,
  taskPriorityTone,
  taskStatusTone,
  type TaskPriority,
  type TaskStatus,
} from '@ismo/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { z } from 'zod';
import { Button } from '@/components/Button';
import { ArrowButton } from '@/components/fx/ArrowButton';
import { Eyebrow } from '@/components/fx/Eyebrow';
import { SlideToConfirm } from '@/components/fx/SlideToConfirm';
import { DateField } from '@/components/DateField';
import { Field } from '@/components/Field';
import { Notice } from '@/components/Notice';
import { Segmented } from '@/components/Segmented';
import { SkeletonBlock } from '@/components/States';
import { Accent, Text } from '@/components/Text';
import { useToast } from '@/components/Toast';
import { useCreateTask, useDeleteTask, useTask, useUpdateTask } from '@/hooks/queries';
import { getErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { applyServerErrors } from '@/lib/forms';

// The same schema the API validates with (packages/shared).
type FormInput = z.input<typeof createTaskSchema>;
type FormOutput = z.output<typeof createTaskSchema>;

const priorityOptions = TASK_PRIORITIES.map((value) => ({ value, label: taskPriorityTone[value].label }));
const statusOptions = TASK_STATUSES.map((value) => ({ value, label: taskStatusTone[value].label }));

export default function TaskFormScreen() {
  const { projectId, taskId } = useLocalSearchParams<{ projectId: string; taskId?: string }>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const isEdit = Boolean(taskId);
  const taskQuery = useTask(taskId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { projectId, name: '', description: '', priority: 'MEDIUM', status: 'PENDING', dueDate: '' },
  });

  useEffect(() => {
    const task = taskQuery.data;
    if (task) {
      reset({
        projectId: task.projectId,
        name: task.name,
        description: task.description ?? '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      });
    }
  }, [taskQuery.data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (taskId) await updateTask.mutateAsync({ id: taskId, input: values });
      else await createTask.mutateAsync(values);
      toast(isEdit ? 'Task updated' : 'Task created');
      router.back();
    } catch (error) {
      setFormError(applyServerErrors(error, setError));
    }
  });

  const onDelete = () => {
    if (!taskId) return;
    const run = async () => {
      try {
        await deleteTask.mutateAsync(taskId);
        toast('Task deleted');
        router.back();
      } catch (error) {
        setFormError(getErrorMessage(error));
      }
    };
    // The slide gesture is the confirmation, so no extra dialog.
    void run();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Eyebrow>{isEdit ? 'Edit' : 'Create'}</Eyebrow>
          <Text variant="display" style={{ marginTop: 6, fontSize: 28 }}>
            {isEdit ? 'Edit ' : 'New '}
            <Accent size={28}>task</Accent>
          </Text>
          {taskQuery.data && (
            <Text variant="mono" muted style={{ marginTop: 6 }}>
              Created {formatDate(taskQuery.data.createdAt)}
            </Text>
          )}
        </View>

        {isEdit && taskQuery.isPending ? (
          <View style={{ gap: 12 }}>
            <SkeletonBlock height={70} />
            <SkeletonBlock height={110} />
            <SkeletonBlock height={70} />
          </View>
        ) : (
          <>
            {formError && <Notice tone="error" message={formError} />}
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Field
                  label="Task name"
                  value={field.value as string}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.name?.message}
                  placeholder="e.g. Calibrate the imaging stage"
                />
              )}
            />
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Field
                  label="Description"
                  optional
                  multiline
                  value={(field.value as string | null) ?? ''}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.description?.message}
                  placeholder="Add any details"
                />
              )}
            />
            <View style={{ gap: 6 }}>
              <Text variant="mono" muted>
                Priority
              </Text>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Segmented<TaskPriority>
                    accessibilityLabel="Priority"
                    options={priorityOptions}
                    value={field.value as TaskPriority}
                    onChange={field.onChange}
                  />
                )}
              />
            </View>
            <View style={{ gap: 6 }}>
              <Text variant="mono" muted>
                Status
              </Text>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Segmented<TaskStatus>
                    accessibilityLabel="Status"
                    options={statusOptions}
                    value={field.value as TaskStatus}
                    onChange={field.onChange}
                  />
                )}
              />
            </View>
            <Controller
              control={control}
              name="dueDate"
              render={({ field }) => (
                <DateField
                  label="Due date"
                  value={(field.value as string | null) ?? ''}
                  onChange={field.onChange}
                  error={errors.dueDate?.message}
                />
              )}
            />

            <View style={{ gap: 10, marginTop: 8 }}>
              <ArrowButton title={isEdit ? 'Save changes' : 'Create task'} loading={isSubmitting} onPress={onSubmit} />
              {isEdit && (
                <SlideToConfirm label="Slide to delete task" onConfirm={onDelete} pending={deleteTask.isPending} />
              )}
              <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 24, gap: 16 },
});
