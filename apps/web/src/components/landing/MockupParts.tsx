import {
  AlarmClock,
  Bell,
  CalendarDays,
  Check,
  CircleCheckBig,
  CircleDashed,
  FolderClosed,
  FolderOpen,
  House,
  ListTodo,
  PieChart,
  Plus,
  Rocket,
  Search,
  UserRound,
} from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { LogoMark } from '@/components/layout/Logo';
import { ease } from '@/lib/motion';
import { cn } from '@/lib/utils';

/* Sample data for the decorative mockups (fictional). */
export const mockProjects = [
  { name: 'Organoid Imaging Pipeline', status: 'In Progress', tone: 'amber', progress: 80, due: 'Nov 20', tasks: 12 },
  { name: 'Bioreactor Firmware v2', status: 'Not Started', tone: 'pink', progress: 35, due: 'Jan 4', tasks: 8 },
  { name: 'Customer Order Portal', status: 'Completed', tone: 'green', progress: 100, due: 'Sep 26', tasks: 9 },
] as const;

export const pillTone = {
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  pink: 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
} as const;

export function MockTickBar({ value, className }: { value: number; className?: string }) {
  return (
    <div
      className={cn(
        'relative h-3 flex-1 bg-[repeating-linear-gradient(90deg,var(--brand-100)_0_2px,transparent_2px_4px)]',
        className,
      )}
    >
      <motion.div
        className="absolute inset-y-0 left-0 bg-[repeating-linear-gradient(90deg,var(--brand-400)_0_2px,transparent_2px_4px)]"
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease, delay: 0.3 }}
      />
    </div>
  );
}

const sidebarItems = [
  { icon: House, label: 'Dashboard', active: true },
  { icon: FolderClosed, label: 'Projects' },
  { icon: ListTodo, label: 'Tasks' },
  { icon: UserRound, label: 'Account' },
];

