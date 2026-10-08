import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ease } from '@/lib/motion';

export function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,var(--brand-100),transparent_75%)]" />
      <header className="relative mx-auto flex h-16 w-full max-w-6xl items-center px-5 sm:px-8">
        <Link to="/">
          <Logo subtitle={false} />
        </Link>
      </header>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="relative flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center"
      >
        <div className="text-[96px] leading-none font-medium tracking-[-0.06em] text-brand-300 sm:text-[128px]">
          404
        </div>
        <h1 className="mt-4 text-[26px] tracking-[-0.035em]">This page wandered off</h1>
        <p className="mt-2 max-w-sm text-[14px] text-muted-foreground">
          The link may be broken, or the page may have moved. Let’s get you back on track.
        </p>
        <div className="mt-7 flex gap-2">
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft /> Home
            </Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
