import { Feather } from '@expo/vector-icons';
import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/lib/theme';

/** Round arrow that turns from ↗ to → while `active` (e.g. while its card is pressed). */
export function ArrowCircle({ active, size = 28 }: { active: boolean; size?: number }) {
  const { theme } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(active ? 1 : 0, { damping: 16, stiffness: 260 });
  }, [active, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 45}deg` }, { scale: 1 + progress.value * 0.08 }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? theme.primary : theme.muted,
        },
        style,
      ]}
    >
      <Feather name="arrow-up-right" size={size * 0.52} color={active ? theme.onPrimary : theme.text} />
    </Animated.View>
  );
}
