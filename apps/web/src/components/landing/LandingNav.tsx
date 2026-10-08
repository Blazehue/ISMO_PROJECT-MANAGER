import { ArrowRight, Menu } from 'lucide-react';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/lib/auth';
import { spring } from '@/lib/motion';
import { cn } from '@/lib/utils';

export const sections = [
  { id: 'features', label: 'Features' },
  { id: 'platform', label: 'Platform' },
  { id: 'android', label: 'Android' },
  { id: 'principles', label: 'Principles' },
  { id: 'faq', label: 'FAQ' },
];

/** Highlights whichever section is currently in the middle of the viewport. */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return active;
}

function NavCta() {
  const { status } = useAuth();
  const signedIn = status === 'authenticated';
  return (
    <Link
      to={signedIn ? '/dashboard' : '/register'}
      className="group flex h-10 items-center gap-2.5 rounded-xl bg-card py-1 pr-4 pl-1 text-[13.5px] font-medium shadow-card transition-transform hover:-translate-y-0.5"
    >
      <span className="relative flex size-8 items-center justify-center overflow-hidden rounded-[9px] bg-muted">
        <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-[180%]" />
        <ArrowRight className="absolute size-3.5 -translate-x-[180%] transition-transform duration-500 group-hover:translate-x-0" />
      </span>
      {signedIn ? 'Dashboard' : 'Get started'}
    </Link>
  );
}

export function LandingNav() {
  const { status } = useAuth();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection();
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 40));

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      {/* Transparent at the top; becomes a floating glass bar once you scroll */}
      <motion.div
        animate={{
          backgroundColor: scrolled
            ? 'color-mix(in oklab, var(--card) 82%, transparent)'
            : 'color-mix(in oklab, var(--card) 0%, transparent)',
          boxShadow: scrolled ? '0 12px 40px -18px rgb(36 36 38 / 0.35)' : '0 0 0 0 rgb(0 0 0 / 0)',
          maxWidth: scrolled ? 1120 : 1240,
        }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={cn('mx-auto flex h-14 items-center gap-4 rounded-2xl px-3 sm:px-4', scrolled && 'backdrop-blur-xl')}
      >
        <Link to="/" aria-label="ISMO Workspace home" className="shrink-0">
          <Logo subtitle={false} />
        </Link>

        <nav className="relative mx-auto hidden items-center gap-1 md:flex" aria-label="Sections">
          {sections.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={cn(
                'relative rounded-lg px-3 py-1.5 text-[13.5px] transition-colors',
                active === id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {active === id && (
                <motion.span
                  layoutId="nav-section"
                  transition={spring}
                  className="absolute inset-0 rounded-lg bg-muted"
                />
              )}
              <span className="relative">{label}</span>
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <ThemeToggle />
          {status !== 'authenticated' && (
            <Link
              to="/login"
              className="hidden px-3 text-[13.5px] text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Log in
            </Link>
          )}
          <div className="hidden sm:block">
            <NavCta />
          </div>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-xl border bg-card md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </motion.div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-72 p-6">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Logo subtitle={false} />
          <nav className="mt-8 flex flex-col gap-1" aria-label="Sections">
            {sections.map(({ id, label }, i) => (
              <motion.a
                key={id}
                href={`#${id}`}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-lg px-3 py-2.5 text-[15px] hover:bg-muted"
              >
                {label}
              </motion.a>
            ))}
          </nav>
          <div className="mt-8 grid gap-2">
            <NavCta />
            {status !== 'authenticated' && (
              <Link to="/login" className="rounded-xl border px-4 py-2.5 text-center text-sm">
                Log in
              </Link>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
