import { CalendarDays, Check, GripVertical } from 'lucide-react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { LimeButton } from '@/components/fx/LimeButton';
import { ease } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { MockTickBar, mockProjects, pillTone } from './MockupParts';
import { PhoneProject } from './PhoneScreens';

const DURATION = 5000;

function PlanPanel() {
  return (
    <div className="grid grid-cols-2 gap-3 p-5">
      {mockProjects.concat(mockProjects[0]!).map((project, i) => (
        <div key={i} className="rounded-2xl border bg-card p-3.5">
          <span className={cn('rounded px-1.5 py-px text-[9px] font-medium', pillTone[project.tone])}>
            {project.status}
          </span>
          <div className="mt-2 truncate text-[12.5px] font-medium">{project.name}</div>
          <div className="mt-3 flex items-center gap-1.5">
            <MockTickBar value={project.progress} />
            <span className="text-[10px] text-brand-500">{project.progress}%</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-[9.5px] text-muted-foreground">
            <CalendarDays className="size-2.5" /> Due {project.due}
          </div>
        </div>
      ))}
    </div>
  );
}

const columns = [
  { title: 'Pending', tone: pillTone.pink, cards: ['Thumbnail worker', 'Dashboard for runs'] },
  { title: 'In Progress', tone: pillTone.amber, cards: ['Upload service'] },
  { title: 'Completed', tone: pillTone.green, cards: ['Metadata format', 'Order board'] },
];

function TrackPanel() {
  return (
    <div className="grid grid-cols-3 gap-2.5 p-5">
      {columns.map((column, c) => (
        <div key={column.title} className="rounded-2xl bg-muted/70 p-2.5">
          <span className={cn('rounded px-1.5 py-px text-[9.5px] font-medium', column.tone)}>{column.title}</span>
          <div className="mt-2.5 space-y-2">
            {column.cards.map((card, i) => (
              <motion.div
                key={card}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (c * 2 + i) * 0.07 }}
                className="flex items-center gap-1.5 rounded-xl border bg-card px-2 py-2 text-[10.5px]"
              >
                <GripVertical className="size-3 shrink-0 text-muted-foreground" />
                <span className={cn('truncate', column.title === 'Completed' && 'text-muted-foreground line-through')}>
                  {card}
                </span>
                {column.title === 'Completed' && <Check className="ml-auto size-3 shrink-0 text-emerald-500" />}
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SyncPanel() {
  return (
    <div className="flex items-center justify-center p-5">
      <div className="origin-center scale-[0.82]">
        <PhoneProject />
      </div>
    </div>
  );
}

const tabs = [
  {
    title: 'Plan',
    body: 'Create projects with dates and a status, then watch progress fill in as tasks close.',
    panel: <PlanPanel />,
  },
  {
    title: 'Track',
    body: 'Search, filter and sort tasks, or drag them across a board to change their status.',
    panel: <TrackPanel />,
  },
  {
    title: 'Sync',
    body: 'Pick up on Android exactly where you left off on the web, with your session kept secure.',
    panel: <SyncPanel />,
  },
];

/** Vertical tabs with an auto-advancing progress line (as in the reference's "Master your cash flow"). */
export function WorkflowTabs() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-30%' });
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const timer = setTimeout(() => setActive((a) => (a + 1) % tabs.length), DURATION);
    return () => clearTimeout(timer);
  }, [active, inView, reduceMotion]);

  return (
    <section className="px-3 pb-6 sm:px-6">
      <div ref={ref} className="rounded-b-[36px] bg-[#242426] px-5 pt-8 pb-24 text-white sm:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-[34px] leading-[1.08] font-normal tracking-[-0.04em] text-white sm:text-[42px]">
              Master your <span className="accent text-lime">workflow.</span>
            </h2>
            <div className="mt-10 space-y-2">
              {tabs.map((tab, i) => (
                <button
                  key={tab.title}
                  type="button"
                  onClick={() => setActive(i)}
                  className="relative block w-full py-3 pl-6 text-left"
                  aria-pressed={active === i}
                >
                  <span className="absolute top-3 bottom-3 left-0 w-[3px] overflow-hidden rounded-full bg-white/12">
                    {active === i && (
                      <motion.span
                        key={`${i}-${active}`}
                        className="absolute inset-x-0 top-0 block rounded-full bg-lime"
                        initial={{ height: reduceMotion ? '100%' : '0%' }}
                        animate={{ height: '100%' }}
                        transition={{ duration: reduceMotion ? 0 : DURATION / 1000, ease: 'linear' }}
                      />
                    )}
                  </span>
                  <span
                    className={cn(
                      'block text-[22px] tracking-[-0.03em] transition-colors',
                      active === i ? 'text-white' : 'text-white/45',
                    )}
                  >
                    {tab.title}
                  </span>
                  <AnimatePresence initial={false}>
                    {active === i && (
                      <motion.span
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease }}
                        className="block overflow-hidden"
                      >
                        <span className="mt-1.5 block max-w-xs text-[14px] leading-relaxed text-white/60">
                          {tab.body}
                        </span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              ))}
            </div>
            <div className="mt-10">
              <LimeButton to="/register" variant="lime">
                Get started
              </LimeButton>
            </div>
          </div>

          <div className="relative rounded-[28px] bg-[radial-gradient(circle_at_20%_20%,#5b6b85,transparent_60%),radial-gradient(circle_at_80%_90%,#8a6a55,transparent_60%),#3a3f4a] p-6 sm:p-10">
            <div className="relative min-h-[380px] overflow-hidden rounded-2xl bg-background text-foreground shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
                  transition={{ duration: 0.5, ease }}
                >
                  {tabs[active]!.panel}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
