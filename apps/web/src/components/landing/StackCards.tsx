import {
  CalendarDays,
  Check,
  CircleCheck,
  FolderKanban,
  KeyRound,
  ListTodo,
  Lock,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { TiltCard } from '@/components/fx/TiltCard';
import { ease } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { MockTickBar, mockProjects, pillTone } from './MockupParts';
import { PhoneProject } from './PhoneScreens';

/* ---------- Widgets shown on each card (built from the real UI) ---------- */

function ProjectsWidget() {
  return (
    <div className="w-[340px] rounded-2xl bg-card p-4 shadow-[0_30px_60px_-25px_rgb(36_36_38/0.5)]">
      <div className="flex items-center justify-between">
        <div className="text-[14px] font-medium">Project overview</div>
        <span className="rounded-full bg-[#242426] px-2 py-0.5 text-[10px] text-white">+18%</span>
      </div>
      <div className="mt-3 space-y-2">
        {mockProjects.map((project) => (
          <div key={project.name} className="rounded-xl border px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[12px] font-medium">{project.name}</span>
              <span className={cn('rounded px-1.5 py-px text-[9px] font-medium', pillTone[project.tone])}>
                {project.status}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <MockTickBar value={project.progress} />
              <span className="w-8 text-right text-[11px] text-brand-500">{project.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const widgetTasks = [
  {
    name: 'Calibrate the imaging stage',
    priority: 'High',
    pTone: 'bg-red-100 text-red-700',
    status: 'In Progress',
    sTone: pillTone.amber,
    due: 'Oct 9',
  },
  {
    name: 'Upload run #42 exports',
    priority: 'Medium',
    pTone: 'bg-muted text-muted-foreground',
    status: 'Pending',
    sTone: pillTone.pink,
    due: 'Oct 12',
  },
  {
    name: 'Review segmentation',
    priority: 'Low',
    pTone: 'bg-sky-100 text-sky-700',
    status: 'Completed',
    sTone: pillTone.green,
    due: 'Oct 4',
  },
];

function TasksWidget() {
  return (
    <div className="relative w-[350px] rounded-2xl bg-card p-4 shadow-[0_30px_60px_-25px_rgb(36_36_38/0.5)]">
      <div className="flex items-center justify-between">
        <div className="text-[14px] font-medium">Today’s tasks</div>
        <span className="rounded-full bg-[#242426] px-2 py-0.5 text-[10px] text-white">3 open</span>
      </div>
      <div className="mt-3 space-y-2">
        {widgetTasks.map((task) => (
          <div key={task.name} className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5">
            <span
              className={cn(
                'flex size-4 shrink-0 items-center justify-center rounded-[5px] border',
                task.status === 'Completed' && 'border-brand-500 bg-brand-500',
              )}
            >
              {task.status === 'Completed' && <Check className="size-2.5 text-white" strokeWidth={3.5} />}
            </span>
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  'truncate text-[12px] font-medium',
                  task.status === 'Completed' && 'text-muted-foreground line-through',
                )}
              >
                {task.name}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[9.5px]">
                <span className={cn('rounded px-1.5 py-px font-medium', task.pTone)}>{task.priority}</span>
                <span className={cn('rounded px-1.5 py-px font-medium', task.sTone)}>{task.status}</span>
                <span className="flex items-center gap-0.5 text-muted-foreground">
                  <CalendarDays className="size-2.5" /> {task.due}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <motion.span
        initial={{ scale: 0, rotate: -12 }}
        whileInView={{ scale: 1, rotate: -6 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.4 }}
        className="absolute -top-4 -right-4 rounded-xl bg-red-500 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg"
      >
        1 overdue
      </motion.span>
    </div>
  );
}

function SyncWidget() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="relative flex items-center gap-6">
      <div className="w-[190px] rounded-2xl bg-card p-3.5 shadow-[0_30px_60px_-25px_rgb(36_36_38/0.5)]">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="size-2 rounded-full bg-[#FF5F57]" />
          <span className="size-2 rounded-full bg-[#FEBC2E]" />
          <span className="size-2 rounded-full bg-[#28C840]" />
          <span className="ml-1">Web</span>
        </div>
        <div className="mt-3 rounded-xl border p-2.5">
          <div className="text-[11px] font-medium">Calibrate the imaging stage</div>
          <span className={cn('mt-1.5 inline-block rounded px-1.5 py-px text-[9px] font-medium', pillTone.green)}>
            Completed
          </span>
        </div>
        <div className="mt-2 text-[9.5px] text-muted-foreground">Updated from Android · just now</div>
      </div>
      <div className="relative h-px w-12 border-t-2 border-dashed border-white/80">
        {!reduceMotion && (
          <motion.span
            className="absolute -top-[5px] size-2.5 rounded-full bg-lime shadow-[0_0_12px_var(--lime)]"
            animate={{ left: ['90%', '0%', '90%'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
      <div className="origin-left scale-[0.78]">
        <PhoneProject />
      </div>
    </div>
  );
}

const securityChecks = [
  'Passwords hashed with bcrypt',
  'Ownership checked on every query',
  'Rotating refresh tokens',
  'Rate-limited sign-in',
  'Every request validated',
];

function SecurityWidget() {
  return (
    <div className="w-[330px] rounded-2xl bg-card p-4 shadow-[0_30px_60px_-25px_rgb(36_36_38/0.5)]">
      <div className="flex items-center gap-2 text-[14px] font-medium">
        <ShieldCheck className="size-4 text-emerald-500" /> Security checks
      </div>
      <ul className="mt-3 space-y-2">
        {securityChecks.map((item, i) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease, delay: 0.25 + i * 0.12 }}
            className="flex items-center gap-2.5 rounded-xl border px-3 py-2 text-[12px]"
          >
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.4 + i * 0.12 }}
              className="flex size-4 items-center justify-center rounded-full bg-lime text-lime-ink"
            >
              <Check className="size-2.5" strokeWidth={3.5} />
            </motion.span>
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Cards ---------- */

interface CardData {
  badgeIcon: LucideIcon;
  badge: string;
  title: string;
  body: string;
  footnote: string;
  /** Colour wash behind the widget. */
  wash: string;
  widget: ReactNode;
  ghost: LucideIcon;
}

const cards: CardData[] = [
  {
    badgeIcon: FolderKanban,
    badge: 'Projects & progress',
    title: 'See where every project is heading before it slips.',
    body: 'Status, start and end dates, and a progress bar that moves as tasks close. No spreadsheets, no guesswork.',
    footnote: 'No more “is this done yet?” check-ins.',
    wash: 'radial-gradient(circle at 25% 30%, var(--lime) 0%, transparent 45%), radial-gradient(circle at 80% 75%, var(--brand-300) 0%, transparent 55%), linear-gradient(135deg, #e7ecf3, #cfd8e6)',
    widget: <ProjectsWidget />,
    ghost: FolderKanban,
  },
  {
    badgeIcon: ListTodo,
    badge: 'Tasks & priorities',
    title: 'Know exactly what needs doing today.',
    body: 'Priorities, statuses and due dates, with overdue work flagged automatically. Change a status in one click.',
    footnote: 'No more forgotten deadlines.',
    wash: 'radial-gradient(circle at 70% 25%, #ffb38a 0%, transparent 50%), radial-gradient(circle at 20% 80%, #ff8fb1 0%, transparent 50%), linear-gradient(135deg, #f3e9e4, #e8d6cf)',
    widget: <TasksWidget />,
    ghost: ListTodo,
  },
  {
    badgeIcon: RefreshCw,
    badge: 'Web + Android',
    title: 'One account. Same data. Everywhere.',
    body: 'Complete a task on your phone and it’s done on the web after a refresh. Both apps share one API and one database.',
    footnote: 'No more copying updates between tools.',
    wash: 'radial-gradient(circle at 30% 30%, #7cc4ff 0%, transparent 50%), radial-gradient(circle at 80% 80%, var(--lime) 0%, transparent 45%), linear-gradient(135deg, #e3eef8, #cddcec)',
    widget: <SyncWidget />,
    ghost: Smartphone,
  },
  {
    badgeIcon: Lock,
    badge: 'Private by design',
    title: 'Your data stays yours.',
    body: 'Every read and write is checked against its owner. Sessions are short-lived, rotate automatically and live in secure storage.',
    footnote: 'No more worrying who can see what.',
    wash: 'radial-gradient(circle at 25% 70%, #6ee7b7 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--brand-300) 0%, transparent 50%), linear-gradient(135deg, #e3f1ec, #cfe3dc)',
    widget: <SecurityWidget />,
    ghost: KeyRound,
  },
];

function StackCard({
  card,
  index,
  total,
  progress,
}: {
  card: CardData;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const reduceMotion = useReducedMotion();
  // Earlier cards shrink and dim slightly as later ones stack on top of them.
  const targetScale = 1 - (total - 1 - index) * 0.045;
  const scale = useTransform(progress, [index / total, 1], [1, reduceMotion ? 1 : targetScale]);
  const dim = useTransform(progress, [index / total, 1], [0, reduceMotion ? 0 : (total - 1 - index) * 0.08]);
  const flipped = index % 2 === 1;
  const BadgeIcon = card.badgeIcon;
  const Ghost = card.ghost;

  return (
    <div
      className="sticky top-24 flex h-[600px] items-start justify-center sm:h-[640px]"
      style={{ paddingTop: index * 14 }}
    >
      <motion.article
        style={{ scale, transformOrigin: 'top center' }}
        className="relative grid h-[540px] w-full overflow-hidden rounded-[30px] p-2 shadow-[0_30px_80px_-40px_rgb(36_36_38/0.45)] lg:grid-cols-2"
      >
        {/* Colour wash fills the whole card; the text panel sits on top as a white sheet */}
        <div className="absolute inset-0" style={{ background: card.wash }} />
        <div className="absolute inset-0 backdrop-blur-[2px]" />

        <div className={cn('relative z-10 flex flex-col rounded-[24px] bg-card p-7 sm:p-9', flipped && 'lg:order-2')}>
          <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-muted px-2.5 py-1.5 text-[12.5px]">
            <BadgeIcon className="size-3.5 text-muted-foreground" /> {card.badge}
          </span>
          <h3 className="mt-6 max-w-sm text-[28px] leading-[1.12] font-normal tracking-[-0.035em] sm:text-[34px]">
            {card.title}
          </h3>
          <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-muted-foreground">{card.body}</p>
          <p className="mt-auto flex items-center gap-2 pt-8 text-[13px] text-muted-foreground">
            <CircleCheck className="size-4" /> {card.footnote}
          </p>
        </div>

        <div className={cn('relative z-10 hidden items-center justify-center lg:flex', flipped && 'lg:order-1')}>
          {/* Faint ghost icon drifting behind the widget */}
          <Ghost className="absolute top-8 right-10 size-24 rotate-12 text-white/40" strokeWidth={1} />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease }}
          >
            <TiltCard max={6}>{card.widget}</TiltCard>
          </motion.div>
        </div>
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 rounded-[30px] bg-[#242426]"
          style={{ opacity: dim }}
        />
      </motion.article>
    </div>
  );
}

/** Sticky cards that stack on top of each other as you scroll (the reference's signature section). */
export function StackCards() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  return (
    <section className="bg-background pb-24">
      <div ref={ref} className="mx-auto max-w-6xl px-5 sm:px-8">
        {cards.map((card, i) => (
          <StackCard key={card.badge} card={card} index={i} total={cards.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
