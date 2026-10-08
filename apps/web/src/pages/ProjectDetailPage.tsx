import type { Project } from '@ismo/shared';
import axios from 'axios';
import { motion } from 'motion/react';
import {
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  Flag,
  ListChecks,
  Pencil,
  Plus,
  SearchX,
  Trash2,
  Columns3,
  Rows3,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Pagination } from '@/components/common/Pagination';
import { TickProgress } from '@/components/common/ProgressBar';
import { EmptyState, ErrorState } from '@/components/common/States';
import { ProjectStatusBadge } from '@/components/common/ToneBadge';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog';
import { ManagedTaskList } from '@/components/tasks/ManagedTaskList';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProject, useTasks } from '@/hooks/queries';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useUrlParams } from '@/hooks/useUrlParams';
import { Reveal } from '@/components/motion/Reveal';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

export function ProjectDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const projectQuery = useProject(id);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const project = projectQuery.data;
  useDocumentTitle(project?.name ?? 'Project');

  return (
    <div className="space-y-6">
      <nav className="label-mono flex items-center gap-1.5 text-[10.5px] text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/projects" className="hover:text-foreground">
          Projects
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="truncate text-foreground">{project?.name ?? '…'}</span>
      </nav>

      {projectQuery.isError ? (
        axios.isAxiosError(projectQuery.error) && [400, 404].includes(projectQuery.error.response?.status ?? 0) ? (
          // Someone else's project and a missing one look identical by design (the API returns 404 for both).
          <EmptyState
            icon={SearchX}
            title="Project not found"
            description="It may have been deleted, or it belongs to another account."
            action={
              <Button asChild variant="outline">
                <Link to="/projects">Back to projects</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState error={projectQuery.error} onRetry={() => projectQuery.refetch()} />
        )
      ) : (
        <>
          {project ? (
            <Reveal y={10}>
              <ProjectOverview
                project={project}
                onEdit={() => setEditOpen(true)}
                onDelete={() => setDeleteOpen(true)}
              />
            </Reveal>
          ) : (
            <Skeleton className="h-64 rounded-xl" />
          )}
          <Reveal delay={0.1}>
            <ProjectTasks projectId={id} />
          </Reveal>
        </>
      )}

      {project && (
        <>
          <ProjectFormDialog open={editOpen} onOpenChange={setEditOpen} project={project} />
          <DeleteProjectDialog
            project={deleteOpen ? project : null}
            onOpenChange={setDeleteOpen}
            onDeleted={() => navigate('/projects', { replace: true })}
          />
        </>
      )}
    </div>
  );
}

function Meta({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="bg-card px-4 py-3.5 sm:px-5">
      <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-[13.5px] font-medium">{children}</div>
    </div>
  );
}

function ProjectOverview({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <section className="surface">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <ProjectStatusBadge status={project.status} />
          <h1 className="mt-2.5 text-[26px] leading-tight tracking-[-0.035em] sm:text-[28px]">{project.name}</h1>
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
            {project.description || 'No description yet.'}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:bg-red-50 hover:text-destructive dark:hover:bg-red-500/10"
            aria-label="Delete project"
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      {/* 1px gaps over a border-coloured background draw the cell dividers */}
      <div className="grid grid-cols-2 gap-px border-t bg-border lg:grid-cols-4">
        <Meta icon={<CalendarDays className="size-3.5" />} label="Start date">
          {formatDate(project.startDate)}
        </Meta>
        <Meta icon={<Flag className="size-3.5" />} label="End date">
          {formatDate(project.endDate, 'Ongoing')}
        </Meta>
        <Meta icon={<CalendarPlus className="size-3.5" />} label="Created">
          {formatDate(project.createdAt)}
        </Meta>
        <Meta icon={<ListChecks className="size-3.5" />} label="Tasks completed">
          {project.completedTaskCount} of {project.taskCount}
        </Meta>
      </div>

      <div className="border-t px-5 py-4">
        <div className="mb-2 text-[12.5px] text-muted-foreground">Progress</div>
        <TickProgress value={project.progress} />
      </div>
    </section>
  );
}

function ProjectTasks({ projectId }: { projectId: string }) {
  const { get, update, page } = useUrlParams();
  const [search, setSearch] = useState(get('q'));
  const debouncedSearch = useDebouncedValue(search.trim());
  const status = get('status');
  const priority = get('priority');
  const view = get('view') === 'board' ? 'board' : 'list';
  const [createOpen, setCreateOpen] = useState(false);

  // The board shows every task (no pagination) with statuses as columns.
  const tasksQuery = useTasks({
    projectId,
    page: view === 'board' ? 1 : page,
    limit: view === 'board' ? 100 : PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: view === 'board' ? undefined : status || undefined,
    priority: priority || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const hasFilters = Boolean(debouncedSearch || status || priority);
  const clearFilters = () => {
    setSearch('');
    update({ q: '', status: '', priority: '', page: '' });
  };
  const total = tasksQuery.data?.pagination.total;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-[20px]">
            Tasks
            {total !== undefined && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
                {total}
              </span>
            )}
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Track the work inside this project.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-muted p-0.5" role="tablist" aria-label="Task view">
            {(
              [
                ['list', 'List', Rows3],
                ['board', 'Board', Columns3],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={view === value}
                onClick={() => update({ view: value === 'list' ? '' : value, page: '' })}
                className={cn(
                  'relative flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] transition-colors',
                  view === value ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {view === value && (
                  <motion.span
                    layoutId="task-view"
                    transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                    className="absolute inset-0 rounded-md bg-card shadow-card"
                  />
                )}
                <Icon className="relative size-3.5" />
                <span className="relative hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus /> Add task
          </Button>
        </div>
      </div>

      <TaskFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          update({ q: value.trim(), page: '' });
        }}
        status={status}
        priority={priority}
        onChange={update}
        hideStatus={view === 'board'}
      />

      {tasksQuery.isError ? (
        <ErrorState error={tasksQuery.error} onRetry={() => tasksQuery.refetch()} />
      ) : tasksQuery.isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : tasksQuery.data.data.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={SearchX}
            title="No matching tasks"
            description="Try a different search or clear the filters."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={ListChecks}
            title="No tasks yet"
            description="Break this project into tasks to track progress."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus /> Add task
              </Button>
            }
          />
        )
      ) : (
        <div className={cn('space-y-3 transition-opacity', tasksQuery.isPlaceholderData && 'opacity-60')}>
          {view === 'board' ? (
            <TaskBoard tasks={tasksQuery.data.data} projectId={projectId} />
          ) : (
            <>
              <ManagedTaskList tasks={tasksQuery.data.data} />
              <Pagination
                pagination={tasksQuery.data.pagination}
                noun="tasks"
                onPageChange={(next) => update({ page: String(next) })}
              />
            </>
          )}
        </div>
      )}

      <TaskFormDialog open={createOpen} onOpenChange={setCreateOpen} projectId={projectId} />
    </section>
  );
}
