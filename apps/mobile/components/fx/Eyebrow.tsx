import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { Text } from '../Text';

/** Mono "// LABEL" eyebrow. With `rule`, a line draws itself in after the label. */
export function Eyebrow({ children, rule }: { children: string; rule?: boolean }) {
  const { theme } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (rule)
      progress.value = withDelay(150, withTiming(1, { duration: 900, easing: Easing.bezier(0.22, 1, 0.36, 1) }));
  }, [rule, progress]);

  const line = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Text variant="mono" muted>
        {rule ? children : `// ${children}`}
      </Text>
      {rule && (
        <>
          <Animated.View
            style={[{ flex: 1, height: 1, backgroundColor: theme.border, transformOrigin: 'left' }, line]}
          />
          <View style={{ width: 20, height: 10, borderRadius: 10, borderWidth: 1.5, borderColor: theme.textMuted }} />
        </>
      )}
    </View>
  );
}
