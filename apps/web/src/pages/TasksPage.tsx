import { AlarmClock, ListTodo, SearchX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { SelectFilter } from '@/components/common/SelectFilter';
import { EmptyState, ErrorState } from '@/components/common/States';
import { ManagedTaskList } from '@/components/tasks/ManagedTaskList';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { useTasks } from '@/hooks/queries';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useUrlParams } from '@/hooks/useUrlParams';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 15;

const sortOptions = [
  { value: 'dueDate:asc', label: 'Due date' },
  { value: 'priority:desc', label: 'Priority' },
  { value: 'name:asc', label: 'Name A–Z' },
];

/** Every task the user owns, across all projects. */
export function TasksPage() {
  useDocumentTitle('Tasks');
  const { get, update, page } = useUrlParams();
  const urlSearch = get('q');
  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(search.trim());
  const status = get('status');
  const priority = get('priority');
  const overdue = get('overdue') === '1';
  const sort = get('sort');
  const [sortBy, sortOrder] = (sort || 'createdAt:desc').split(':') as [string, 'asc' | 'desc'];

  // The global search box in the top bar navigates here with ?q=.
  useEffect(() => setSearch(urlSearch), [urlSearch]);

  const query = useTasks({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: status || undefined,
    priority: priority || undefined,
    overdue: overdue || undefined,
    sortBy,
    sortOrder,
  });

  const hasFilters = Boolean(debouncedSearch || status || priority || overdue);
  const clearFilters = () => {
    setSearch('');
    update({ q: '', status: '', priority: '', overdue: '', page: '' });
  };

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Workspace" title="Tasks" description="Every task across all of your projects." />

      <TaskFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          update({ q: value.trim(), page: '' });
        }}
        status={status}
        priority={priority}
        onChange={update}
      >
        <button
          type="button"
          onClick={() => update({ overdue: overdue ? '' : '1', page: '' })}
          aria-pressed={overdue}
          className={cn(
            'inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-[13px] transition-colors',
            overdue
              ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
              : 'bg-card text-muted-foreground hover:text-foreground',
          )}
        >
          <AlarmClock className="size-3.5" /> Overdue
        </button>
        <SelectFilter
          ariaLabel="Sort tasks"
          allLabel="Newest first"
          value={sort}
          onChange={(value) => update({ sort: value, page: '' })}
          options={sortOptions}
          className="sm:w-[140px]"
        />
      </TaskFilters>

      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : query.data.data.length === 0 ? (
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
            icon={ListTodo}
            title="No tasks yet"
            description="Open a project and add tasks to see them here."
          />
        )
      ) : (
        <div className={cn('space-y-3 transition-opacity', query.isPlaceholderData && 'opacity-60')}>
          <ManagedTaskList tasks={query.data.data} showProject />
          <Pagination
            pagination={query.data.pagination}
            noun="tasks"
            onPageChange={(next) => update({ page: String(next) })}
          />
        </div>
      )}
    </div>
  );
}
