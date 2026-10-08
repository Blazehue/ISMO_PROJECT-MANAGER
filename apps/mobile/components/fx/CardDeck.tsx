import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { fonts, useTheme } from '@/lib/theme';
import { Text } from '../Text';

interface DeckCard {
  title: string;
  caption: string;
  change: string;
  value: string;
  unit: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  tilt: number;
}

const cards: DeckCard[] = [
  {
    title: 'Completion',
    caption: 'Tasks done this month',
    change: '+12%',
    value: '82',
    unit: '%',
    icon: 'trending-up',
    tilt: -4,
  },
  { title: 'On time', caption: 'Deadlines met', change: '+6%', value: '96', unit: '%', icon: 'calendar', tilt: 3 },
  {
    title: 'In progress',
    caption: 'Across 12 projects',
    change: '+3',
    value: '7',
    unit: ' projects',
    icon: 'zap',
    tilt: -2,
  },
];

function Card({ card, depth, count }: { card: DeckCard; depth: number; count: number }) {
  const { theme } = useTheme();
  const y = useSharedValue(depth * -16);
  const scale = useSharedValue(1 - depth * 0.06);
  const opacity = useSharedValue(1 - depth * 0.25);
  const rotate = useSharedValue(depth === 0 ? card.tilt : 0);
  const previous = useSharedValue(depth);

  useEffect(() => {
    const target = { y: depth * -16, scale: 1 - depth * 0.06, opacity: 1 - depth * 0.25 };
    const spring = { damping: 16, stiffness: 140 };
    if (previous.value === 0 && depth === count - 1) {
      // Front card flies down and away, then settles at the back of the deck.
      y.value = withSequence(
        withTiming(70, { duration: 260, easing: Easing.in(Easing.quad) }),
        withSpring(target.y, spring),
      );
      opacity.value = withSequence(withTiming(0, { duration: 260 }), withTiming(target.opacity, { duration: 300 }));
    } else {
      y.value = withSpring(target.y, spring);
      opacity.value = withTiming(target.opacity, { duration: 300 });
    }
    scale.value = withSpring(target.scale, spring);
    rotate.value = withSpring(depth === 0 ? card.tilt : 0, spring);
    previous.value = depth;
  }, [depth, count, card.tilt, y, scale, opacity, rotate, previous]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }, { scale: scale.value }, { rotate: `${rotate.value}deg` }],
    zIndex: count - depth,
  }));

  return (
    <Animated.View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, style]}>
      <View style={styles.top}>
        <View>
          <Text variant="label">{card.title}</Text>
          <Text variant="caption" muted>
            {card.caption}
          </Text>
        </View>
        <View style={[styles.change, { backgroundColor: theme.muted }]}>
          <Text style={{ fontSize: 10.5 }} muted>
            {card.change}
          </Text>
        </View>
      </View>
      <View style={styles.bottom}>
        <Text style={{ fontFamily: fonts.regular, fontSize: 40, letterSpacing: -1.8, lineHeight: 44 }}>
          {card.value}
          <Text style={{ fontSize: 18 }} muted>
            {card.unit}
          </Text>
        </Text>
        <View style={[styles.icon, { backgroundColor: theme.lime }]}>
          <Feather name={card.icon} size={16} color={theme.limeInk} />
        </View>
      </View>
    </Animated.View>
  );
}

/** Stack of floating stat cards; the front one cycles to the back every few seconds. */
export function CardDeck() {
  const reduceMotion = useReducedMotion();
  const [front, setFront] = useState(0);
  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(() => setFront((f) => (f + 1) % cards.length), 2800);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  return (
    <View style={styles.deck} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {cards.map((card, i) => (
        <Card key={card.title} card={card} depth={(i - front + cards.length) % cards.length} count={cards.length} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  deck: { height: 190, marginTop: 34, alignItems: 'center' },
  card: {
    position: 'absolute',
    top: 32,
    width: '92%',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#242426',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  change: { borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 22 },
  icon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
