import { taskStatusTone } from '@ismo/shared';
import {
  AlarmClock,
  ArrowRight,
  ArrowUpRight,
  CircleCheckBig,
  CircleDashed,
  FolderClosed,
  FolderOpen,
  ListTodo,
  PieChart,
  Plus,
  Rocket,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { StatCard, StatCardSkeleton } from '@/components/common/StatCard';
import { EmptyState, ErrorState } from '@/components/common/States';
import { UpcomingDeadlines, WorkloadChart } from '@/components/dashboard/Widgets';
import { useOpenNewProject, useOpenNewTask } from '@/components/layout/AppLayout';
import { ProjectRow } from '@/components/projects/ProjectRow';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard, useTasksByDueDate } from '@/hooks/queries';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { Reveal } from '@/components/motion/Reveal';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PulseDot } from '@/components/fx/PulseDot';
import { useAuth } from '@/lib/auth';
import { fadeUp, staggerContainer } from '@/lib/motion';

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const openNewProject = useOpenNewProject();
  const openNewTask = useOpenNewTask();
  const { data, isPending, isError, error, refetch } = useDashboard();
  const dueQuery = useTasksByDueDate();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const firstName = user?.name.split(' ')[0] ?? '';
  const completionRate = data && data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title={
          <>
            Welcome back, <span className="accent">{firstName}.</span>
          </>
        }
        description={`${today} · here's what's happening with your projects.`}
        pill={
          <>
            <PulseDot className="size-1.5 text-brand-400 [&>span]:size-1.5" /> Synced across web &amp; mobile
          </>
        }
      />

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <>
          {isPending ? (
            <section aria-label="Statistics" className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
              {Array.from({ length: 6 }, (_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </section>
          ) : (
            <motion.section
              aria-label="Statistics"
              className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6"
              variants={staggerContainer(0.05, 0.05)}
              initial="hidden"
              animate="visible"
            >
              <StatCard
                label="Total projects"
                to="/projects"
                hue="lavender"
                value={data.totalProjects}
                icon={FolderClosed}
                hint="Projects you own"
              />
              <StatCard
                label="Projects in progress"
                to="/projects?status=IN_PROGRESS"
                hue="sky"
                value={data.projectsInProgress}
                icon={Rocket}
                hint={`of ${data.totalProjects} projects`}
              />
              <StatCard
                label="Total tasks"
                to="/tasks"
                hue="lime"
                value={data.totalTasks}
                icon={ListTodo}
                hint={`${data.inProgressTasks} in progress`}
              />
              <StatCard
                label="Completed tasks"
                to="/tasks?status=COMPLETED"
                hue="mint"
                value={data.completedTasks}
                icon={CircleCheckBig}
                hint={<span className="text-emerald-600 dark:text-emerald-400">{completionRate}% completion rate</span>}
              />
              <StatCard
                label="Pending tasks"
                to="/tasks?status=PENDING"
                hue="peach"
                value={data.pendingTasks}
                icon={CircleDashed}
                hint="Not started yet"
              />
              <StatCard
                label="Overdue tasks"
                to="/tasks?overdue=1"
                hue="rose"
                value={data.overdueTasks}
                icon={AlarmClock}
                hint={
                  data.overdueTasks > 0 ? (
                    <span className="text-red-600 dark:text-red-400">Past their due date</span>
                  ) : (
                    'Nothing overdue'
                  )
                }
              />
            </motion.section>
          )}

          <Reveal delay={0.15} className="grid gap-4 lg:grid-cols-[1.65fr_1fr]">
            <SectionCard
              icon={FolderOpen}
              title="Project overview"
              description="Progress across your most recently updated projects"
              action={
                <Button variant="ghost" size="sm" asChild className="-mt-1 text-muted-foreground">
                  <Link to="/projects">
                    View all <ArrowUpRight />
                  </Link>
                </Button>
              }
            >
              {isPending ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }, (_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : data.recentProjects.length === 0 ? (
                <EmptyState
                  icon={FolderClosed}
                  title="No projects yet"
                  description="Create your first project to start tracking tasks."
                  action={
                    <Button onClick={openNewProject}>
                      <Plus /> New project
                    </Button>
                  }
                />
              ) : (
                <motion.div
                  className="space-y-2"
                  variants={staggerContainer(0.06, 0.2)}
                  initial="hidden"
                  animate="visible"
                >
                  {data.recentProjects.map((project) => (
                    <motion.div key={project.id} variants={fadeUp}>
                      <ProjectRow project={project} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </SectionCard>

            <SectionCard icon={PieChart} title="Task breakdown" description="Status of every task you own">
              {isPending ? (
                <Skeleton className="h-40 w-full rounded-lg" />
              ) : (
                <TaskBreakdown
                  completed={data.completedTasks}
                  inProgress={data.inProgressTasks}
                  pending={data.pendingTasks}
                  rate={completionRate}
                />
              )}
            </SectionCard>
          </Reveal>

          <Reveal delay={0.1} className="grid gap-4 lg:grid-cols-[1.65fr_1fr]">
            <UpcomingDeadlines tasks={dueQuery.data} loading={dueQuery.isPending} />
            <WorkloadChart tasks={dueQuery.data} loading={dueQuery.isPending} />
          </Reveal>

          <Reveal delay={0.1}>
            <SectionCard icon={Zap} title="Quick actions" description="Common tasks and shortcuts">
              <div className="flex flex-wrap gap-2">
                <QuickAction onClick={openNewProject} icon={Plus} label="Create new project" />
                <QuickAction onClick={openNewTask} icon={ListTodo} label="Create new task" />
                <QuickAction to="/tasks" icon={ListTodo} label="View all tasks" />
                <QuickAction to="/tasks?status=PENDING" icon={CircleDashed} label="Pending tasks" />
                <QuickAction to="/tasks?priority=HIGH" icon={AlarmClock} label="High priority" />
              </div>
            </SectionCard>
          </Reveal>
        </>
      )}
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  to,
  onClick,
}: {
  icon: typeof Plus;
  label: string;
  to?: string;
  onClick?: () => void;
}) {
  const className =
    'group inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-[12.5px] transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:bg-subtle hover:shadow-card active:translate-y-0';
  const content = (
    <>
      <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.7} />
      {label}
      <ArrowRight className="-ml-1 size-3.5 w-0 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:w-3.5 group-hover:opacity-100" />
    </>
  );
  return to ? (
    <Link to={to} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

function TaskBreakdown({
  completed,
  inProgress,
  pending,
  rate,
}: {
  completed: number;
  inProgress: number;
  pending: number;
  rate: number;
}) {
  const total = completed + inProgress + pending;
  const segments = [
    { key: 'COMPLETED', value: completed },
    { key: 'IN_PROGRESS', value: inProgress },
    { key: 'PENDING', value: pending },
  ] as const;

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-baseline gap-2">
        <span className="text-[40px] leading-none font-normal tracking-[-0.045em] tabular-nums">
          <AnimatedNumber value={rate} />
          <span className="text-xl text-muted-foreground">%</span>
        </span>
        <span className="text-xs text-muted-foreground">complete</span>
      </div>
      <div className="mt-4 flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-muted">
        {total > 0 &&
          segments.map(({ key, value }) =>
            value > 0 ? (
              <motion.div
                key={key}
                className="h-full"
                initial={{ width: 0 }}
                animate={{ width: `${(value / total) * 100}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                style={{ backgroundColor: taskStatusTone[key].solid }}
              />
            ) : null,
          )}
      </div>
      <ul className="mt-4 space-y-1">
        {segments.map(({ key, value }) => (
          <li key={key}>
            <Link
              to={`/tasks?status=${key}`}
              className="-mx-2 flex items-center justify-between rounded-md px-2 py-1 text-[13px] transition-colors hover:bg-muted"
            >
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2 rounded-full" style={{ backgroundColor: taskStatusTone[key].solid }} />
                {taskStatusTone[key].label}
              </span>
              <span className="font-medium tabular-nums">{value}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
