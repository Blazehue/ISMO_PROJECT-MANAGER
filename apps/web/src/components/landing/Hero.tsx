import { LayoutList, Monitor, Smartphone } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { ColorBlobs } from '@/components/fx/ColorBlobs';
import { LimeButton } from '@/components/fx/LimeButton';
import { usePointer, useParallaxLayer } from '@/components/fx/useMouseParallax';
import { useAuth } from '@/lib/auth';
import { ease } from '@/lib/motion';
import { StatFloat } from './FloatCards';
import { BrowserMockup } from './MockupParts';
import { PhoneHome } from './PhoneScreens';

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 26, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.9, ease, delay },
});

export function Hero() {
  const { status } = useAuth();
  const signedIn = status === 'authenticated';
  const reduceMotion = useReducedMotion();
  const pointer = usePointer();
  const far = useParallaxLayer(pointer, 10);
  const mid = useParallaxLayer(pointer, 22);
  const near = useParallaxLayer(pointer, 34);

  // The dashboard rises and straightens as it scrolls in; overlapping cards drift at their own pace.
  const dashRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: dashRef, offset: ['start end', 'start 0.3'] });
  const dashY = useTransform(scrollYProgress, [0, 1], [reduceMotion ? 0 : 120, 0]);
  const dashScale = useTransform(scrollYProgress, [0, 1], [reduceMotion ? 1 : 0.9, 1]);
  const dashRotate = useTransform(scrollYProgress, [0, 1], [reduceMotion ? 0 : 8, 0]);
  const cardY = useTransform(scrollYProgress, [0, 1], [reduceMotion ? 0 : 220, -30]);

  return (
    <section className="relative overflow-hidden bg-canvas pt-28 pb-10 sm:pt-32">
      <ColorBlobs opacity={0.35} className="top-[-10%]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.25fr_1fr]">
        {/* Copy */}
        <div>
          <motion.div
            {...rise(0.05)}
            className="inline-flex items-center gap-2 rounded-lg bg-card px-2.5 py-1.5 text-[12.5px] shadow-card"
          >
            <LayoutList className="size-3.5 text-muted-foreground" />
            Projects &amp; tasks, web + Android
          </motion.div>
          <h1 className="mt-6 text-[46px] leading-[1.02] font-normal tracking-[-0.05em] sm:text-[64px] xl:text-[70px]">
            <motion.span {...rise(0.15)} className="block whitespace-nowrap">
              Know your projects.
            </motion.span>
            <motion.span {...rise(0.3)} className="block">
              Ship with <span className="accent">clarity.</span>
            </motion.span>
          </h1>
          <motion.p {...rise(0.45)} className="mt-6 max-w-md text-[16.5px] leading-relaxed text-muted-foreground">
            Track every project, task and deadline in one clean view, on the web at your desk and on Android at the
            bench.
          </motion.p>
          <motion.div {...rise(0.6)} className="mt-9 flex flex-wrap items-center gap-5">
            <LimeButton to={signedIn ? '/dashboard' : '/register'} size="lg">
              {signedIn ? 'Open dashboard' : 'Get started'}
            </LimeButton>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[Monitor, Smartphone].map((Icon, i) => (
                  <span
                    key={i}
                    className="flex size-9 items-center justify-center rounded-full border-2 border-canvas bg-card shadow-card"
                  >
                    <Icon className="size-4 text-muted-foreground" />
                  </span>
                ))}
                <span className="flex size-9 items-center justify-center rounded-full border-2 border-canvas bg-lime text-[10px] font-semibold text-lime-ink">
                  1
                </span>
              </div>
              <span className="max-w-[120px] text-[12px] leading-tight text-muted-foreground">
                One account, two apps
              </span>
            </div>
          </motion.div>
        </div>

        {/* Visual: phone + floating cards with pointer parallax */}
        <div className="relative mx-auto h-[520px] w-full max-w-[460px]">
          <motion.div
            style={far}
            className="absolute inset-x-6 top-10 bottom-0 rounded-[40px] bg-[radial-gradient(circle_at_30%_25%,var(--lime),transparent_45%),radial-gradient(circle_at_75%_70%,var(--brand-300),transparent_55%),linear-gradient(160deg,var(--card),var(--canvas))] opacity-90"
          />
          <motion.div
            className="absolute top-2 left-1/2 -ml-[118px]"
            initial={{ opacity: 0, y: 60, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 1, ease, delay: 0.35 }}
          >
            <motion.div style={mid}>
              <PhoneHome />
            </motion.div>
          </motion.div>
          <motion.div
            className="absolute bottom-16 -left-2 sm:-left-8"
            initial={{ opacity: 0, scale: 0.8, rotate: -14 }}
            animate={{ opacity: 1, scale: 1, rotate: -7 }}
            transition={{ type: 'spring', stiffness: 160, damping: 16, delay: 0.75 }}
          >
            <motion.div
              style={near}
              animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <StatFloat title="Completion" caption="Tasks done this month" change="+12%" value="82" unit="%" />
            </motion.div>
          </motion.div>
          <motion.div
            className="absolute top-24 -right-2 sm:-right-6"
            initial={{ opacity: 0, scale: 0.8, rotate: 14 }}
            animate={{ opacity: 1, scale: 1, rotate: 7 }}
            transition={{ type: 'spring', stiffness: 160, damping: 16, delay: 0.9 }}
          >
            <motion.div
              style={near}
              animate={reduceMotion ? undefined : { y: [0, 12, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <StatFloat title="On time" caption="Deadlines met" change="+6%" value="96" unit="%" days />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Dashboard rising from below, framed like the reference */}
      <div ref={dashRef} className="relative mx-auto mt-16 max-w-6xl px-5 [perspective:1600px] sm:px-8">
        <motion.div
          style={{ y: dashY, scale: dashScale, rotateX: dashRotate, transformOrigin: 'center top' }}
          className="rounded-[28px] bg-white/50 p-2.5 shadow-[0_40px_120px_-40px_rgb(36_36_38/0.45)] ring-1 ring-white/70 backdrop-blur dark:bg-white/5 dark:ring-white/10"
        >
          <BrowserMockup />
        </motion.div>
        <motion.div style={{ y: cardY }} className="absolute top-10 right-10 hidden rotate-[5deg] lg:block">
          <StatFloat title="Progress" caption="Across 12 projects" change="+18%" value="64" unit="%" />
        </motion.div>
      </div>
    </section>
  );
}
