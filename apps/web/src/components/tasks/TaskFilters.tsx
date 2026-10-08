import { SearchInput } from '@/components/common/SearchInput';
import { SelectFilter } from '@/components/common/SelectFilter';
import { taskPriorityOptions, taskStatusOptions } from '@/lib/options';

export function TaskFilters({
  search,
  onSearchChange,
  status,
  priority,
  onChange,
  children,
  hideStatus,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  priority: string;
  onChange: (updates: Record<string, string>) => void;
  children?: React.ReactNode;
  /** The board view shows statuses as columns, so its status filter is hidden. */
  hideStatus?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <SearchInput value={search} onChange={onSearchChange} placeholder="Search tasks by name" />
      <div className="flex flex-wrap gap-2 sm:ml-auto">
        {children}
        {!hideStatus && (
          <SelectFilter
            ariaLabel="Filter by status"
            allLabel="All statuses"
            value={status}
            onChange={(value) => onChange({ status: value, page: '' })}
            options={taskStatusOptions}
          />
        )}
        <SelectFilter
          ariaLabel="Filter by priority"
          allLabel="All priorities"
          value={priority}
          onChange={(value) => onChange({ priority: value, page: '' })}
          options={taskPriorityOptions}
        />
      </div>
    </div>
  );
}
