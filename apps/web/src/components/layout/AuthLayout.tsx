import { CalendarDays, FolderOpen } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ease } from '@/lib/motion';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

const previewProjects = [
  { name: 'Organoid Imaging Pipeline', status: 'In Progress', tone: 'amber', progress: 80, due: 'Due Nov 20' },
  { name: 'Bioreactor Firmware v2', status: 'Not Started', tone: 'pink', progress: 40, due: 'Due Jan 4' },
  { name: 'Customer Order Portal', status: 'Completed', tone: 'green', progress: 100, due: 'Due Sep 26' },
] as const;

const pillTone = {
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  pink: 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
};

/** Decorative, static preview of the app (aria-hidden). */
function ProductPreview() {
  return (
    <div aria-hidden className="surface w-full max-w-[460px] p-4 shadow-[0_24px_60px_-20px_rgb(117_99_236/0.35)]">
      <div className="text-[19px] font-medium tracking-[-0.03em]">Welcome back, Jane.</div>
      <div className="text-[11px] text-muted-foreground">
        Here&apos;s what&apos;s happening with your projects today.
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[
          ['Active projects', '12', '+2 this month'],
          ['Tasks completed', '276', '+22% this week'],
        ].map(([label, value, hint]) => (
          <div key={label} className="rounded-lg border p-2.5">
            <div className="text-[10px] text-muted-foreground">{label}</div>
            <div className="mt-1.5 text-2xl tracking-[-0.04em]">{value}</div>
            <div className="mt-1 text-[9.5px] text-emerald-600 dark:text-emerald-400">{hint}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg border p-2.5">
        <div className="flex items-center gap-1.5 text-[13px] font-medium">
          <FolderOpen className="size-3.5 text-muted-foreground" strokeWidth={1.6} /> Project overview
        </div>
        <div className="mt-2 space-y-1.5">
          {previewProjects.map((project) => (
            <div
              key={project.name}
              className="grid grid-cols-[1fr_auto_90px] items-center gap-2 rounded-md border px-2 py-1.5"
            >
              <div className="min-w-0">
                <div className="truncate text-[10.5px] font-medium">{project.name}</div>
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <CalendarDays className="size-2.5" /> {project.due}
                </div>
              </div>
              <span className={`rounded px-1.5 py-px text-[9px] font-medium ${pillTone[project.tone]}`}>
                {project.status}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="relative h-2.5 flex-1 bg-[repeating-linear-gradient(90deg,var(--brand-100)_0_2px,transparent_2px_4px)]">
                  <div
                    className="absolute inset-y-0 left-0 bg-[repeating-linear-gradient(90deg,var(--brand-400)_0_2px,transparent_2px_4px)]"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <span className="w-6 text-right text-[10px] text-brand-500">{project.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuthLayout({ title, subtitle, children }: { title: ReactNode; subtitle: string; children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      {/* Soft lavender wash, as on the marketing hero */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,var(--brand-100),transparent_75%)]" />

      <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col px-5 sm:px-8">
        <header className="flex h-16 items-center justify-between">
          <Link to="/" aria-label="ISMO Workspace home">
            <Logo subtitle={false} />
          </Link>
          <ThemeToggle />
        </header>

        <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[minmax(0,400px)_1fr] lg:gap-16">
          <div className="w-full max-w-[400px]">
            <motion.h1
              initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, ease }}
              className="text-[40px] leading-[1.05] tracking-[-0.045em] sm:text-[44px]"
            >
              {title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.08 }}
              className="mt-3 mb-8 text-[15px] leading-relaxed text-muted-foreground"
            >
              {subtitle}
            </motion.p>
            {children}
          </div>

          <motion.div
            className="hidden justify-center lg:flex"
            initial={{ opacity: 0, x: 30, rotate: 1.5 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.2 }}
          >
            {/* Gentle idle float */}
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
              <ProductPreview />
            </motion.div>
          </motion.div>
        </div>

        <footer className="py-6 text-xs text-muted-foreground">
          ISMO Workspace · assessment build · test data only
        </footer>
      </div>
    </div>
  );
}
