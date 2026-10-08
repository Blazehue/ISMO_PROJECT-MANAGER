import { CloudOff, Fingerprint, RefreshCw, ShieldCheck, Smartphone, type LucideIcon } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { LimeButton } from '@/components/fx/LimeButton';
import { Stagger, StaggerItem } from '@/components/motion/Reveal';
import { SectionHeading } from './SectionHeading';
import { PhoneHome, PhoneProject, PhoneTaskForm } from './PhoneScreens';

const points: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: RefreshCw, title: 'Pull to refresh', body: 'Changes made on the web appear with one pull.' },
  { icon: Fingerprint, title: 'Secure sign-in', body: 'Your session lives in the Android Keystore.' },
  { icon: CloudOff, title: 'Works offline', body: 'Your last synced projects and tasks stay readable.' },
  {
    icon: ShieldCheck,
    title: 'Clear when it matters',
    body: 'Expired sessions and lost signal are explained, never blank.',
  },
];

// Set VITE_APK_URL at build time once the EAS build link exists.
const APK_URL = import.meta.env.VITE_APK_URL as string | undefined;

export function AndroidSection() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  // The three phones fan out as the section scrolls into view.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const spread = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [0, 1]);
  const leftX = useTransform(spread, [0, 1], [90, 0]);
  const rightX = useTransform(spread, [0, 1], [-90, 0]);
  const leftRotate = useTransform(spread, [0, 1], [0, -8]);
  const rightRotate = useTransform(spread, [0, 1], [0, 8]);
  const centerY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [60, 0]);

  return (
    <section id="android" className="scroll-mt-24 overflow-hidden bg-canvas py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <SectionHeading
            icon={Smartphone}
            eyebrow="Android app"
            title={
              <>
                Your projects, <span className="accent">in your pocket.</span>
              </>
            }
            description="The companion app covers what you need away from the desk: check the dashboard, browse projects, and create, update or complete tasks."
          />
          <Stagger className="mt-10 grid gap-3 sm:grid-cols-2" stagger={0.07}>
            {points.map(({ icon: Icon, title, body }) => (
              <StaggerItem
                key={title}
                className="surface group p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-lime text-lime-ink transition-transform duration-500 group-hover:-rotate-12">
                  <Icon className="size-4" strokeWidth={1.8} />
                </span>
                <div className="mt-3 text-[14.5px] font-medium">{title}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {APK_URL ? (
              <LimeButton href={APK_URL}>Download for Android</LimeButton>
            ) : (
              <span className="inline-flex h-12 items-center gap-3 rounded-xl border bg-card py-2 pr-5 pl-3 text-[14px] text-muted-foreground">
                <Smartphone className="size-4" /> Android download link coming soon
              </span>
            )}
            <span className="font-mono text-[11px] text-muted-foreground uppercase">Same account as the web</span>
          </div>
        </div>

        {/* Three real screens, fanned out */}
        <div ref={ref} className="relative mx-auto flex h-[520px] w-full max-w-[560px] items-center justify-center">
          <div className="pointer-events-none absolute inset-10 rounded-full bg-brand-200/50 blur-3xl dark:bg-brand-300/20" />
          <motion.div className="absolute left-0 hidden sm:block" style={{ x: leftX, rotate: leftRotate, scale: 0.86 }}>
            <PhoneProject />
          </motion.div>
          <motion.div
            className="absolute right-0 hidden sm:block"
            style={{ x: rightX, rotate: rightRotate, scale: 0.86 }}
          >
            <PhoneTaskForm />
          </motion.div>
          <motion.div className="relative z-10" style={{ y: centerY }}>
            <PhoneHome />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
