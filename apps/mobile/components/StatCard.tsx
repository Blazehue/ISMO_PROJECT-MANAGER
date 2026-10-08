import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme, type Hue } from '@/lib/theme';
import { AnimatedNumber } from './fx/AnimatedNumber';
import { Text } from './Text';

export function StatCard({
  label,
  value,
  icon,
  hint,
  hintColor,
  hue = 'lavender',
}: {
  label: string;
  value: number;
  icon: ComponentProps<typeof Feather>['name'];
  hint?: string;
  hintColor?: string;
  hue?: Hue;
}) {
  const { theme } = useTheme();
  const tone = theme.hues[hue];
  const pressed = useSharedValue(0);
  const card = useAnimatedStyle(() => ({ transform: [{ scale: 1 - pressed.value * 0.03 }] }));
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${pressed.value * 15}deg` }] }));

  return (
    <Animated.View style={[{ flex: 1 }, card]}>
      <Pressable
        onPressIn={() => (pressed.value = withSpring(1))}
        onPressOut={() => (pressed.value = withSpring(0))}
        accessible
        accessibilityLabel={`${label}: ${value}`}
        style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        <View style={styles.top}>
          <Text variant="mono" muted style={{ flex: 1, fontSize: 9.5 }}>
            {label}
          </Text>
          <Animated.View style={[styles.tile, { backgroundColor: tone.bg }, iconStyle]}>
            <Feather name={icon} size={14} color={tone.fg} />
          </Animated.View>
        </View>
        <AnimatedNumber variant="number" value={value} style={{ marginTop: 12 }} />
        {hint && (
          <Text variant="caption" color={hintColor ?? theme.textMuted} style={{ marginTop: 6, fontSize: 11 }}>
            {hint}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 13 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  tile: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
