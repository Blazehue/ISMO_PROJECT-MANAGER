import {
  AlarmClock,
  ArrowDownUp,
  Bell,
  CalendarClock,
  Check,
  CircleAlert,
  Cpu,
  FlaskConical,
  FolderKanban,
  Microscope,
  Package,
  Radio,
  RefreshCw,
  Shield,
  Tags,
  TestTubes,
  type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SpotlightCard } from '@/components/fx/SpotlightCard';
import { Toggle } from '@/components/fx/Toggle';
import { Reveal } from '@/components/motion/Reveal';
import { ease } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { pillTone } from './MockupParts';

function WidgetCard({
  chipIcon: ChipIcon,
  chip,
  title,
  body,
  light,
  children,
  className,
}: {
  chipIcon: LucideIcon;
  chip: string;
  title: string;
  body: string;
  light?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <SpotlightCard
      color={light ? 'var(--brand-300)' : 'var(--lime)'}
      className={cn(
        'h-[400px] rounded-[26px] text-center',
        light
          ? 'bg-[linear-gradient(180deg,#ffffff,#eef1f7)] text-[#242426]'
          : 'bg-[radial-gradient(120%_80%_at_50%_0%,#5b6b85,#3a4150_60%,#2b2f38)] text-white',
        className,
      )}
    >
      <div className="flex h-full flex-col p-6">
        <span
          className={cn(
            'mx-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px]',
            light ? 'bg-[#242426]/[0.06]' : 'bg-white/12',
          )}
        >
          <ChipIcon className="size-3.5" /> {chip}
        </span>
        <h3 className="mt-4 text-[24px] font-normal tracking-[-0.03em] text-inherit">{title}</h3>
        <p
          className={cn(
            'mx-auto mt-1.5 max-w-[240px] text-[13px] leading-relaxed',
            light ? 'text-[#242426]/55' : 'text-white/60',
          )}
        >
          {body}
        </p>
        <div className="relative mt-auto">{children}</div>
      </div>
    </SpotlightCard>
  );
}

/* 1. Tags that fall into the card and can be dragged around */
const tags = [
  { label: 'Experiments', icon: FlaskConical, x: -84, y: 0, r: -8 },
  { label: 'Devices', icon: Cpu, x: 70, y: -6, r: 10 },
  { label: 'Imaging', icon: Microscope, x: -40, y: -46, r: 6 },
  { label: 'Samples', icon: TestTubes, x: 62, y: -52, r: -14 },
  { label: 'Orders', icon: Package, x: -10, y: -94, r: -4 },
  { label: 'Firmware', icon: Radio, x: 40, y: -132, r: 16 },
];

