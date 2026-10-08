import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { fonts, useTheme } from '@/lib/theme';
import { Text } from './Text';

const TICK = 2;
const GAP = 3;

/** Striped lavender progress bar (same as the web app), filling in on mount. */
export function TickProgress({ value, height = 14 }: { value: number; height?: number }) {
  const { theme } = useTheme();
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);
  const ticks = Math.max(0, Math.floor(width / (TICK + GAP)));

  useEffect(() => {
    progress.value = withTiming(Math.min(100, Math.max(0, value)) / 100, {
      duration: 900,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [value, progress]);

  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  const tickRow = (color: string) => (
    <View style={styles.ticks}>
      {Array.from({ length: ticks }, (_, i) => (
        <View key={i} style={{ width: TICK, height, backgroundColor: color, marginRight: GAP }} />
      ))}
    </View>
  );

  return (
    <View style={styles.row} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: value }}>
      <View style={[styles.track, { height }]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {tickRow(theme.brandTrack)}
        <Animated.View style={[styles.fill, fill]}>{tickRow(theme.brandTick)}</Animated.View>
      </View>
      <Text style={styles.value} color={theme.brand}>
        {value}
        <Text style={styles.percent} color={theme.brand}>
          %
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  track: { flex: 1, overflow: 'hidden', borderRadius: 2 },
  ticks: { flexDirection: 'row', position: 'absolute', left: 0, top: 0, bottom: 0 },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, overflow: 'hidden' },
  value: { fontFamily: fonts.medium, fontSize: 16, letterSpacing: -0.3, minWidth: 44, textAlign: 'right' },
  percent: { fontFamily: fonts.regular, fontSize: 10 },
});
