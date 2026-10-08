import type { Paginated, Project, Task } from '@ismo/shared';
import { useQuery } from '@tanstack/react-query';
import {
  CornerDownLeft,
  FolderClosed,
  FolderPlus,
  House,
  ListPlus,
  ListTodo,
  Loader2,
  LogOut,
  Moon,
  Search,
  Sun,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import { TaskStatusBadge } from '@/components/common/ToneBadge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

interface Item {
  id: string;
  group: 'Actions' | 'Projects' | 'Tasks';
  label: string;
  hint?: string;
  icon: LucideIcon;
  extra?: React.ReactNode;
  run: () => void;
}

/** ⌘K palette: jump to any project or task, or run an action, without leaving the keyboard. */
export function CommandPalette({
  open,
  onOpenChange,
  onNewProject,
  onNewTask,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewProject: () => void;
  onNewTask: () => void;
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { resolved, setPreference } = useTheme();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const search = useDebouncedValue(query.trim(), 180);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);

  const results = useQuery({
    queryKey: ['palette', search],
    enabled: open && search.length > 0,
    queryFn: async () => {
      const [projects, tasks] = await Promise.all([
        api.get<Paginated<Project>>('/projects', { params: { search, limit: 5 } }),
        api.get<Paginated<Task>>('/tasks', { params: { search, limit: 6 } }),
      ]);
      return { projects: projects.data.data, tasks: tasks.data.data };
    },
    staleTime: 10_000,
  });

  const close = () => onOpenChange(false);
  const go = (to: string) => () => {
    close();
    navigate(to);
  };

  const items = useMemo<Item[]>(() => {
    const actions: Item[] = [
      {
        id: 'new-project',
        group: 'Actions',
        label: 'New project',
        hint: 'N',
        icon: FolderPlus,
        run: () => (close(), onNewProject()),
      },
      {
        id: 'new-task',
        group: 'Actions',
        label: 'New task',
        hint: 'T',
        icon: ListPlus,
        run: () => (close(), onNewTask()),
      },
      { id: 'go-dashboard', group: 'Actions', label: 'Go to Dashboard', icon: House, run: go('/dashboard') },
      { id: 'go-projects', group: 'Actions', label: 'Go to Projects', icon: FolderClosed, run: go('/projects') },
      { id: 'go-tasks', group: 'Actions', label: 'Go to Tasks', icon: ListTodo, run: go('/tasks') },
      { id: 'go-account', group: 'Actions', label: 'Go to Account', icon: UserRound, run: go('/account') },
      {
        id: 'theme',
        group: 'Actions',
        label: resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        icon: resolved === 'dark' ? Sun : Moon,
        run: () => (close(), setPreference(resolved === 'dark' ? 'light' : 'dark')),
      },
      {
        id: 'logout',
        group: 'Actions',
        label: 'Log out',
        icon: LogOut,
        run: () => (close(), void logout().then(() => navigate('/login'))),
      },
    ];
    const needle = query.trim().toLowerCase();
    const matchingActions = needle ? actions.filter((a) => a.label.toLowerCase().includes(needle)) : actions;
    const projectItems: Item[] = (results.data?.projects ?? []).map((project) => ({
      id: `p-${project.id}`,
      group: 'Projects',
      label: project.name,
      hint: `${project.progress}%`,
      icon: FolderClosed,
      run: go(`/projects/${project.id}`),
    }));
    const taskItems: Item[] = (results.data?.tasks ?? []).map((task) => ({
      id: `t-${task.id}`,
      group: 'Tasks',
      label: task.name,
      hint: task.project.name,
      icon: ListTodo,
      extra: <TaskStatusBadge status={task.status} />,
      run: go(`/projects/${task.project.id}`),
    }));
    return [...matchingActions, ...projectItems, ...taskItems];
  }, [query, results.data, resolved]);

  useEffect(() => setActive(0), [items.length]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => Math.min(items.length - 1, i + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      items[active]?.run();
    }
  };

  let lastGroup: string | null = null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="top-[18%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <div className="flex items-center gap-3 border-b px-4">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search projects and tasks, or type a command…"
            aria-label="Search projects and tasks, or type a command"
            className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
          {results.isFetching && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          <kbd className="rounded border bg-muted px-1.5 font-mono text-[10.5px] text-muted-foreground">ESC</kbd>
        </div>
        <div ref={listRef} className="max-h-[380px] overflow-y-auto p-2" role="listbox">
          {items.length === 0 ? (
            <div className="px-3 py-10 text-center text-[13px] text-muted-foreground">
              {results.isFetching ? 'Searching…' : `No results for “${query}”`}
            </div>
          ) : (
            items.map((item, index) => {
              const header = item.group !== lastGroup ? item.group : null;
              lastGroup = item.group;
              const Icon = item.icon;
              return (
                <div key={item.id}>
                  {header && (
                    <div className="label-mono px-3 pt-3 pb-1.5 text-[10px] text-muted-foreground">{header}</div>
                  )}
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === active}
                    data-index={index}
                    onMouseMove={() => setActive(index)}
                    onClick={item.run}
                    className="relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px]"
                  >
                    <AnimatePresence>
                      {index === active && (
                        <motion.span
                          layoutId="palette-active"
                          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                          className="absolute inset-0 rounded-lg bg-muted"
                        />
                      )}
                    </AnimatePresence>
                    <span
                      className={cn(
                        'relative flex size-7 items-center justify-center rounded-md transition-colors',
                        index === active ? 'bg-lime text-lime-ink' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <span className="relative min-w-0 flex-1 truncate">{item.label}</span>
                    {item.extra && <span className="relative">{item.extra}</span>}
                    {item.hint && (
                      <span className="relative max-w-[140px] truncate font-mono text-[11px] text-muted-foreground">
                        {item.hint}
                      </span>
                    )}
                    {index === active && <CornerDownLeft className="relative size-3.5 text-muted-foreground" />}
                  </button>
                </div>
              );
            })
          )}
        </div>
        <div className="flex items-center gap-4 border-t bg-subtle px-4 py-2 font-mono text-[10.5px] text-muted-foreground">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span className="ml-auto">⌘K anywhere</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
