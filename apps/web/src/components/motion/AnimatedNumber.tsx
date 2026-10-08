import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { ease } from '@/lib/motion';

/** Counts up to `value` when it scrolls into view, and animates to new values afterwards. */
export function AnimatedNumber({ value, duration = 0.9 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);
  const current = useRef(display);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const controls = animate(current.current, value, {
      duration,
      ease,
      onUpdate: (latest) => {
        current.current = latest;
        setDisplay(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [inView, value, duration, reduceMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  );
}
