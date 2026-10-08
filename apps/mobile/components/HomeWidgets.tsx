import { Feather } from '@expo/vector-icons';
import type { Task } from '@ismo/shared';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { fonts, useTheme } from '@/lib/theme';
import { PriorityPill } from './Pill';
import { SkeletonBlock } from './States';
import { Surface } from './Surface';
import { Text } from './Text';

const DAY = 24 * 60 * 60 * 1000;
const todayUtc = () => {
  const d = new Date();
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
};
const daysUntil = (iso: string) => Math.round((Date.parse(iso.slice(0, 10)) - todayUtc()) / DAY);
const open = (tasks: Task[] | undefined) => (tasks ?? []).filter((t) => t.dueDate && t.status !== 'COMPLETED');

/** The next unfinished tasks by due date, with a countdown chip. */
export function UpcomingDeadlines({ tasks, loading }: { tasks: Task[] | undefined; loading: boolean }) {
  const { theme } = useTheme();
  if (loading) return <SkeletonBlock height={180} />;
  const upcoming = open(tasks).slice(0, 4);
  if (upcoming.length === 0) {
    return (
      <Surface>
        <Text variant="caption" muted style={{ textAlign: 'center', paddingVertical: 10 }}>
          Nothing due. Tasks with a due date show up here.
        </Text>
      </Surface>
    );
  }
  return (
    <View style={{ gap: 8 }}>
      {upcoming.map((task, i) => {
        const days = daysUntil(task.dueDate!);
        const chip =
          days < 0
            ? { label: `${-days}d late`, bg: theme.hues.rose.bg, fg: theme.hues.rose.fg }
            : days === 0
              ? { label: 'Today', bg: theme.lime, fg: theme.limeInk }
              : days === 1
                ? { label: 'Tomorrow', bg: theme.hues.peach.bg, fg: theme.hues.peach.fg }
                : { label: `in ${days}d`, bg: theme.muted, fg: theme.textMuted };
        return (
          <Animated.View key={task.id} entering={FadeInRight.delay(120 + i * 60).duration(380)}>
            <Pressable
              onPress={() => router.push({ pathname: '/project/[id]', params: { id: task.project.id } })}
              accessibilityRole="button"
              accessibilityLabel={`${task.name}, ${chip.label}`}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <View style={[styles.chip, { backgroundColor: chip.bg }]}>
                <Text style={{ fontFamily: fonts.mono, fontSize: 10 }} color={chip.fg}>
                  {chip.label}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="label" numberOfLines={1}>
                  {task.name}
                </Text>
                <Text variant="caption" muted numberOfLines={1}>
                  {task.project.name}
                </Text>
              </View>
              <PriorityPill priority={task.priority} />
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

function Bar({ value, max, today, delay }: { value: number; max: number; today: boolean; delay: number }) {
  const { theme } = useTheme();
  const height = useSharedValue(4);
  useEffect(() => {
    height.value = withDelay(
      delay,
      withTiming(Math.max(6, (value / max) * 96), { duration: 700, easing: Easing.bezier(0.22, 1, 0.36, 1) }),
    );
  }, [value, max, delay, height]);
  const style = useAnimatedStyle(() => ({ height: height.value }));
  return (
    <Animated.View
      style={[
        {
          width: '100%',
          borderRadius: 6,
          backgroundColor: today ? theme.lime : value > 0 ? theme.brandTick : theme.muted,
        },
        style,
      ]}
    />
  );
}

/** Open tasks due on each of the next 7 days. */
export function WorkloadChart({ tasks, loading }: { tasks: Task[] | undefined; loading: boolean }) {
  const { theme } = useTheme();
  if (loading) return <SkeletonBlock height={170} />;
  const openTasks = open(tasks);
  const days = Array.from({ length: 7 }, (_, offset) => ({
    offset,
    label:
      offset === 0
        ? 'Today'
        : new Date(todayUtc() + offset * DAY).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
    count: openTasks.filter((t) => daysUntil(t.dueDate!) === offset).length,
  }));
  const max = Math.max(1, ...days.map((d) => d.count));
  const overdue = openTasks.filter((t) => daysUntil(t.dueDate!) < 0).length;

  return (
    <Surface>
      <View style={styles.bars}>
        {days.map((day, i) => (
          <View key={day.offset} style={styles.barCol}>
            <Bar value={day.count} max={max} today={day.offset === 0} delay={150 + i * 60} />
          </View>
        ))}
      </View>
      <View style={styles.labels}>
        {days.map((day) => (
          <Text
            key={day.offset}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 10,
              fontFamily: day.offset === 0 ? fonts.medium : fonts.regular,
            }}
            muted={day.offset !== 0}
          >
            {day.label}
          </Text>
        ))}
      </View>
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Text variant="caption" muted>
          {days.reduce((sum, d) => sum + d.count, 0)} due this week
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Feather name="alert-circle" size={12} color={overdue > 0 ? theme.danger : theme.textMuted} />
          <Text variant="caption" color={overdue > 0 ? theme.danger : theme.textMuted}>
            {overdue} overdue
          </Text>
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 14, padding: 11 },
  chip: { borderRadius: 7, paddingHorizontal: 7, paddingVertical: 4, minWidth: 62, alignItems: 'center' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 100 },
  barCol: { flex: 1, justifyContent: 'flex-end', height: '100%' },
  labels: { flexDirection: 'row', gap: 8, marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, marginTop: 12, paddingTop: 10 },
});
