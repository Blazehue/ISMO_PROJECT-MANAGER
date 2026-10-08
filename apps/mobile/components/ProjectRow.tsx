import { Feather } from '@expo/vector-icons';
import type { Project } from '@ismo/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { formatDate } from '@/lib/format';
import { useTheme } from '@/lib/theme';
import { ArrowCircle } from './fx/ArrowCircle';
import { ProjectStatusPill } from './Pill';
import { Text } from './Text';
import { TickProgress } from './TickProgress';

export function ProjectRow({ project }: { project: Project }) {
  const { theme } = useTheme();
  const [pressed, setPressed] = useState(false);
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animated}>
      <Pressable
        onPress={() => router.push({ pathname: '/project/[id]', params: { id: project.id } })}
        onPressIn={() => {
          setPressed(true);
          scale.value = withSpring(0.98, { damping: 20, stiffness: 400 });
        }}
        onPressOut={() => {
          setPressed(false);
          scale.value = withSpring(1, { damping: 20, stiffness: 400 });
        }}
        accessibilityRole="button"
        accessibilityLabel={`${project.name}, ${project.progress}% complete`}
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: pressed ? theme.brandTrack : theme.border },
        ]}
      >
        <View style={styles.top}>
          <View style={{ flex: 1, gap: 6 }}>
            <ProjectStatusPill status={project.status} />
            <Text variant="label" numberOfLines={1} style={{ fontSize: 15 }}>
              {project.name}
            </Text>
          </View>
          <ArrowCircle active={pressed} />
        </View>
        <View style={{ marginTop: 12 }}>
          <TickProgress value={project.progress} height={12} />
        </View>
        <View style={[styles.meta, { borderTopColor: theme.border }]}>
          <Feather name="check-square" size={11} color={theme.textMuted} />
          <Text variant="mono" muted style={{ fontSize: 10 }}>
            {project.completedTaskCount}/{project.taskCount} tasks
          </Text>
          <Feather name="calendar" size={11} color={theme.textMuted} style={{ marginLeft: 10 }} />
          <Text variant="caption" muted style={{ fontSize: 11.5 }}>
            {project.endDate ? `Due ${formatDate(project.endDate)}` : 'No end date'}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 13 },
  top: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 12, paddingTop: 10, borderTopWidth: 1 },
});
