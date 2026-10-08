import type { Project } from '@ismo/shared';
import { ArrowRight, CalendarDays, ListChecks } from 'lucide-react';
import { Link } from 'react-router';
import { TickProgress } from '@/components/common/ProgressBar';
import { ProjectStatusBadge } from '@/components/common/ToneBadge';
import { formatDate } from '@/lib/format';

/** Bordered project row with the striped progress bar (dashboard "Project overview"). */
export function ProjectRow({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 rounded-lg border bg-card px-3.5 py-3 transition-colors hover:border-brand-200 hover:bg-subtle md:grid-cols-[minmax(0,1fr)_auto_minmax(0,0.9fr)_auto]"
    >
      <div className="min-w-0">
        <div className="truncate text-[13.5px] font-medium">{project.name}</div>
        <div className="mt-1 flex items-center gap-3 text-[11.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3" />
            {project.endDate ? `Due ${formatDate(project.endDate)}` : 'No end date'}
          </span>
          <span className="inline-flex items-center gap-1">
            <ListChecks className="size-3" />
            {project.taskCount} {project.taskCount === 1 ? 'task' : 'tasks'}
          </span>
        </div>
      </div>
      <ProjectStatusBadge status={project.status} />
      <TickProgress value={project.progress} className="col-span-2 md:col-span-1" />
      <ArrowRight className="hidden size-4 -translate-x-2 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 md:block" />
    </Link>
  );
}
