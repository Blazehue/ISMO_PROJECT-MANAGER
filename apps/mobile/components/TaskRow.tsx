import { Feather } from '@expo/vector-icons';
import type { Task } from '@ismo/shared';
import { Pressable, StyleSheet, View } from 'react-native';
import { formatDate, isOverdue } from '@/lib/format';
import { fonts, useTheme } from '@/lib/theme';
import { PriorityPill, TaskStatusPill } from './Pill';
import { Text } from './Text';

export function TaskRow({
  task,
  busy,
  onToggle,
  onPress,
  onLongPress,
  showProject,
}: {
  task: Task;
  busy?: boolean;
  onToggle: () => void;
  onPress: () => void;
  onLongPress?: () => void;
  showProject?: boolean;
}) {
  const { theme } = useTheme();
  const done = task.status === 'COMPLETED';
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityHint="Opens the task. Long-press to delete."
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Pressable
        onPress={onToggle}
        disabled={busy}
        hitSlop={12}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done, busy }}
        accessibilityLabel={done ? `Mark ${task.name} as not done` : `Mark ${task.name} as completed`}
        style={[
          styles.check,
          {
            borderColor: done ? theme.brandStrong : theme.border,
            backgroundColor: done ? theme.brandStrong : 'transparent',
          },
          busy && { opacity: 0.5 },
        ]}
      >
        {done && <Feather name="check" size={13} color="#FFFFFF" />}
      </Pressable>

      <View style={{ flex: 1, gap: 8 }}>
        <View>
          <Text
            variant="label"
            numberOfLines={2}
            style={[{ fontSize: 14.5 }, done && { textDecorationLine: 'line-through' }]}
            color={done ? theme.textMuted : theme.text}
          >
            {task.name}
          </Text>
          {showProject && (
            <Text variant="caption" muted numberOfLines={1} style={{ marginTop: 2 }}>
              {task.project.name}
            </Text>
          )}
        </View>
        <View style={styles.meta}>
          <PriorityPill priority={task.priority} />
          <TaskStatusPill status={task.status} />
          <View style={styles.due}>
            <Feather name="calendar" size={11} color={overdue ? theme.danger : theme.textMuted} />
            <Text
              variant="caption"
              style={{ fontSize: 11.5, fontFamily: overdue ? fonts.medium : fonts.regular }}
              color={overdue ? theme.danger : theme.textMuted}
            >
              {formatDate(task.dueDate, 'No due date')}
            </Text>
            <Text variant="caption" muted style={{ fontSize: 11.5 }}>
              · Created {formatDate(task.createdAt)}
            </Text>
            {overdue && (
              <Text variant="mono" color={theme.danger} style={{ fontSize: 9.5 }}>
                · overdue
              </Text>
            )}
          </View>
        </View>
      </View>
      <Feather name="chevron-right" size={16} color={theme.textMuted} style={{ marginTop: 2 }} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 14, padding: 13, alignItems: 'flex-start' },
  check: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  due: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
