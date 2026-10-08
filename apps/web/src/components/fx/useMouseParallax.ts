import { useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'motion/react';
import { useEffect } from 'react';

/** Smoothed pointer position across the window, normalised to -1..1 on each axis. */
export function usePointer() {
  const reduceMotion = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 60, damping: 18 });
  const y = useSpring(my, { stiffness: 60, damping: 18 });

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (event: PointerEvent) => {
      mx.set((event.clientX / window.innerWidth) * 2 - 1);
      my.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [mx, my, reduceMotion]);

  return { x, y };
}

/** Offsets for one parallax layer: deeper layers (larger depth) move further. */
export function useParallaxLayer(pointer: { x: MotionValue<number>; y: MotionValue<number> }, depth: number) {
  return {
    x: useTransform(pointer.x, [-1, 1], [-depth, depth]),
    y: useTransform(pointer.y, [-1, 1], [-depth, depth]),
  };
}