/** Browser-window mockup of the web dashboard (aria-hidden decoration). */
export function BrowserMockup() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border bg-card text-left shadow-[0_40px_100px_-30px_rgb(95_79_209/0.45)] select-none"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-3 border-b bg-subtle px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#FF5F57]" />
          <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="size-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="mx-auto flex w-full max-w-xs items-center justify-center gap-1.5 rounded-md border bg-card px-3 py-1 text-[10.5px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500" /> ismo-workspace.app/dashboard
        </div>
        <div className="w-10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[170px_1fr]">
        {/* Sidebar */}
        <div className="hidden flex-col border-r bg-sidebar p-3 md:flex">
          <div className="flex items-center gap-2 px-1">
            <LogoMark className="size-5" />
            <div className="leading-tight">
              <div className="text-[12px] font-semibold tracking-tight">ISMO</div>
              <div className="text-[8.5px] text-muted-foreground">Project Workspace</div>
            </div>
          </div>
          <div className="mt-5 mb-1 px-1.5 text-[9px] text-muted-foreground">Navigation</div>
          {sidebarItems.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={cn(
                'flex items-center gap-2 rounded-md border px-2 py-1.5 text-[10.5px]',
                active
                  ? 'border-border bg-nav-active font-medium shadow-card'
                  : 'border-transparent text-muted-foreground',
              )}
            >
              <Icon className="size-3" /> {label}
            </div>
          ))}
          <div className="mt-4 mb-1 px-1.5 text-[9px] text-muted-foreground">Recent projects</div>
          {mockProjects.map((project) => (
            <div key={project.name} className="truncate px-2 py-1 text-[10px] text-muted-foreground">
              {project.name}
            </div>
          ))}
          <div className="mt-auto flex items-center gap-2 px-1 pt-6">
            <span className="flex size-6 items-center justify-center rounded-full bg-brand-100 text-[9px] font-semibold text-brand-700">
              JD
            </span>
            <div className="leading-tight">
              <div className="text-[10px] font-medium">Jane Doe</div>
              <div className="text-[8.5px] text-muted-foreground">jane@example.com</div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 border-b px-4 py-2">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-muted/70 px-2 py-1 text-[10px] text-muted-foreground sm:w-56 sm:flex-none">
              <Search className="size-3 shrink-0" /> <span className="truncate">Search tasks…</span>
            </div>
            <Bell className="ml-auto size-3.5 text-muted-foreground" />
            <span className="flex shrink-0 items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-medium whitespace-nowrap text-primary-foreground">
              <Plus className="size-3" /> New project
            </span>
          </div>

          <div className="space-y-3 p-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[19px] font-medium tracking-[-0.035em]">Welcome back, Jane.</div>
                <div className="text-[10px] text-muted-foreground">
                  Here&apos;s what&apos;s happening with your projects today.
                </div>
              </div>
              <span className="hidden items-center gap-1 rounded bg-brand-50 px-1.5 py-0.5 text-[9px] font-medium text-brand-600 sm:flex">
                <span className="size-1 rounded-full bg-brand-400" /> Synced across web &amp; mobile
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {[
                { label: 'Active projects', value: 12, hint: '+2 this month', icon: Rocket, warn: false },
                { label: 'Tasks completed', value: 276, hint: '+22% this week', icon: CircleCheckBig, warn: false },
                { label: 'Pending tasks', value: 18, hint: '6 due this week', icon: CircleDashed, warn: false },
                { label: 'Overdue', value: 2, hint: 'Needs attention', icon: AlarmClock, warn: true },
              ].map(({ label, value, hint, icon: Icon, warn }) => (
                <div key={label} className="rounded-lg border bg-card p-2.5">
                  <div className="flex items-center justify-between text-[9.5px] text-muted-foreground">
                    {label} <Icon className="size-3 opacity-70" />
                  </div>
                  <div className="mt-2 text-[22px] leading-none tracking-[-0.04em]">
                    <AnimatedNumber value={value} duration={1.4} />
                  </div>
                  <div
                    className={cn(
                      'mt-1.5 text-[8.5px]',
                      warn ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400',
                    )}
                  >
                    {hint}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-2 lg:grid-cols-[1.6fr_1fr]">
              <div className="rounded-lg border p-2.5">
                <div className="flex items-center gap-1.5 text-[12px] font-medium">
                  <FolderOpen className="size-3.5 text-muted-foreground" /> Project overview
                </div>
                <div className="text-[9px] text-muted-foreground">Track progress across active projects</div>
                <div className="mt-2 space-y-1.5">
                  {mockProjects.map((project) => (
                    <div
                      key={project.name}
                      className="flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-md border px-2 py-1.5 sm:flex-nowrap"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[10.5px] font-medium">{project.name}</div>
                        <div className="flex items-center gap-1 text-[8.5px] text-muted-foreground">
                          <CalendarDays className="size-2.5" /> Due {project.due} · {project.tasks} tasks
                        </div>
                      </div>
                      <span className={cn('rounded px-1.5 py-px text-[8.5px] font-medium', pillTone[project.tone])}>
                        {project.status}
                      </span>
                      <div className="flex w-full items-center gap-1.5 sm:w-[110px] sm:shrink-0">
                        <MockTickBar value={project.progress} />
                        <span className="w-7 text-right text-[10px] text-brand-500">{project.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden rounded-lg border p-2.5 lg:block">
                <div className="flex items-center gap-1.5 text-[12px] font-medium">
                  <PieChart className="size-3.5 text-muted-foreground" /> Task breakdown
                </div>
                <div className="mt-2 text-[26px] leading-none tracking-[-0.045em]">
                  <AnimatedNumber value={64} duration={1.4} />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <div className="mt-2 flex h-1.5 gap-0.5 overflow-hidden rounded-full">
                  <div className="w-[64%] bg-green-500" />
                  <div className="w-[16%] bg-amber-500" />
                  <div className="w-[20%] bg-pink-500" />
                </div>
                <div className="mt-2 space-y-1 text-[9.5px] text-muted-foreground">
                  {[
                    ['bg-green-500', 'Completed', 176],
                    ['bg-amber-500', 'In Progress', 44],
                    ['bg-pink-500', 'Pending', 56],
                  ].map(([dot, label, count]) => (
                    <div key={label as string} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className={cn('size-1.5 rounded-full', dot as string)} /> {label}
                      </span>
                      <span className="font-medium text-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Android phone mockup of the companion app (aria-hidden decoration). */
export function PhoneMockup({ className }: { className?: string }) {
  const tasks = [
    { name: 'Calibrate imaging stage', tone: 'amber', label: 'In Progress', done: false },
    { name: 'Upload run #42 exports', tone: 'pink', label: 'Pending', done: false },
    { name: 'Review segmentation', tone: 'green', label: 'Completed', done: true },
  ] as const;

  return (
    <div
      aria-hidden
      className={cn(
        'w-[230px] rounded-[2.4rem] border-[7px] border-[#1c1c21] bg-card p-0 shadow-[0_30px_80px_-20px_rgb(17_17_19/0.5)] select-none dark:border-[#2a2a31]',
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-[1.9rem] bg-background">
        <div className="flex items-center justify-between px-5 pt-2.5 pb-1 text-[9px] font-medium">
          <span>9:41</span>
          <span className="absolute left-1/2 top-2 h-3.5 w-14 -translate-x-1/2 rounded-full bg-[#1c1c21]" />
          <span>●●● 5G</span>
        </div>
        <div className="px-3.5 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <LogoMark className="size-5" />
            <Bell className="size-3.5 text-muted-foreground" />
          </div>
          <div className="mt-3 text-[15px] font-medium tracking-[-0.03em]">Good morning, Jane</div>
          <div className="text-[9px] text-muted-foreground">3 tasks due today</div>
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            {[
              ['Projects', 12],
              ['Tasks', 48],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-lg border p-2">
                <div className="text-[8.5px] text-muted-foreground">{label}</div>
                <div className="text-[17px] leading-tight tracking-[-0.04em]">
                  <AnimatedNumber value={value as number} duration={1.4} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2.5 text-[10px] font-medium">Today</div>
          <div className="mt-1.5 space-y-1.5">
            {tasks.map((task) => (
              <div key={task.name} className="flex items-center gap-2 rounded-lg border px-2 py-1.5">
                <span
                  className={cn(
                    'flex size-3 shrink-0 items-center justify-center rounded-[3px] border',
                    task.done && 'border-brand-500 bg-brand-500',
                  )}
                >
                  {task.done && <Check className="size-2 text-white" strokeWidth={3.5} />}
                </span>
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate text-[9.5px]',
                    task.done && 'text-muted-foreground line-through',
                  )}
                >
                  {task.name}
                </span>
                <span className={cn('rounded px-1 py-px text-[7.5px] font-medium', pillTone[task.tone])}>
                  {task.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-1 grid grid-cols-3 border-t px-2 pt-1.5 pb-3 text-center text-[8px] text-muted-foreground">
          <div className="flex flex-col items-center gap-0.5 font-medium text-foreground">
            <House className="size-3.5" /> Home
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <FolderClosed className="size-3.5" /> Projects
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <UserRound className="size-3.5" /> Me
          </div>
        </div>
      </div>
    </div>
  );
}
