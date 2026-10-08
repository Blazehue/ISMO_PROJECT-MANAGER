import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { fonts, useTheme } from '@/lib/theme';
import { Text } from './Text';

type Variant = 'primary' | 'brand' | 'outline' | 'ghost' | 'danger';

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  size = 'md',
  style,
  accessibilityLabel,
}: {
  title?: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: ComponentProps<typeof Feather>['name'];
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  accessibilityLabel?: string;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
    primary: { bg: theme.primary, fg: theme.onPrimary, border: theme.primary },
    brand: { bg: theme.brand, fg: '#FFFFFF', border: theme.brand },
    outline: { bg: theme.surface, fg: theme.text, border: theme.border },
    ghost: { bg: 'transparent', fg: theme.textMuted, border: 'transparent' },
    danger: { bg: theme.dangerSoft, fg: theme.danger, border: theme.dangerSoft },
  };
  const colors = palette[variant];
  const height = size === 'sm' ? 36 : size === 'lg' ? 50 : 44;

  return (
    <Animated.View style={[animated, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        disabled={disabled || loading}
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
          onPress?.();
        }}
        onPressIn={() => (scale.value = withSpring(0.97, { damping: 20, stiffness: 400 }))}
        onPressOut={() => (scale.value = withSpring(1, { damping: 20, stiffness: 400 }))}
        style={[
          styles.base,
          { height, backgroundColor: colors.bg, borderColor: colors.border, opacity: disabled ? 0.5 : 1 },
          !title && { width: height, paddingHorizontal: 0 },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.fg} size="small" />
        ) : (
          <View style={styles.row}>
            {icon && <Feather name={icon} size={size === 'sm' ? 15 : 17} color={colors.fg} />}
            {title && (
              <Text style={{ fontFamily: fonts.medium, fontSize: size === 'sm' ? 13.5 : 15 }} color={colors.fg}>
                {title}
              </Text>
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
