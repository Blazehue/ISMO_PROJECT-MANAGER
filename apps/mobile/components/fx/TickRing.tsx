import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/lib/theme';

const TICKS = 40;

function Ticks({ size, color, count = TICKS, fade }: { size: number; color: string; count?: number; fade?: boolean }) {
  const length = size * 0.09;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: size / 2 - 1,
            top: 0,
            width: 2,
            height: size,
            alignItems: 'center',
            transform: [{ rotate: `${(360 / TICKS) * i}deg` }],
          }}
        >
          <View
            style={{
              width: 2,
              height: i % 4 === 0 ? length * 1.3 : length,
              borderRadius: 1,
              backgroundColor: color,
              opacity: fade ? (i + 1) / count : 1,
            }}
          />
        </View>
      ))}
    </>
  );
}

/** Ring of ticks with a lavender highlight sweeping around it, with content in the middle. */
export function TickRing({ size = 140, children }: { size?: number; children?: ReactNode }) {
  const { theme } = useTheme();
  const reduceMotion = useReducedMotion();
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (!reduceMotion) rotation.value = withRepeat(withTiming(360, { duration: 4000, easing: Easing.linear }), -1);
  }, [reduceMotion, rotation]);

  const sweep = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: size, height: size }}>
        <Ticks size={size} color={theme.border} />
      </View>
      <Animated.View style={[{ position: 'absolute', width: size, height: size }, sweep]}>
        <Ticks size={size} color={theme.brand} count={8} fade />
      </Animated.View>
      {children}
    </View>
  );
}
