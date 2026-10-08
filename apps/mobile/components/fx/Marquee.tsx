import { useEffect, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/**
 * Infinite horizontal ticker. Content is rendered twice; once its width is
 * measured, the row slides left by one copy and repeats seamlessly.
 */
export function Marquee({ children, speed = 40, reverse }: { children: ReactNode; speed?: number; reverse?: boolean }) {
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const offset = useSharedValue(0);

  useEffect(() => {
    if (!width || reduceMotion) return;
    offset.value = 0;
    offset.value = withRepeat(withTiming(1, { duration: (width / speed) * 1000, easing: Easing.linear }), -1);
    return () => cancelAnimation(offset);
  }, [width, speed, reduceMotion, offset]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: (reverse ? offset.value - 1 : -offset.value) * width }],
  }));

  return (
    <View style={{ overflow: 'hidden' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[{ flexDirection: 'row' }, style]}>
        <View style={{ flexDirection: 'row' }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {children}
        </View>
        <View style={{ flexDirection: 'row' }}>{children}</View>
      </Animated.View>
    </View>
  );
}
