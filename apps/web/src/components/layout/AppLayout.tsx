import type { Project } from '@ismo/shared';
import {
  ChevronsUpDown,
  FolderClosed,
  House,
  ListPlus,
  ListTodo,
  LogOut,
  Menu,
  Plus,
  Search,
  Smartphone,
  UserRound,
} from 'lucide-react';
import { motion } from 'motion/react';
import { createContext, useContext, useEffect, useId, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { ClickSpark } from '@/components/fx/ClickSpark';
import { ScrollProgress } from '@/components/fx/ScrollProgress';
import { PulseDot } from '@/components/fx/PulseDot';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { CommandPalette } from './CommandPalette';
import { PageTransition } from '@/components/motion/PageTransition';
import { toast } from 'sonner';
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useDashboard } from '@/hooks/queries';
import { useHotkey } from '@/hooks/useHotkey';
import { spring } from '@/lib/motion';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: House },
  { to: '/projects', label: 'Projects', icon: FolderClosed },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/account', label: 'Account', icon: UserRound },
];

// Lets any page open the shared "New project" dialog.
const NewProjectContext = createContext<() => void>(() => {});
export const useOpenNewProject = () => useContext(NewProjectContext);
const NewTaskContext = createContext<() => void>(() => {});
export const useOpenNewTask = () => useContext(NewTaskContext);

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

function SidebarLabel({ children }: { children: string }) {
  return <div className="label-mono mb-1.5 px-2.5 text-[10px] text-muted-foreground">{children}</div>;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { data } = useDashboard();
  // Separate layout ids for the desktop sidebar and the mobile sheet.
  const indicatorId = useId();
  const recent = data?.recentProjects.slice(0, 4) ?? [];

  return (
    <>
      <div className="px-1.5">
        <Logo />
      </div>

      <div className="mt-8">
        <SidebarLabel>Navigation</SidebarLabel>
        <nav className="space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13.5px] transition-colors',
                  isActive
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* The active "card" slides between items */}
                  {isActive && (
                    <motion.span
                      layoutId={`nav-active-${indicatorId}`}
                      transition={spring}
                      className="absolute inset-0 rounded-lg border bg-nav-active shadow-card"
                    />
                  )}
                  <Icon className="relative size-4" strokeWidth={1.7} />
                  <span className="relative">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {recent.length > 0 && (
        <div className="mt-7">
          <SidebarLabel>Recent projects</SidebarLabel>
          <ul className="space-y-0.5">
            {recent.map((project: Project) => (
              <li key={project.id}>
                <NavLink
                  to={`/projects/${project.id}`}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'block truncate rounded-lg px-2.5 py-1.5 text-[13px] transition-colors',
                      isActive
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                    )
                  }
                >
                  {project.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto space-y-3 pt-6">
        <div className="rounded-xl border border-dashed p-3">
          <div className="flex items-center gap-2 text-[12.5px] font-medium">
            <Smartphone className="size-3.5 text-brand-500" /> Synced with Android
            <PulseDot className="ml-auto text-emerald-500" />
          </div>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
            Same account, same projects on the ISMO mobile app.
          </p>
        </div>
        <UserMenu />
      </div>
    </>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out');
    navigate('/login', { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
          {initials(user.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium">{user.name}</span>
          <span className="block truncate text-[11.5px] text-muted-foreground">{user.email}</span>
        </span>
        <ChevronsUpDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="text-sm font-medium">{user.name}</div>
          <div className="truncate text-xs text-muted-foreground">{user.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/account')}>
          <UserRound /> Account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} variant="destructive">
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TopBar({
  onOpenMenu,
  onNewProject,
  onNewTask,
  onOpenPalette,
}: {
  onOpenMenu: () => void;
  onNewProject: () => void;
  onNewTask: () => void;
  onOpenPalette: () => void;
}) {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground lg:hidden"
          onClick={onOpenMenu}
          aria-label="Open menu"
        >
          <Menu />
        </Button>
        {/* Opens the command palette: search projects and tasks, or run an action */}
        <button
          type="button"
          onClick={onOpenPalette}
          className="group flex h-9 w-full max-w-md items-center gap-2.5 rounded-lg bg-muted/70 px-3 text-left text-[13px] text-muted-foreground transition-colors hover:bg-muted"
        >
          <Search className="size-3.5 transition-transform duration-300 group-hover:scale-110" />
          <span className="flex-1 truncate">Search or jump to…</span>
          <kbd className="hidden rounded border bg-background px-1.5 font-mono text-[10.5px] sm:block">
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>
        </button>
        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <Button size="sm" variant="outline" onClick={onNewTask} className="hidden h-9 md:inline-flex">
            <ListPlus /> New task
          </Button>
          <button
            type="button"
            onClick={onNewProject}
            className="group flex h-9 items-center gap-2 rounded-[11px] bg-[#242426] py-1 pr-3.5 pl-1 text-[13px] font-medium text-white transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-[#111113]"
          >
            <span className="relative flex size-7 items-center justify-center overflow-hidden rounded-[8px] bg-lime text-lime-ink">
              <Plus className="size-3.5 transition-transform duration-500 group-hover:rotate-90" />
            </span>
            <span className="hidden sm:inline">New project</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export function AppLayout() {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const openNewProject = () => setNewProjectOpen(true);
  const openNewTask = () => setNewTaskOpen(true);
  useHotkey('n', openNewProject);
  useHotkey('t', openNewTask);
  useHotkey('/', () => setPaletteOpen(true));

  // ⌘K / Ctrl+K toggles the command palette from anywhere, even inside inputs.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <NewProjectContext.Provider value={openNewProject}>
      <NewTaskContext.Provider value={openNewTask}>
        <div className="min-h-dvh bg-background">
          <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-sidebar px-3 py-5 lg:flex">
            <SidebarContent />
          </aside>

          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetContent side="left" className="flex w-72 flex-col bg-sidebar p-3 py-5">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="lg:pl-60">
            <TopBar
              onOpenMenu={() => setMobileNavOpen(true)}
              onNewProject={openNewProject}
              onNewTask={openNewTask}
              onOpenPalette={() => setPaletteOpen(true)}
            />
            <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              <PageTransition>
                <Outlet />
              </PageTransition>
            </main>
          </div>

          <ClickSpark />
        <ScrollProgress className="h-[2px]" />
          <CommandPalette
            open={paletteOpen}
            onOpenChange={setPaletteOpen}
            onNewProject={openNewProject}
            onNewTask={openNewTask}
          />
          <TaskFormDialog open={newTaskOpen} onOpenChange={setNewTaskOpen} />
          <ProjectFormDialog
            open={newProjectOpen}
            onOpenChange={setNewProjectOpen}
            onSaved={(project) => navigate(`/projects/${project.id}`)}
          />
        </div>
      </NewTaskContext.Provider>
    </NewProjectContext.Provider>
  );
}
