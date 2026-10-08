import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { fonts, useTheme } from '@/lib/theme';
import { Text } from '../Text';

const KNOB = 44;

/**
 * Drag the arrow to the end to confirm a destructive action. The knob is also
 * pressable for accessibility (screen readers can activate it directly).
 */
export function SlideToConfirm({
  label,
  onConfirm,
  pending,
}: {
  label: string;
  onConfirm: () => void;
  pending?: boolean;
}) {
  const { theme } = useTheme();
  const [width, setWidth] = useState(0);
  const [done, setDone] = useState(false);
  const x = useSharedValue(0);
  const max = Math.max(0, width - KNOB - 8);

  // If the action fails (pending ends while still mounted), let the user try again.
  useEffect(() => {
    if (pending || !done) return;
    const timer = setTimeout(() => {
      setDone(false);
      x.value = withSpring(0, { damping: 18 });
    }, 1500);
    return () => clearTimeout(timer);
  }, [pending, done, x]);

  const confirm = () => {
    if (done) return;
    setDone(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    onConfirm();
  };

  const pan = Gesture.Pan()
    .enabled(!done)
    .onUpdate((event) => {
      x.value = Math.min(max, Math.max(0, event.translationX));
    })
    .onEnd(() => {
      if (x.value > max * 0.85) {
        x.value = withSpring(max, { damping: 20 });
        runOnJS(confirm)();
      } else {
        x.value = withSpring(0, { damping: 18 });
      }
    });

  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const fill = useAnimatedStyle(() => ({ width: x.value + KNOB }));
  const labelStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, Math.max(1, max * 0.6)], [1, 0]) }));

  return (
    <View
      style={[styles.track, { backgroundColor: theme.dangerSoft }]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <Animated.View style={[styles.fill, { backgroundColor: theme.danger }, fill]} />
      <Animated.View style={[StyleSheet.absoluteFill, styles.labelWrap, labelStyle]} pointerEvents="none">
        <Text style={{ fontFamily: fonts.medium, fontSize: 14 }} color={theme.danger}>
          {label} →
        </Text>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.knob, { backgroundColor: theme.danger }, knob]}>
          <Pressable
            onPress={confirm}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityHint="Double-tap to confirm"
            style={styles.knobInner}
          >
            {pending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Feather name={done ? 'check' : 'arrow-right'} size={18} color="#FFFFFF" />
            )}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 52, borderRadius: 14, padding: 4, justifyContent: 'center', overflow: 'hidden' },
  fill: { position: 'absolute', left: 4, top: 4, bottom: 4, borderRadius: 11, opacity: 0.18 },
  labelWrap: { alignItems: 'center', justifyContent: 'center', paddingLeft: 30 },
  knob: { width: KNOB, height: KNOB, borderRadius: 11 },
  knobInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
