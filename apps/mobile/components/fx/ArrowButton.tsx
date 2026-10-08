import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { fonts, useTheme } from '@/lib/theme';
import { Text } from '../Text';
import { ArrowTile, playArrow, useArrowIntro } from './ArrowTile';

/** Primary action in the web CTA style: ink pill, chevron tile on the left, centred label. */
export function ArrowButton({
  title,
  onPress,
  loading,
  disabled,
  variant = 'ink',
  style,
}: {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'ink' | 'outline';
  style?: ViewStyle;
}) {
  const { theme } = useTheme();
  const trigger = useSharedValue(0);
  const scale = useSharedValue(1);
  useArrowIntro(trigger);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const ink = variant === 'ink';
  const bg = ink ? theme.primary : theme.surface;
  const fg = ink ? theme.onPrimary : theme.text;

  return (
    <Animated.View style={[animated, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        disabled={disabled || loading}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
          playArrow(trigger);
        }}
        onPressOut={() => (scale.value = withSpring(1, { damping: 20, stiffness: 400 }))}
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onPress?.();
        }}
        style={[
          styles.button,
          { backgroundColor: bg, borderColor: ink ? bg : theme.border, opacity: disabled ? 0.5 : 1 },
        ]}
      >
        <ArrowTile trigger={trigger} bg={ink ? theme.lime : theme.primary} fg={ink ? theme.limeInk : theme.onPrimary} />
        <View style={styles.label}>
          {loading ? (
            <ActivityIndicator color={fg} size="small" />
          ) : (
            <Text style={{ fontFamily: fonts.medium, fontSize: 15 }} color={fg}>
              {title}
            </Text>
          )}
        </View>
        <View style={{ width: 34 }} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  label: { flex: 1, alignItems: 'center' },
});
