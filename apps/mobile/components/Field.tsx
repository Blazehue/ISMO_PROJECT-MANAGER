import { Feather } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { fonts, useTheme } from '@/lib/theme';
import { Text } from './Text';

type FieldProps = TextInputProps & { label: string; error?: string; optional?: boolean; password?: boolean };

/** Labelled text input with inline error and an optional show/hide toggle for passwords. */
export const Field = forwardRef<TextInput, FieldProps>(function Field(
  { label, error, optional, password, style, ...props },
  ref,
) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text variant="label">
        {label}
        {optional && (
          <Text variant="caption" muted>
            {'  '}(optional)
          </Text>
        )}
      </Text>
      <View
        style={[
          styles.inputBox,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : focused ? theme.brand : theme.border,
          },
        ]}
      >
        <TextInput
          ref={ref}
          placeholderTextColor={theme.textMuted}
          selectionColor={theme.brand}
          secureTextEntry={password && !visible}
          accessibilityLabel={label}
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[styles.input, { color: theme.text }, props.multiline && styles.multiline, style]}
        />
        {password && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            style={styles.eye}
          >
            <Feather name={visible ? 'eye-off' : 'eye'} size={17} color={theme.textMuted} />
          </Pressable>
        )}
      </View>
      {error && (
        <Text variant="caption" color={theme.danger} style={{ fontFamily: fonts.medium }}>
          {error}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12 },
  input: { flex: 1, minHeight: 46, paddingHorizontal: 14, fontFamily: fonts.regular, fontSize: 15 },
  multiline: { minHeight: 90, paddingTop: 12, textAlignVertical: 'top' },
  eye: { paddingHorizontal: 14 },
});
