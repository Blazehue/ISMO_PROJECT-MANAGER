import type { Project } from '@ismo/shared';
import { FolderClosed, Plus, SearchX } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { SearchInput } from '@/components/common/SearchInput';
import { SelectFilter } from '@/components/common/SelectFilter';
import { EmptyState, ErrorState } from '@/components/common/States';
import { useOpenNewProject } from '@/components/layout/AppLayout';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/hooks/queries';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useUrlParams } from '@/hooks/useUrlParams';
import { ease } from '@/lib/motion';
import { projectStatusOptions } from '@/lib/options';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 9;

const sortOptions = [
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'name:asc', label: 'Name A–Z' },
  { value: 'endDate:asc', label: 'End date' },
];

export function ProjectsPage() {
  useDocumentTitle('Projects');
  const openNewProject = useOpenNewProject();
  const { get, update, page } = useUrlParams();
  const [search, setSearch] = useState(get('search'));
  const debouncedSearch = useDebouncedValue(search.trim());
  const status = get('status');
  const sort = get('sort');
  const [sortBy, sortOrder] = (sort || 'createdAt:desc').split(':') as [string, 'asc' | 'desc'];

  const [editing, setEditing] = useState<Project | undefined>();
  const [deleting, setDeleting] = useState<Project | null>(null);

  const query = useProjects({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: status || undefined,
    sortBy,
    sortOrder,
  });

  const hasFilters = Boolean(debouncedSearch || status);
  const clearFilters = () => {
    setSearch('');
    update({ search: '', status: '', page: '' });
  };

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Workspace" title="Projects" description="Everything you're working on, in one place." />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            update({ search: value.trim(), page: '' });
          }}
          placeholder="Search projects by name"
        />
        <div className="flex gap-2 sm:ml-auto">
          <SelectFilter
            ariaLabel="Filter by status"
            allLabel="All statuses"
            value={status}
            onChange={(value) => update({ status: value, page: '' })}
            options={projectStatusOptions}
          />
          <SelectFilter
            ariaLabel="Sort projects"
            allLabel="Newest first"
            value={sort}
            onChange={(value) => update({ sort: value, page: '' })}
            options={sortOptions}
          />
        </div>
      </div>

      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : query.data.data.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={SearchX}
            title="No matching projects"
            description="Try a different search or clear the filters."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={FolderClosed}
            title="No projects yet"
            description="Projects group related tasks. Create one to get started."
            action={
              <Button onClick={openNewProject}>
                <Plus /> New project
              </Button>
            }
          />
        )
      ) : (
        <div className="space-y-3">
          <div
            className={cn(
              'grid gap-3 transition-opacity sm:grid-cols-2 xl:grid-cols-3',
              query.isPlaceholderData && 'opacity-60',
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {query.data.data.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.45, ease, delay: Math.min(index, 8) * 0.04 }}
                >
                  <ProjectCard
                    project={project}
                    onEdit={() => setEditing(project)}
                    onDelete={() => setDeleting(project)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <Pagination
            pagination={query.data.pagination}
            noun="projects"
            onPageChange={(next) => update({ page: String(next) })}
          />
        </div>
      )}

      <ProjectFormDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(undefined)}
        project={editing}
      />
      <DeleteProjectDialog project={deleting} onOpenChange={(open) => !open && setDeleting(null)} />
    </div>
  );
}
