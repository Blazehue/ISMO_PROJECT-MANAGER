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

/** Eight-spoke asterisk (four rotated bars); spins slowly when `spin` is set. */
export function Asterisk({ size = 16, color, spin }: { size?: number; color: string; spin?: boolean }) {
  const reduceMotion = useReducedMotion();
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (spin && !reduceMotion)
      rotation.value = withRepeat(withTiming(360, { duration: 12000, easing: Easing.linear }), -1);
  }, [spin, reduceMotion, rotation]);

  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  const bar = size * 0.14;

  return (
    <Animated.View style={[{ width: size, height: size }, style]}>
      {[0, 45, 90, 135].map((angle) => (
        <View
          key={angle}
          style={{
            position: 'absolute',
            left: size / 2 - bar / 2,
            top: 0,
            width: bar,
            height: size,
            borderRadius: bar,
            backgroundColor: color,
            transform: [{ rotate: `${angle}deg` }],
          }}
        />
      ))}
    </Animated.View>
  );
}
