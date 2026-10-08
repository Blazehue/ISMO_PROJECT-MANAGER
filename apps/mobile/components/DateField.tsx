import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { formatDate } from '@/lib/format';
import { fonts, useTheme } from '@/lib/theme';
import { Text } from './Text';

/** Date picker that works with `YYYY-MM-DD` strings ('' = no date). */
export function DateField({
  label,
  value,
  onChange,
  error,
  optional = true,
}: {
  label: string;
  optional?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const { theme } = useTheme();
  const [iosOpen, setIosOpen] = useState(false);
  const current = value ? new Date(`${value}T00:00:00Z`) : new Date();

  const pick = (date?: Date) => {
    if (date) onChange(date.toISOString().slice(0, 10));
  };

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode: 'date',
        timeZoneName: 'UTC',
        onChange: (event, date) => event.type === 'set' && pick(date),
      });
    } else {
      setIosOpen((v) => !v);
    }
  };

  const borderColor = error ? theme.danger : theme.border;

  return (
    <View style={{ gap: 6 }}>
      <Text variant="label">
        {label}
        {optional && (
          <Text variant="caption" muted>
            {'  '}(optional)
          </Text>
        )}
      </Text>
      {Platform.OS === 'web' ? (
        // Web is only a dev preview; a plain input keeps it usable.
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.textMuted}
          style={[
            styles.box,
            { borderColor, color: theme.text, backgroundColor: theme.surface, fontFamily: fonts.regular },
          ]}
        />
      ) : (
        <View style={[styles.box, styles.row, { borderColor, backgroundColor: theme.surface }]}>
          <Pressable
            style={styles.trigger}
            onPress={open}
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${value ? formatDate(value) : 'not set'}`}
          >
            <Feather name="calendar" size={16} color={theme.textMuted} />
            <Text color={value ? theme.text : theme.textMuted}>{value ? formatDate(value) : 'Pick a date'}</Text>
          </Pressable>
          {value !== '' && optional && (
            <Pressable onPress={() => onChange('')} hitSlop={10} accessibilityLabel={`Clear ${label}`}>
              <Feather name="x" size={16} color={theme.textMuted} />
            </Pressable>
          )}
        </View>
      )}
      {iosOpen && Platform.OS === 'ios' && (
        <DateTimePicker
          value={current}
          mode="date"
          display="inline"
          timeZoneName="UTC"
          onChange={(_, date) => pick(date)}
        />
      )}
      {error && (
        <Text variant="caption" color={theme.danger}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { minHeight: 46, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center' },
  trigger: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 46 },
});
