import {
  projectStatusTone,
  taskPriorityTone,
  taskStatusTone,
  type BadgeTone,
  type ProjectStatus,
  type TaskPriority,
  type TaskStatus,
} from '@ismo/shared';
import { StyleSheet, View } from 'react-native';
import { fonts, toneColors, useTheme } from '@/lib/theme';
import { Text } from './Text';

export function Pill({ tone }: { tone: BadgeTone }) {
  const { theme } = useTheme();
  const { fg, bg } = toneColors(tone, theme);
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={styles.text} color={fg}>
        {tone.label}
      </Text>
    </View>
  );
}

export const ProjectStatusPill = ({ status }: { status: ProjectStatus }) => <Pill tone={projectStatusTone[status]} />;
export const TaskStatusPill = ({ status }: { status: TaskStatus }) => <Pill tone={taskStatusTone[status]} />;
export const PriorityPill = ({ priority }: { priority: TaskPriority }) => <Pill tone={taskPriorityTone[priority]} />;

const styles = StyleSheet.create({
  pill: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2.5, alignSelf: 'flex-start' },
  text: { fontFamily: fonts.medium, fontSize: 11.5, lineHeight: 15 },
});
