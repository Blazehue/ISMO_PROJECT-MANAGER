import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/** Small "live" dot with a soft ping ring. */
export function PulseDot({ color, size = 7 }: { color: string; size?: number }) {
  const reduceMotion = useReducedMotion();
  const ping = useSharedValue(0);

  useEffect(() => {
    if (!reduceMotion) ping.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }), -1);
  }, [ping, reduceMotion]);

  const ring = useAnimatedStyle(() => ({
    opacity: 0.6 * (1 - ping.value),
    transform: [{ scale: 1 + ping.value * 1.6 }],
  }));

  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden>
      <Animated.View style={[{ position: 'absolute', inset: 0, borderRadius: size, backgroundColor: color }, ring]} />
      <View style={{ width: size, height: size, borderRadius: size, backgroundColor: color }} />
    </View>
  );
}
