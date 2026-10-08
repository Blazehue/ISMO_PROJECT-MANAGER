import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { Text } from '../Text';

type TextProps = React.ComponentProps<typeof Text>;

/** Counts from the previous value to `value` with an ease-out curve. */
export function AnimatedNumber({ value, duration = 900, ...props }: TextProps & { value: number; duration?: number }) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);
  const from = useRef(display);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const start = Date.now();
    const initial = from.current;
    let frame = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(initial + (value - initial) * eased);
      from.current = next;
      setDisplay(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, reduceMotion]);

  return <Text {...props}>{display}</Text>;
}
