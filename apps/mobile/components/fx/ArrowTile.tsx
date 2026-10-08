import { Feather } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

/**
 * Square tile with chevrons that slide through when `trigger` changes
 * (e.g. on press), like the web CTA tiles.
 */
export function ArrowTile({
  trigger,
  bg,
  fg,
  size = 34,
}: {
  trigger: SharedValue<number>;
  bg: string;
  fg: string;
  size?: number;
}) {
  const out = useAnimatedStyle(() => ({
    transform: [{ translateX: trigger.value * size }],
    opacity: 1 - trigger.value,
  }));
  const incoming = useAnimatedStyle(() => ({
    transform: [{ translateX: (trigger.value - 1) * size }],
    opacity: trigger.value,
  }));

  return (
    <View style={[styles.tile, { width: size, height: size, backgroundColor: bg }]}>
      <Animated.View style={out}>
        <Feather name="arrow-right" size={17} color={fg} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, incoming]}>
        <Feather name="arrow-right" size={17} color={fg} />
      </Animated.View>
    </View>
  );
}

/** Plays the slide-through once: 0 → 1, then snaps back. */
export const playArrow = (trigger: SharedValue<number>) => {
  'worklet';
  trigger.value = withSequence(
    withTiming(1, { duration: 380, easing: Easing.bezier(0.22, 1, 0.36, 1) }),
    withTiming(0, { duration: 0 }),
  );
};

/** Runs the arrow animation once on mount, to draw the eye to the main action. */
export function useArrowIntro(trigger: SharedValue<number>, delay = 600) {
  useEffect(() => {
    const timer = setTimeout(() => playArrow(trigger), delay);
    return () => clearTimeout(timer);
  }, [trigger, delay]);
}

const styles = StyleSheet.create({
  tile: { borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
