import { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { cinema } from '@/lib/cinema';
import { fonts } from '@/lib/theme';
import { Text } from '../Text';

const INK = '#111113';
const LAVENDER = '#8E7CF8';
const LIME = '#D9FF5C';
const curve = Easing.bezier(0.76, 0, 0.24, 1);

function Petal({ index, size }: { index: number; size: number }) {
  const scale = useSharedValue(0);
  useEffect(() => {
    scale.value = withDelay(index * 60, withSpring(1, { damping: 12, stiffness: 220 }));
  }, [index, scale]);
  const unit = size / 32;
  const angle = (Math.PI / 3) * index - Math.PI / 2;
  const r = 5 * unit;
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          backgroundColor: LAVENDER,
          left: size / 2 + Math.cos(angle) * 7 * unit - r,
          top: size / 2 + Math.sin(angle) * 7 * unit - r,
        },
        style,
      ]}
    />
  );
}

function BloomMark({ size = 72 }: { size?: number }) {
  const unit = size / 32;
  return (
    <View style={{ width: size, height: size }}>
      {Array.from({ length: 6 }, (_, i) => (
        <Petal key={i} index={i} size={size} />
      ))}
      <View
        style={{
          position: 'absolute',
          width: 8 * unit,
          height: 8 * unit,
          borderRadius: size,
          left: size / 2 - 4 * unit,
          top: size / 2 - 4 * unit,
          backgroundColor: INK,
        }}
      />
    </View>
  );
}

function RisingWord() {
  const y = useSharedValue(60);
  const opacity = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(320, withTiming(0, { duration: 650, easing: curve }));
    opacity.value = withDelay(320, withTiming(1, { duration: 400 }));
  }, [y, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: y.value }] }));
  return (
    <View style={{ overflow: 'hidden', paddingHorizontal: 4 }}>
      <Animated.View style={style}>
        <Text style={{ fontFamily: fonts.medium, fontSize: 56, letterSpacing: -3, lineHeight: 64 }} color="#FFFFFF">
          ISMO
          <Text style={{ fontFamily: fonts.medium, fontSize: 56 }} color={LIME}>
            .
          </Text>
        </Text>
      </Animated.View>
    </View>
  );
}

function ProgressSweep() {
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withDelay(250, withTiming(1, { duration: 1200, easing: Easing.bezier(0.65, 0, 0.35, 1) }));
  }, [width]);
  const style = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));
  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, style]} />
    </View>
  );
}

/** Launch sequence: bloom, wordmark, lime sweep, then the curtain lifts off the app. */
export function AppIntro() {
  const reduceMotion = useReducedMotion();
  const { height } = useWindowDimensions();
  const [visible, setVisible] = useState(!reduceMotion);
  const lift = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    lift.value = withDelay(
      1500,
      withTiming(1, { duration: 750, easing: curve }, (finished) => finished && runOnJS(setVisible)(false)),
    );
  }, [visible, lift]);

  const curtain = useAnimatedStyle(() => ({ transform: [{ translateY: -lift.value * height }] }));
  const content = useAnimatedStyle(() => ({
    opacity: 1 - lift.value * 1.6,
    transform: [{ translateY: -lift.value * 60 }],
  }));

  if (!visible) return null;
  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.stage, curtain]}
      pointerEvents="none"
      accessibilityElementsHidden
    >
      <Animated.View style={[styles.center, content]}>
        <BloomMark />
        <RisingWord />
        <Text style={styles.caption}>Projects & tasks · web + Android</Text>
        <ProgressSweep />
      </Animated.View>
    </Animated.View>
  );
}

/** Closing curtain for logout: rises over the screen, then lifts off onto the welcome screen. */
export function AppOutro() {
  const { height } = useWindowDimensions();
  const [active, setActive] = useState(false);
  const y = useSharedValue(height);

  useEffect(
    () =>
      cinema.onOutro((covered) => {
        setActive(true);
        y.value = height;
        y.value = withTiming(0, { duration: 520, easing: curve }, (finished) => {
          if (!finished) return;
          runOnJS(covered)();
          y.value = withDelay(
            500,
            withTiming(-height, { duration: 600, easing: curve }, (done) => done && runOnJS(setActive)(false)),
          );
        });
      }),
    [height, y],
  );

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  if (!active) return null;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.stage, style]} pointerEvents="none">
      <View style={styles.center}>
        <BloomMark size={56} />
        <Text style={styles.caption}>Signing you out</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stage: { backgroundColor: INK, zIndex: 1000, elevation: 1000, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', gap: 18 },
  caption: {
    fontFamily: fonts.mono,
    fontSize: 10.5,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
  },
  track: { width: 180, height: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: LIME },
});
