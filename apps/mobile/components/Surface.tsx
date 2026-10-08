import { StyleSheet, View, type ViewProps } from 'react-native';
import { useTheme } from '@/lib/theme';

/** Bordered card surface. */
export function Surface({ style, ...props }: ViewProps) {
  const { theme } = useTheme();
  return (
    <View {...props} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, style]} />
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
});
