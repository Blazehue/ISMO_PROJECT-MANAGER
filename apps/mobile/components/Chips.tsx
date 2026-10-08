import { ScrollView, Pressable, StyleSheet } from 'react-native';
import { fonts, useTheme } from '@/lib/theme';
import { Text } from './Text';

export interface ChipOption {
  value: string;
  label: string;
}

/** Horizontal filter chips. Tapping the active chip clears it. */
export function Chips({
  options,
  value,
  onChange,
  label,
}: {
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const { theme } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityLabel={label}
    >
      {label && (
        <Text variant="mono" muted style={styles.label}>
          {label}
        </Text>
      )}
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(active ? '' : option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              styles.chip,
              {
                backgroundColor: active ? theme.primary : theme.surface,
                borderColor: active ? theme.primary : theme.border,
              },
            ]}
          >
            <Text style={styles.text} color={active ? theme.onPrimary : theme.text}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 6, alignItems: 'center', paddingRight: 16 },
  label: { marginRight: 2, width: 64 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  text: { fontFamily: fonts.medium, fontSize: 12.5 },
});
