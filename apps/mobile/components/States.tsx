import { Feather } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { getErrorMessage, isNetworkError } from '@/lib/api';
import { useTheme } from '@/lib/theme';
import { Button } from './Button';
import { Text } from './Text';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ComponentProps<typeof Feather>['name'];
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const { theme } = useTheme();
  const reduceMotion = useReducedMotion();
  const float = useSharedValue(0);
  useEffect(() => {
    if (!reduceMotion)
      float.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [float, reduceMotion]);
  const floating = useAnimatedStyle(() => ({ transform: [{ translateY: -5 * float.value }] }));

  return (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.box, { borderColor: theme.border }]}>
      <Animated.View style={[styles.icon, { backgroundColor: theme.subtle, borderColor: theme.border }, floating]}>
        <Feather name={icon} size={20} color={theme.textMuted} />
      </Animated.View>
      <Text variant="heading" style={styles.center}>
        {title}
      </Text>
      <Text variant="caption" muted style={[styles.center, { marginTop: 4, maxWidth: 260 }]}>
        {description}
      </Text>
      {action && <View style={{ marginTop: 16 }}>{action}</View>}
    </Animated.View>
  );
}

/** Error with a clear message. Offline errors say so explicitly instead of failing blank. */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const offline = isNetworkError(error);
  return (
    <EmptyState
      icon={offline ? 'wifi-off' : 'alert-triangle'}
      title={offline ? "You're offline" : "Couldn't load this"}
      description={offline ? 'Check your internet connection and try again.' : getErrorMessage(error)}
      action={
        onRetry ? (
          <Button title="Try again" icon="refresh-cw" variant="outline" size="sm" onPress={onRetry} />
        ) : undefined
      }
    />
  );
}

export function SkeletonBlock({ height, radius = 14 }: { height: number; radius?: number }) {
  const { theme } = useTheme();
  return <View style={{ height, borderRadius: radius, backgroundColor: theme.muted }} />;
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  center: { textAlign: 'center' },
});
