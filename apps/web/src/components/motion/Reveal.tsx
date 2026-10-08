import { motion, type HTMLMotionProps } from 'motion/react';
import { ease, fadeUp, staggerContainer } from '@/lib/motion';

type DivProps = HTMLMotionProps<'div'>;

/** Fades and lifts its content in the first time it scrolls into view. */
export function Reveal({ delay = 0, y = 14, ...props }: DivProps & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.55, ease, delay }}
      {...props}
    />
  );
}

/** Container whose <StaggerItem> children reveal one after another. */
export function Stagger({
  stagger = 0.06,
  delay = 0,
  inView = true,
  ...props
}: DivProps & { stagger?: number; delay?: number; inView?: boolean }) {
  return (
    <motion.div
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      {...(inView
        ? { whileInView: 'visible', viewport: { once: true, margin: '0px 0px -40px 0px' } }
        : { animate: 'visible' })}
      {...props}
    />
  );
}

export function StaggerItem(props: DivProps) {
  return <motion.div variants={fadeUp} {...props} />;
}
