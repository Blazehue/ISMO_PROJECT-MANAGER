import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/lib/theme';
import { Text } from './Text';

export function Notice({ tone, message }: { tone: 'error' | 'warning'; message: string }) {
  const { theme } = useTheme();
  const bg = tone === 'error' ? theme.dangerSoft : theme.warningSoft;
  const fg = tone === 'error' ? theme.danger : theme.warningText;
  return (
    <View style={[styles.box, { backgroundColor: bg }]} accessibilityRole="alert">
      <Feather name={tone === 'error' ? 'alert-circle' : 'clock'} size={16} color={fg} style={{ marginTop: 1 }} />
      <Text variant="caption" color={fg} style={{ flex: 1, fontSize: 13, lineHeight: 18 }}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', gap: 10, borderRadius: 12, padding: 12 },
});
