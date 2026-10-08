import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cinema } from '@/lib/cinema';

const ease = [0.76, 0, 0.24, 1] as const;
const INTRO_KEY = 'ismo-intro-played';

/** The six-petal mark, petals blooming in one after another. */
function BloomMark({ size = 72, delay = 0 }: { size?: number; delay?: number }) {
  const petals = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return { cx: 16 + Math.cos(angle) * 7, cy: 16 + Math.sin(angle) * 7 };
  });
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
      {petals.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.cx}
          cy={p.cy}
          r={5}
          fill="#8E7CF8"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ originX: `${p.cx}px`, originY: `${p.cy}px` }}
          transition={{ type: 'spring', stiffness: 260, damping: 14, delay: delay + i * 0.06 }}
        />
      ))}
      <motion.circle
        cx={16}
        cy={16}
        r={4}
        fill="#111113"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.45, duration: 0.3 }}
      />
    </svg>
  );
}

function Wordmark({ delay = 0 }: { delay?: number }) {
  return (
    <div className="flex overflow-hidden text-[56px] leading-none font-medium tracking-[-0.06em] text-white sm:text-[72px]">
      {'ISMO'.split('').map((letter, i) => (
        <motion.span
          key={i}
          initial={{ y: '110%' }}
          animate={{ y: '0%' }}
          transition={{ duration: 0.7, ease, delay: delay + i * 0.06 }}
        >
          {letter}
        </motion.span>
      ))}
      <motion.span
        className="text-lime"
        initial={{ y: '110%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 0.7, ease, delay: delay + 0.3 }}
      >
        .
      </motion.span>
    </div>
  );
}

/**
 * Opening sequence, once per browser session: logo bloom, wordmark, a lime
 * progress sweep, then the curtain lifts to reveal the page. Click or press any
 * key to skip; skipped entirely with reduced motion.
 */
export function IntroOverlay() {
  const [show, setShow] = useState(() => {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
      return sessionStorage.getItem(INTRO_KEY) !== '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!show) return;
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      // ignore
    }
    const timer = setTimeout(() => setShow(false), 1600);
    const skip = () => setShow(false);
    window.addEventListener('keydown', skip, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', skip);
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          onClick={() => setShow(false)}
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-[#111113]"
          initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.85, ease }}
          data-intro
          aria-hidden
        >
          <motion.div
            className="flex flex-col items-center gap-6"
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <BloomMark />
            <Wordmark delay={0.35} />
            <motion.p
              className="font-mono text-[11px] tracking-[0.2em] text-white/50 uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Projects &amp; tasks · web + Android
            </motion.p>
            <div className="h-[2px] w-48 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-lime"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.3, ease: [0.65, 0, 0.35, 1], delay: 0.3 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Closing sequence (logout): the curtain drops with the mark, then lifts on the next screen. */
export function OutroOverlay() {
  const [phase, setPhase] = useState<'idle' | 'cover'>('idle');

  useEffect(
    () =>
      cinema.onOutro((covered) => {
        setPhase('cover');
        // Let the curtain finish covering, hold briefly, then hand over and lift.
        setTimeout(() => {
          covered();
          setTimeout(() => setPhase('idle'), 450);
        }, 750);
      }),
    [],
  );

  return (
    <AnimatePresence>
      {phase === 'cover' && (
        <motion.div
          key="outro"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-[#111113]"
          initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.6, ease }}
          aria-live="polite"
        >
          <BloomMark size={56} delay={0.25} />
          <motion.p
            className="font-mono text-[11px] tracking-[0.2em] text-white/60 uppercase"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Signing you out
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
