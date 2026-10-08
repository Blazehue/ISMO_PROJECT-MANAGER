import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type HTMLMotionProps } from 'motion/react';
import type { MouseEvent } from 'react';

/** Tilts in 3D towards the cursor and settles back on leave. */
export function TiltCard({ children, max = 8, style, ...props }: HTMLMotionProps<'div'> & { max?: number }) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(y, [0, 1], [max, -max]), { stiffness: 220, damping: 20 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-max, max]), { stiffness: 220, damping: 20 });

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width);
    y.set((event.clientY - rect.top) / rect.height);
  };
  const reset = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      onMouseMove={reduceMotion ? undefined : onMove}
      onMouseLeave={reset}
      style={{
        rotateX: reduceMotion ? 0 : rotateX,
        rotateY: reduceMotion ? 0 : rotateY,
        transformPerspective: 900,
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
