import { Pressable, StyleSheet, View } from 'react-native';
import { fonts, useTheme } from '@/lib/theme';
import { Text } from './Text';

/** Segmented control, e.g. task priority or status. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={[styles.wrap, { backgroundColor: theme.muted }]}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            style={[
              styles.item,
              active && { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 },
            ]}
          >
            <Text style={styles.text} color={active ? theme.text : theme.textMuted}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderRadius: 12, padding: 3, gap: 3 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 9, paddingVertical: 8 },
  text: { fontFamily: fonts.medium, fontSize: 13 },
});
