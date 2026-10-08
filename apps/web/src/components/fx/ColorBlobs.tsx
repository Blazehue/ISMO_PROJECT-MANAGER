import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

const blobs = [
  {
    color: 'var(--lime)',
    size: 340,
    x: ['-10%', '8%', '-10%'],
    y: ['0%', '12%', '0%'],
    left: '6%',
    top: '10%',
    duration: 18,
  },
  {
    color: 'var(--brand-300)',
    size: 420,
    x: ['0%', '-12%', '0%'],
    y: ['0%', '8%', '0%'],
    left: '55%',
    top: '0%',
    duration: 22,
  },
  {
    color: '#FFB38A',
    size: 300,
    x: ['0%', '10%', '0%'],
    y: ['0%', '-10%', '0%'],
    left: '30%',
    top: '45%',
    duration: 20,
  },
  {
    color: '#7CC4FF',
    size: 280,
    x: ['0%', '-8%', '0%'],
    y: ['0%', '-6%', '0%'],
    left: '75%',
    top: '50%',
    duration: 24,
  },
];

/** Slowly drifting blurred colour blobs: a living, colourful backdrop. */
export function ColorBlobs({ className, opacity = 0.55 }: { className?: string; opacity?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={{ opacity }}
    >
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{ width: blob.size, height: blob.size, left: blob.left, top: blob.top, background: blob.color }}
          animate={reduceMotion ? undefined : { x: blob.x, y: blob.y }}
          transition={{ duration: blob.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
