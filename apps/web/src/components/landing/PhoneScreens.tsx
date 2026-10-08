import { Check, ChevronLeft, ChevronsRight, FolderClosed, House, Plus, Search, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { LogoMark } from '@/components/layout/Logo';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { cn } from '@/lib/utils';
import { MockTickBar, pillTone } from './MockupParts';

type Tone = keyof typeof pillTone;

/** Android phone frame: status bar, notch and the app's bottom tabs. */
export function PhoneFrame({
  children,
  tab,
  className,
}: {
  children: ReactNode;
  tab?: 'home' | 'projects' | 'me';
  className?: string;
}) {
  const tabs = [
    { id: 'home', label: 'Home', icon: House },
    { id: 'projects', label: 'Projects', icon: FolderClosed },
    { id: 'me', label: 'Me', icon: UserRound },
  ] as const;
  return (
    <div
      aria-hidden
      className={cn(
        'w-[236px] rounded-[2.5rem] border-[7px] border-[#1c1c21] bg-card shadow-[0_40px_80px_-24px_rgb(17_17_19/0.55)] select-none dark:border-[#2a2a31]',
        className,
      )}
    >
      <div className="relative flex h-[470px] flex-col overflow-hidden rounded-[2rem] bg-background">
        <div className="flex items-center justify-between px-5 pt-2.5 pb-1 text-[9px] font-medium">
          <span>9:41</span>
          <span className="absolute top-2 left-1/2 h-3.5 w-14 -translate-x-1/2 rounded-full bg-[#1c1c21]" />
          <span>5G</span>
        </div>
        <div className="flex-1 overflow-hidden px-3.5 pt-2">{children}</div>
        {tab && (
          <div className="grid grid-cols-3 border-t px-2 pt-1.5 pb-3 text-center font-mono text-[7px] tracking-wider text-muted-foreground uppercase">
            {tabs.map(({ id, label, icon: Icon }) => (
              <div key={id} className={cn('flex flex-col items-center gap-0.5', id === tab && 'text-foreground')}>
                <Icon className="size-3.5" />
                {label}
                <span className={cn('size-1 rounded-full', id === tab ? 'bg-brand-400' : 'bg-transparent')} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const Eyebrow = ({ children }: { children: string }) => (
  <div className="font-mono text-[7.5px] tracking-wider text-muted-foreground uppercase">// {children}</div>
);

/** Home tab: greeting, stats and the completion card. */
export function PhoneHome() {
  return (
    <PhoneFrame tab="home">
      <div className="flex items-center justify-between">
        <LogoMark className="size-5" />
        <span className="flex size-6 items-center justify-center rounded-full bg-brand-100 text-[8px] font-semibold text-brand-700">
          JD
        </span>
      </div>
      <div className="mt-3">
        <Eyebrow>Overview</Eyebrow>
        <div className="mt-1 text-[16px] leading-tight font-medium tracking-[-0.03em]">
          Good morning, <span className="accent">Jane.</span>
        </div>
        <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-brand-50 px-1.5 py-0.5 text-[7.5px] font-medium text-brand-600">
          <span className="size-1 rounded-full bg-brand-400" /> Synced across web &amp; mobile
        </span>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        {[
          ['Projects', 12, '2 in progress'],
          ['Tasks', 48, '9 active'],
          ['Completed', 31, '64% done'],
          ['Overdue', 2, 'Needs attention'],
        ].map(([label, value, hint]) => (
          <div key={label as string} className="rounded-lg border p-2">
            <div className="font-mono text-[6.5px] tracking-wider text-muted-foreground uppercase">{label}</div>
            <div className="mt-1 text-[17px] leading-none tracking-[-0.04em]">
              <AnimatedNumber value={value as number} duration={1.3} />
            </div>
            <div className={cn('mt-1 text-[7px]', label === 'Overdue' ? 'text-red-500' : 'text-muted-foreground')}>
              {hint}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2.5 rounded-lg border p-2">
        <div className="relative flex size-12 shrink-0 items-center justify-center rounded-full border-[3px] border-brand-100">
          <div className="absolute inset-[-3px] rounded-full border-[3px] border-transparent border-t-brand-400 border-r-brand-400" />
          <span className="text-[11px] font-medium">64</span>
        </div>
        <div className="flex-1 space-y-1">
          <div className="text-[9px] font-medium">Task breakdown</div>
          <div className="flex h-1 gap-px overflow-hidden rounded-full">
            <div className="w-[64%] bg-green-500" />
            <div className="w-[18%] bg-amber-500" />
            <div className="w-[18%] bg-pink-500" />
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

const projectTasks: { name: string; tone: Tone; label: string; done: boolean }[] = [
  { name: 'Define imaging metadata', tone: 'green', label: 'Completed', done: true },
  { name: 'Build upload service', tone: 'amber', label: 'In Progress', done: false },
  { name: 'Thumbnail worker', tone: 'pink', label: 'Pending', done: false },
  { name: 'Dashboard for run status', tone: 'pink', label: 'Pending', done: false },
];

/** Project screen: header card with progress, search, filters and the task list. */
export function PhoneProject() {
  return (
    <PhoneFrame>
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-md border">
          <ChevronLeft className="size-3.5" />
        </span>
        <div className="flex-1 text-center">
          <Eyebrow>Project</Eyebrow>
          <div className="text-[9px] font-medium">Organoid Imaging Pipeline</div>
        </div>
        <span className="w-6" />
      </div>
      <div className="mt-2.5 rounded-xl border p-2.5">
        <span className={cn('rounded px-1.5 py-px text-[7px] font-medium', pillTone.amber)}>In Progress</span>
        <div className="mt-1.5 text-[13px] leading-tight font-medium tracking-[-0.02em]">Organoid Imaging Pipeline</div>
        <div className="mt-2 flex items-center gap-1.5">
          <MockTickBar value={40} className="h-2.5" />
          <span className="text-[9px] text-brand-500">40%</span>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-muted px-2 py-1.5 text-[8px] text-muted-foreground">
        <Search className="size-2.5" /> Search tasks by name
      </div>
      <div className="mt-1.5 flex gap-1">
        {['Pending', 'In Progress', 'High'].map((chip, i) => (
          <span
            key={chip}
            className={cn(
              'rounded-full border px-2 py-0.5 text-[7px]',
              i === 0 && 'border-primary bg-primary text-primary-foreground',
            )}
          >
            {chip}
          </span>
        ))}
      </div>
      <div className="mt-2 space-y-1.5">
        {projectTasks.map((task) => (
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
              className={cn('min-w-0 flex-1 truncate text-[8.5px]', task.done && 'text-muted-foreground line-through')}
            >
              {task.name}
            </span>
            <span className={cn('rounded px-1 py-px text-[6.5px] font-medium', pillTone[task.tone])}>{task.label}</span>
          </div>
        ))}
      </div>
      <span className="absolute right-3 bottom-4 flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-[8px] font-medium text-primary-foreground shadow-lg">
        <Plus className="size-2.5" /> Add task
      </span>
    </PhoneFrame>
  );
}

/** Task form sheet: segmented priority/status and the arrow submit button. */
export function PhoneTaskForm() {
  const segment = (options: string[], active: number) => (
    <div className="flex gap-0.5 rounded-lg bg-muted p-0.5">
      {options.map((option, i) => (
        <span
          key={option}
          className={cn(
            'flex-1 rounded-md py-1 text-center text-[7.5px]',
            i === active ? 'border bg-card font-medium' : 'text-muted-foreground',
          )}
        >
          {option}
        </span>
      ))}
    </div>
  );
  return (
    <PhoneFrame>
      <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-border" />
      <Eyebrow>Create</Eyebrow>
      <div className="mt-0.5 text-[16px] font-medium tracking-[-0.03em]">
        New <span className="accent">task</span>
      </div>
      <div className="mt-2.5 space-y-2 text-[8px]">
        <div>
          <div className="mb-1 font-medium">Task name</div>
          <div className="rounded-lg border border-brand-400 px-2 py-1.5">
            Calibrate the imaging stage
            <span className="ml-px inline-block h-2.5 w-px animate-pulse bg-foreground align-middle" />
          </div>
        </div>
        <div>
          <div className="mb-1 font-medium">Description</div>
          <div className="h-10 rounded-lg border px-2 py-1.5 text-muted-foreground">Align before run #43</div>
        </div>
        <div>
          <div className="mb-1 font-mono text-[6.5px] tracking-wider text-muted-foreground uppercase">Priority</div>
          {segment(['Low', 'Medium', 'High'], 2)}
        </div>
        <div>
          <div className="mb-1 font-mono text-[6.5px] tracking-wider text-muted-foreground uppercase">Status</div>
          {segment(['Pending', 'In Progress', 'Completed'], 0)}
        </div>
        <div>
          <div className="mb-1 font-medium">Due date</div>
          <div className="rounded-lg border px-2 py-1.5">Oct 25, 2026</div>
        </div>
      </div>
      <div className="mt-3 flex items-center rounded-xl bg-primary p-1 text-primary-foreground">
        <span className="flex size-6 items-center justify-center rounded-md bg-primary-foreground text-primary">
          <ChevronsRight className="size-3" />
        </span>
        <span className="flex-1 pr-6 text-center text-[9px] font-medium">Create task</span>
      </div>
    </PhoneFrame>
  );
}
