import type { Project } from '@ismo/shared';
import { CalendarDays, ListChecks, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { TickProgress } from '@/components/common/ProgressBar';
import { ArrowCircle } from '@/components/fx/ArrowCircle';
import { ProjectStatusBadge } from '@/components/common/ToneBadge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/format';

export function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="surface group relative flex flex-col p-4 transition-colors hover:border-brand-200">
      <div className="flex items-start justify-between gap-3">
        <ProjectStatusBadge status={project.status} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="relative z-10 -mt-0.5 -mr-1 text-muted-foreground"
              aria-label={`Actions for ${project.name}`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="mt-3 text-[15.5px] leading-snug">
        {/* The ::after overlay makes the whole card clickable while the menu stays on top. */}
        <Link
          to={`/projects/${project.id}`}
          className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
        >
          {project.name}
        </Link>
      </h3>
      <p className="mt-1 line-clamp-2 min-h-[38px] text-[12.5px] leading-relaxed text-muted-foreground">
        {project.description || 'No description'}
      </p>

      <TickProgress value={project.progress} className="mt-4" />

      <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3 text-[11.5px] text-muted-foreground">
        <div className="min-w-0 space-y-1">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <ListChecks className="size-3.5" strokeWidth={1.7} />
            {project.completedTaskCount}/{project.taskCount} TASKS
          </span>
          <span className="flex items-center gap-1.5 truncate">
            <CalendarDays className="size-3.5 shrink-0" strokeWidth={1.7} />
            {formatDate(project.startDate)} – {formatDate(project.endDate, 'Ongoing')}
          </span>
        </div>
        <ArrowCircle className="size-7 bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground" />
      </div>
    </article>
  );
}
