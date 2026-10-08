import { ClickSpark } from '@/components/fx/ClickSpark';
import { AndroidSection } from '@/components/landing/AndroidSection';
import { CtaBand, Footer } from '@/components/landing/CtaFooter';
import { Faq } from '@/components/landing/Faq';
import { Hero } from '@/components/landing/Hero';
import { LandingNav } from '@/components/landing/LandingNav';
import { LogoPanel } from '@/components/landing/LogoPanel';
import { Platform } from '@/components/landing/Platform';
import { Principles } from '@/components/landing/Principles';
import { StackCards } from '@/components/landing/StackCards';
import { Statement } from '@/components/landing/Statement';
import { WorkflowTabs } from '@/components/landing/WorkflowTabs';
import { ScrollProgress } from '@/components/fx/ScrollProgress';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

export function LandingPage() {
  useDocumentTitle('Projects and tasks, on web and Android');
  useSmoothScroll();
  return (
    <div className="min-h-dvh overflow-x-clip bg-background">
      <ScrollProgress />
      <ClickSpark />
      <LandingNav />
      <main>
        <Hero />
        <LogoPanel />
        <Statement />
        <StackCards />
        <Platform />
        <WorkflowTabs />
        <AndroidSection />
        <Principles />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
