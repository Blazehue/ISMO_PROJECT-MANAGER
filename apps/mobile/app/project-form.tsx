import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema, PROJECT_STATUSES, projectStatusTone, type ProjectStatus } from '@ismo/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { z } from 'zod';
import { Button } from '@/components/Button';
import { DateField } from '@/components/DateField';
import { Field } from '@/components/Field';
import { ArrowButton } from '@/components/fx/ArrowButton';
import { Eyebrow } from '@/components/fx/Eyebrow';
import { SlideToConfirm } from '@/components/fx/SlideToConfirm';
import { Notice } from '@/components/Notice';
import { Segmented } from '@/components/Segmented';
import { SkeletonBlock } from '@/components/States';
import { Accent, Text } from '@/components/Text';
import { useToast } from '@/components/Toast';
import { useCreateProject, useDeleteProject, useProject, useUpdateProject } from '@/hooks/queries';
import { getErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { applyServerErrors } from '@/lib/forms';

// The same schema the API validates with (packages/shared).
type FormInput = z.input<typeof createProjectSchema>;
type FormOutput = z.output<typeof createProjectSchema>;

const statusOptions = PROJECT_STATUSES.map((value) => ({ value, label: projectStatusTone[value].label }));
const today = () => new Date().toISOString().slice(0, 10);

export default function ProjectFormScreen() {
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const isEdit = Boolean(projectId);
  const projectQuery = useProject(projectId ?? '', { enabled: isEdit });
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: '', description: '', status: 'NOT_STARTED', startDate: today(), endDate: '' },
  });

  useEffect(() => {
    const project = projectQuery.data;
    if (project) {
      reset({
        name: project.name,
        description: project.description ?? '',
        status: project.status,
        startDate: project.startDate.slice(0, 10),
        endDate: project.endDate ? project.endDate.slice(0, 10) : '',
      });
    }
  }, [projectQuery.data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (projectId) {
        await updateProject.mutateAsync({ id: projectId, input: values });
        toast('Project updated');
        router.back();
      } else {
        const created = await createProject.mutateAsync(values);
        toast('Project created');
        router.replace({ pathname: '/project/[id]', params: { id: created.id } });
      }
    } catch (error) {
      setFormError(applyServerErrors(error, setError));
    }
  });

  const onDelete = () => {
    if (!projectId) return;
    const run = async () => {
      try {
        await deleteProject.mutateAsync(projectId);
        toast('Project deleted');
        router.dismissTo('/projects');
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
            <Accent size={28}>project</Accent>
          </Text>
          {projectQuery.data && (
            <Text variant="mono" muted style={{ marginTop: 6 }}>
              Created {formatDate(projectQuery.data.createdAt)}
            </Text>
          )}
        </View>

        {isEdit && projectQuery.isPending ? (
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
                  label="Project name"
                  value={field.value as string}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.name?.message}
                  placeholder="e.g. Organoid imaging pipeline"
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
                  placeholder="What is this project about?"
                />
              )}
            />
            <View style={{ gap: 6 }}>
              <Text variant="mono" muted>
                Status
              </Text>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Segmented<ProjectStatus>
                    accessibilityLabel="Status"
                    options={statusOptions}
                    value={field.value as ProjectStatus}
                    onChange={field.onChange}
                  />
                )}
              />
            </View>
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <DateField
                  label="Start date"
                  optional={false}
                  value={(field.value as string) ?? ''}
                  onChange={field.onChange}
                  error={errors.startDate?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <DateField
                  label="End date"
                  value={(field.value as string | null) ?? ''}
                  onChange={field.onChange}
                  error={errors.endDate?.message}
                />
              )}
            />

            <View style={{ gap: 10, marginTop: 8 }}>
              <ArrowButton
                title={isEdit ? 'Save changes' : 'Create project'}
                loading={isSubmitting}
                onPress={onSubmit}
              />
              {isEdit && (
                <SlideToConfirm
                  label="Slide to delete project"
                  onConfirm={onDelete}
                  pending={deleteProject.isPending}
                />
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
