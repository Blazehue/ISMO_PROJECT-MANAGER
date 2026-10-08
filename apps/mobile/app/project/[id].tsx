import { Feather } from '@expo/vector-icons';
import { TASK_PRIORITIES, TASK_STATUSES, taskPriorityTone, taskStatusTone, type Task } from '@ismo/shared';
import axios from 'axios';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { ArrowButton } from '@/components/fx/ArrowButton';
import { Chips } from '@/components/Chips';
import { ProjectStatusPill } from '@/components/Pill';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState, ErrorState, SkeletonBlock } from '@/components/States';
import { Surface } from '@/components/Surface';
import { TaskRow } from '@/components/TaskRow';
import { Text } from '@/components/Text';
import { TickProgress } from '@/components/TickProgress';
import { useToast } from '@/components/Toast';
import { useDeleteTask, useProject, useTasks, useUpdateTask } from '@/hooks/queries';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { getErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { useTheme } from '@/lib/theme';

const statusOptions = TASK_STATUSES.map((value) => ({ value, label: taskStatusTone[value].label }));
const priorityOptions = TASK_PRIORITIES.map((value) => ({ value, label: taskPriorityTone[value].label }));

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim());

  const projectQuery = useProject(id);
  const tasksQuery = useTasks({
    projectId: id,
    search: debouncedSearch || undefined,
    status: status || undefined,
    priority: priority || undefined,
  });
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const project = projectQuery.data;
  const tasks = tasksQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const total = tasksQuery.data?.pages[0]?.pagination.total;
  const notFound = axios.isAxiosError(projectQuery.error) && projectQuery.error.response?.status === 404;

  const refresh = () => Promise.all([projectQuery.refetch(), tasksQuery.refetch()]);

  const toggle = async (task: Task) => {
    const next = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    setTogglingId(task.id);
    try {
      await updateTask.mutateAsync({ id: task.id, input: { status: next } });
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      toast(next === 'COMPLETED' ? 'Task completed' : 'Task reopened');
    } catch (error) {
      toast(getErrorMessage(error), 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = (task: Task) => {
    const run = async () => {
      try {
        await deleteTask.mutateAsync(task.id);
        toast('Task deleted');
      } catch (error) {
        toast(getErrorMessage(error), 'error');
      }
    };
    if (Platform.OS === 'web') return void run();
    Alert.alert('Delete task?', `"${task.name}" will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void run() },
    ]);
  };

  const openForm = (taskId?: string) =>
    router.push({ pathname: '/task-form', params: taskId ? { projectId: id, taskId } : { projectId: id } });

  const header = (
    <View style={{ gap: 14, marginBottom: 14 }}>
      {project ? (
        <Animated.View entering={FadeInDown.duration(400)}>
          <Surface style={{ gap: 12 }}>
            <View style={{ gap: 8 }}>
              <ProjectStatusPill status={project.status} />
              <Text variant="title" style={{ fontSize: 22, letterSpacing: -0.6 }}>
                {project.name}
              </Text>
              {project.description ? <Text muted>{project.description}</Text> : null}
            </View>
            <View style={[styles.meta, { borderColor: theme.border }]}>
              {[
                ['Start', formatDate(project.startDate)],
                ['End', formatDate(project.endDate, 'Ongoing')],
                ['Created', formatDate(project.createdAt)],
                ['Tasks', `${project.completedTaskCount}/${project.taskCount}`],
              ].map(([label, value]) => (
                <View key={label} style={{ flex: 1 }}>
                  <Text variant="mono" muted style={{ fontSize: 9.5 }}>
                    {label}
                  </Text>
                  <Text variant="label" style={{ marginTop: 2 }}>
                    {value}
                  </Text>
                </View>
              ))}
            </View>
            <TickProgress value={project.progress} />
          </Surface>
        </Animated.View>
      ) : (
        <SkeletonBlock height={190} />
      )}

      <View style={styles.tasksTitle}>
        <Text variant="title" style={{ fontSize: 21 }}>
          Tasks
        </Text>
        {total !== undefined && (
          <View style={[styles.count, { backgroundColor: theme.muted }]}>
            <Text variant="mono" muted>
              {total}
            </Text>
          </View>
        )}
      </View>
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search tasks by name" />
      <Chips options={statusOptions} value={status} onChange={setStatus} label="Status" />
      <Chips options={priorityOptions} value={priority} onChange={setPriority} label="Priority" />
    </View>
  );

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/projects'))}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={[styles.back, { borderColor: theme.border, backgroundColor: theme.surface }]}
        >
          <Feather name="chevron-left" size={20} color={theme.text} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text variant="mono" muted style={{ fontSize: 9.5 }}>
            // Project
          </Text>
          <Text variant="label" numberOfLines={1}>
            {project?.name ?? '…'}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push({ pathname: '/project-form', params: { projectId: id } })}
          disabled={!project}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Edit project"
          style={[
            styles.back,
            { borderColor: theme.border, backgroundColor: theme.surface, opacity: project ? 1 : 0.4 },
          ]}
        >
          <Feather name="edit-2" size={16} color={theme.text} />
        </Pressable>
      </View>

      {projectQuery.isError && !project ? (
        <View style={{ padding: 18 }}>
          {notFound ? (
            <EmptyState
              icon="search"
              title="Project not found"
              description="It may have been deleted, or it belongs to another account."
            />
          ) : (
            <ErrorState error={projectQuery.error} onRetry={refresh} />
          )}
        </View>
      ) : (
        <Animated.FlatList
          data={tasks}
          keyExtractor={(task) => task.id}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
          keyboardShouldPersistTaps="handled"
          itemLayoutAnimation={LinearTransition.springify().damping(20)}
          refreshControl={
            <RefreshControl
              refreshing={projectQuery.isRefetching || tasksQuery.isRefetching}
              onRefresh={refresh}
              tintColor={theme.brand}
              colors={[theme.brand]}
            />
          }
          onEndReachedThreshold={0.4}
          onEndReached={() => tasksQuery.hasNextPage && !tasksQuery.isFetchingNextPage && tasksQuery.fetchNextPage()}
          ListHeaderComponent={header}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(350)}>
              <TaskRow
                task={item}
                busy={togglingId === item.id}
                onToggle={() => toggle(item)}
                onPress={() => openForm(item.id)}
                onLongPress={() => confirmDelete(item)}
              />
            </Animated.View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={
            tasksQuery.isPending ? (
              <View style={{ gap: 8 }}>
                <SkeletonBlock height={78} />
                <SkeletonBlock height={78} />
              </View>
            ) : tasksQuery.isError ? (
              <ErrorState error={tasksQuery.error} onRetry={tasksQuery.refetch} />
            ) : debouncedSearch || status || priority ? (
              <EmptyState
                icon="search"
                title="No matching tasks"
                description="Try a different search or clear the filters."
              />
            ) : (
              <EmptyState
                icon="check-square"
                title="No tasks yet"
                description="Break this project into tasks to track progress."
                action={<ArrowButton title="Add task" onPress={() => openForm()} style={{ width: 200 }} />}
              />
            )
          }
          ListFooterComponent={
            tasksQuery.isFetchingNextPage ? <ActivityIndicator style={{ marginTop: 16 }} color={theme.brand} /> : null
          }
        />
      )}

      {project && (
        <Animated.View entering={ZoomIn.delay(300).springify()} style={[styles.fab, { bottom: insets.bottom + 20 }]}>
          <Button title="Add task" icon="plus" size="lg" onPress={() => openForm()} style={styles.fabShadow} />
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 8 },
  back: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 18, paddingTop: 6 },
  meta: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 10 },
  tasksTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  count: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 1 },
  fab: { position: 'absolute', right: 18 },
  fabShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
