import { Check, Fingerprint, Keyboard, LogOut, Monitor, Moon, Smartphone, Sun, UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { initials } from '@/components/layout/AppLayout';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/queries';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { useTheme, type ThemePreference } from '@/lib/theme';
import { cn } from '@/lib/utils';

const themeOptions: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

/** Miniature of the app in a given theme, used as the appearance option preview. */
function ThemePreview({ mode }: { mode: ThemePreference }) {
  const half = (dark: boolean) => (
    <div className={cn('flex h-full flex-1 gap-1 p-1.5', dark ? 'bg-[#0b0b0e]' : 'bg-white')}>
      <div className={cn('w-4 rounded-sm', dark ? 'bg-[#17171c]' : 'bg-[#f2f2f4]')} />
      <div className="flex flex-1 flex-col gap-1">
        <div className={cn('h-1.5 w-2/3 rounded-full', dark ? 'bg-[#2c2c34]' : 'bg-[#e4e4e8]')} />
        <div className="grid flex-1 grid-cols-2 gap-1">
          <div
            className={cn('rounded-sm border', dark ? 'border-[#26262d] bg-[#121216]' : 'border-[#e9e9ec] bg-white')}
          />
          <div
            className={cn('rounded-sm border', dark ? 'border-[#26262d] bg-[#121216]' : 'border-[#e9e9ec] bg-white')}
          />
        </div>
        <div className="h-1.5 w-1/2 rounded-full bg-[#a99bfa]" />
      </div>
    </div>
  );
  return (
    <div className="flex h-20 overflow-hidden rounded-lg border">
      {mode === 'system' ? (
        <>
          {half(false)}
          {half(true)}
        </>
      ) : (
        half(mode === 'dark')
      )}
    </div>
  );
}

export function AccountPage() {
  useDocumentTitle('Account');
  const { user, logout } = useAuth();
  const { preference, setPreference } = useTheme();
  const { data } = useDashboard();
  const navigate = useNavigate();
  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out');
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" title="Account" description="Your profile, appearance and session." />

      {/* Profile */}
      <Reveal className="surface relative overflow-hidden">
        <div className="h-24 bg-[radial-gradient(ellipse_80%_120%_at_20%_0%,var(--brand-200),transparent_70%),linear-gradient(90deg,var(--brand-50),var(--subtle))]" />
        <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.15 }}
              className="-mt-10 flex size-20 shrink-0 items-center justify-center rounded-2xl border-4 border-card bg-gradient-to-br from-brand-400 to-brand-700 text-2xl font-semibold text-white shadow-lg"
            >
              {initials(user.name)}
            </motion.div>
            <div className="min-w-0 pb-0.5">
              <h2 className="truncate text-[22px] leading-tight tracking-[-0.03em]">{user.name}</h2>
              <p className="truncate text-[13px] text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="text-[12.5px] text-muted-foreground">Member since {formatDate(user.createdAt)}</div>
        </div>
        <div className="grid grid-cols-3 gap-px border-t bg-border">
          {[
            ['Projects', data?.totalProjects],
            ['Tasks', data?.totalTasks],
            ['Completed', data?.completedTasks],
          ].map(([label, value]) => (
            <div key={label as string} className="bg-card px-5 py-4">
              <div className="text-[12px] text-muted-foreground">{label}</div>
              <div className="mt-1 text-[24px] leading-none tracking-[-0.04em]">
                {typeof value === 'number' ? <AnimatedNumber value={value} /> : '–'}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Appearance */}
        <Reveal delay={0.05}>
          <SectionCard
            icon={Sun}
            title="Appearance"
            description="Choose how ISMO Workspace looks on this device"
            className="h-full"
          >
            <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label="Theme">
              {themeOptions.map(({ value, label, icon: Icon }) => {
                const selected = preference === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setPreference(value)}
                    className={cn(
                      'relative rounded-xl border p-2 text-left transition-all',
                      selected ? 'border-brand-400 ring-3 ring-brand-400/20' : 'hover:border-brand-200',
                    )}
                  >
                    <ThemePreview mode={value} />
                    <div className="mt-2 flex items-center justify-between px-0.5 text-[12.5px]">
                      <span className="flex items-center gap-1.5">
                        <Icon className="size-3.5 text-muted-foreground" /> {label}
                      </span>
                      {selected && (
                        <motion.span
                          layoutId="theme-check"
                          className="flex size-4 items-center justify-center rounded-full bg-brand-500 text-white"
                        >
                          <Check className="size-2.5" strokeWidth={3} />
                        </motion.span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </Reveal>

        {/* Shortcuts */}
        <Reveal delay={0.1}>
          <SectionCard
            icon={Keyboard}
            title="Keyboard shortcuts"
            description="Move faster on the web app"
            className="h-full"
          >
            <ul className="divide-y rounded-lg border">
              {[
                ['Search tasks', '/'],
                ['New project', 'N'],
                ['Close a dialog', 'Esc'],
              ].map(([label, key]) => (
                <li key={label} className="flex items-center justify-between px-3.5 py-3 text-[13px]">
                  {label}
                  <kbd className="rounded-md border bg-subtle px-2 py-0.5 font-sans text-[11.5px] text-muted-foreground shadow-card">
                    {key}
                  </kbd>
                </li>
              ))}
            </ul>
          </SectionCard>
        </Reveal>
      </div>

      {/* Security & sessions */}
      <Reveal delay={0.05}>
        <SectionCard icon={Fingerprint} title="Security & sessions" description="How your account is protected">
          <ul className="divide-y rounded-lg border">
            {[
              {
                icon: Fingerprint,
                title: 'Password',
                body: 'Stored only as a bcrypt hash. Nobody can read it, including us.',
              },
              {
                icon: UserRound,
                title: 'This browser',
                body: 'Signed in with a short-lived access token kept in memory, renewed through a secure httpOnly cookie.',
              },
              {
                icon: Smartphone,
                title: 'Android app',
                body: 'Log in with the same email and password. Your session is kept in the device keystore.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex items-start gap-3 px-3.5 py-3.5">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-subtle">
                  <Icon className="size-4 text-muted-foreground" strokeWidth={1.7} />
                </span>
                <div>
                  <div className="text-[13.5px] font-medium">{title}</div>
                  <div className="text-[12.5px] leading-relaxed text-muted-foreground">{body}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50/50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-red-500/20 dark:bg-red-500/5">
            <div>
              <div className="text-[13.5px] font-medium">Log out of this browser</div>
              <div className="text-[12.5px] text-muted-foreground">
                Ends this session and revokes its refresh token.
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-destructive hover:bg-red-50 hover:text-destructive dark:hover:bg-red-500/10"
            >
              <LogOut /> Log out
            </Button>
          </div>
        </SectionCard>
      </Reveal>
    </div>
  );
}
