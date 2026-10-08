import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/lib/theme';
import { Text } from './Text';

/** Mono label + hairline rule + optional action, used above lists ("RECENT PROJECTS ——— View all"). */
export function SectionHeader({ label, action }: { label: string; action?: ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      <Text variant="mono" muted>
        {label}
      </Text>
      <View style={[styles.rule, { backgroundColor: theme.border }]} />
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 26, marginBottom: 10 },
  rule: { flex: 1, height: 1 },
});
