import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { fonts, useTheme } from '@/lib/theme';

export function SearchBar({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  const { theme } = useTheme();
  return (
    <View style={[styles.box, { backgroundColor: theme.muted }]}>
      <Feather name="search" size={16} color={theme.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        selectionColor={theme.brand}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel={placeholder}
        style={[styles.input, { color: theme.text }]}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={10} accessibilityLabel="Clear search">
          <Feather name="x-circle" size={16} color={theme.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingHorizontal: 12, height: 42 },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 14.5, height: 42 },
});