function FallingTags() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <div ref={ref} className="relative h-[190px] overflow-hidden">
      {tags.map(({ label, icon: Icon, x, y, r }, i) => (
        <motion.div
          key={label}
          drag
          dragConstraints={ref}
          dragElastic={0.2}
          whileDrag={{ scale: 1.08, cursor: 'grabbing' }}
          initial={{ y: -260, x, rotate: r * 3, opacity: 0 }}
          animate={inView ? { y: 0, x, rotate: r, opacity: 1 } : undefined}
          transition={{ type: 'spring', stiffness: 120, damping: 11, delay: 0.1 + i * 0.12 }}
          className="absolute left-1/2 cursor-grab"
          style={{ bottom: 8 - y, marginLeft: -56 }}
        >
          <span className="flex w-28 items-center justify-center gap-1.5 rounded-full bg-white/85 px-3 py-2 text-[12.5px] text-[#242426] shadow-lg select-none">
            <Icon className="size-3.5" /> {label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* 2. Sync feed: new events slide in on top */
const events = [
  { text: 'Task completed', meta: 'from Android', tone: pillTone.green },
  { text: 'Due date moved to Oct 25', meta: 'from the web', tone: pillTone.amber },
  { text: 'New task added', meta: 'from Android', tone: pillTone.pink },
  { text: 'Project marked In Progress', meta: 'from the web', tone: pillTone.amber },
];

function SyncFeed() {
  const reduceMotion = useReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(timer);
  }, [reduceMotion]);
  const visible = [0, 1, 2].map((offset) => ({ ...events[(tick + offset) % events.length]!, key: tick + offset }));
  return (
    <div className="relative mx-auto h-[170px] max-w-[260px]">
      <AnimatePresence initial={false}>
        {visible.map((event, i) => (
          <motion.div
            key={event.key}
            layout
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1 - i * 0.28, y: i * 54, scale: 1 - i * 0.04 }}
            exit={{ opacity: 0, y: 170, scale: 0.85 }}
            transition={{ duration: 0.55, ease }}
            className="absolute inset-x-0 top-0 flex items-center gap-2.5 rounded-xl border bg-card px-3 py-2.5 text-left shadow-md"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-lime text-lime-ink">
              <RefreshCw className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-medium text-[#242426] dark:text-foreground">
                {event.text}
              </span>
              <span className="block text-[10.5px] text-muted-foreground">{event.meta} · just now</span>
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* 3. Orbit of deadline icons around a counter */
const orbitIcons = [CalendarClock, Bell, AlarmClock, FolderKanban, Check, Tags];

function Orbit() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="relative mx-auto flex size-[200px] items-center justify-center">
      <div className="absolute inset-0 rounded-full border border-dashed border-white/25" />
      <motion.div
        className="absolute inset-0"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
      >
        {orbitIcons.map((Icon, i) => {
          const angle = (i / orbitIcons.length) * Math.PI * 2;
          return (
            <motion.span
              key={i}
              className="absolute flex size-10 items-center justify-center rounded-full bg-white text-[#242426] shadow-lg"
              style={{ left: 100 + Math.cos(angle) * 100 - 20, top: 100 + Math.sin(angle) * 100 - 20 }}
              animate={reduceMotion ? undefined : { rotate: -360 }}
              transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            >
              <Icon className="size-4" />
            </motion.span>
          );
        })}
      </motion.div>
      <div>
        <div className="text-[44px] leading-none tracking-[-0.05em]">7</div>
        <div className="mt-1 text-[12px] text-white/60">due this week</div>
      </div>
    </div>
  );
}

/* 4. Upcoming deadlines carousel */
const deadlines = [
  { name: 'Stage calibration', project: 'Imaging', date: 'Oct 9' },
  { name: 'Firmware review', project: 'Bioreactor', date: 'Oct 12' },
  { name: 'Order sign-off', project: 'Portal', date: 'Oct 15' },
  { name: 'Run #43 export', project: 'Imaging', date: 'Oct 18' },
];

function DeadlineCarousel() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % deadlines.length), 2400);
    return () => clearInterval(timer);
  }, [reduceMotion]);
  return (
    <div className="relative h-[150px] overflow-hidden">
      {deadlines.map((deadline, i) => {
        const offset = ((i - index + deadlines.length) % deadlines.length) - 1; // -1 left, 0 centre, 1 right
        return (
          <motion.div
            key={deadline.name}
            animate={{
              x: offset * 150,
              scale: offset === 0 ? 1 : 0.86,
              opacity: Math.abs(offset) > 1 ? 0 : offset === 0 ? 1 : 0.55,
            }}
            transition={{ duration: 0.6, ease }}
            className={cn(
              'absolute top-2 left-1/2 -ml-[66px] w-[132px] rounded-2xl border-2 bg-white p-3 text-[#242426] shadow-lg',
              offset === 0 ? 'border-[#242426]' : 'border-transparent',
            )}
          >
            <span className="mx-auto flex size-9 items-center justify-center rounded-full bg-[#eef1f7]">
              <CalendarClock className="size-4" />
            </span>
            <div className="mt-2 text-[17px] tracking-[-0.03em]">{deadline.date}</div>
            <div className="truncate text-[11px] text-[#242426]/55">{deadline.name}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* 5. Task status toggles (interactive) */
function StatusToggles() {
  const [done, setDone] = useState([false, true]);
  const items = ['Mira imaging run', 'Silver chip batch'];
  return (
    <div className="space-y-2.5 text-left">
      {items.map((item, i) => (
        <div key={item} className="rounded-2xl bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[14px]">{item}</span>
            <Toggle
              on={done[i]!}
              onChange={(on) => setDone((prev) => prev.map((v, j) => (j === i ? on : v)))}
              label={`Mark ${item} complete`}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11.5px] text-[#242426]/55">
            <span>Project task</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={String(done[i])}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={cn('rounded px-1.5 py-px font-medium', done[i] ? pillTone.green : pillTone.pink)}
              >
                {done[i] ? 'Completed' : 'Pending'}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}

/* 6. Overdue alert you can tick off */
function OverdueAlert() {
  const [resolved, setResolved] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl bg-white text-left text-[#242426] shadow-lg">
      <div className="flex items-center gap-3 p-3.5">
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-full transition-colors',
            resolved ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600',
          )}
        >
          {resolved ? <Check className="size-4" /> : <CircleAlert className="size-4" />}
        </span>
        <div className="min-w-0">
          <div className="text-[13.5px] font-medium">Calibrate the stage</div>
          <div className="text-[11.5px] text-[#242426]/55">
            {resolved ? 'Completed just now' : 'Due Oct 4 · 2 days overdue'}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setResolved((v) => !v)}
        className="flex w-full items-center justify-between bg-[#242426] px-3.5 py-3 text-[12.5px] text-white"
      >
        Mark as done
        <span
          className={cn(
            'flex size-5 items-center justify-center rounded-md transition-colors',
            resolved ? 'bg-lime text-lime-ink' : 'bg-white/15',
          )}
        >
          {resolved && <Check className="size-3.5" strokeWidth={3} />}
        </span>
      </button>
    </div>
  );
}

export function Platform() {
  return (
    <section id="platform" className="scroll-mt-24 px-3 pt-6 sm:px-6">
      <div className="rounded-t-[36px] bg-[#242426] px-5 pt-24 pb-24 text-white sm:px-8 sm:pt-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1.5 text-[12.5px]">
            <ArrowDownUp className="size-3.5" /> Built for real work
          </span>
          <h2 className="mt-6 text-[38px] leading-[1.05] font-normal tracking-[-0.045em] text-white sm:text-[54px]">
            Small app, <span className="accent text-lime">serious</span> power
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15.5px] leading-relaxed text-white/60">
            Every project, task and deadline in one clean view, with the details that keep work moving.
          </p>
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Reveal>
            <WidgetCard
              chipIcon={Tags}
              chip="Organise"
              title="Group anything"
              body="Projects fit experiments, devices, orders or anything else. Drag the tags."
            >
              <FallingTags />
            </WidgetCard>
          </Reveal>
          <Reveal delay={0.08}>
            <WidgetCard
              light
              chipIcon={RefreshCw}
              chip="Sync"
              title="Always current"
              body="Changes from either app show up after a refresh."
            >
              <SyncFeed />
            </WidgetCard>
          </Reveal>
          <Reveal delay={0.16}>
            <WidgetCard
              chipIcon={AlarmClock}
              chip="Focus"
              title="Deadlines in view"
              body="Due dates and overdue work, front and centre."
            >
              <Orbit />
            </WidgetCard>
          </Reveal>
          <Reveal>
            <WidgetCard
              chipIcon={CalendarClock}
              chip="Plan"
              title="Upcoming work"
              body="See what’s due next across every project."
            >
              <DeadlineCarousel />
            </WidgetCard>
          </Reveal>
          <Reveal delay={0.08}>
            <WidgetCard
              light
              chipIcon={Check}
              chip="Track"
              title="One-tap status"
              body="Flip a task to done; progress updates instantly. Try it."
            >
              <StatusToggles />
            </WidgetCard>
          </Reveal>
          <Reveal delay={0.16}>
            <WidgetCard
              chipIcon={Shield}
              chip="Protect"
              title="Nothing slips"
              body="Overdue tasks are flagged until they’re handled. Try it."
            >
              <OverdueAlert />
            </WidgetCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
