import { CalendarCheck, FolderKanban, RefreshCw, type LucideIcon } from 'lucide-react';
import { ScrollRevealText } from '@/components/fx/ScrollRevealText';
import { Stagger, StaggerItem } from '@/components/motion/Reveal';

const pillars: { icon: LucideIcon; title: string; caption: string }[] = [
  { icon: FolderKanban, title: 'Plan projects', caption: 'Status, dates, progress' },
  { icon: CalendarCheck, title: 'Track every task', caption: 'Priority & due dates' },
  { icon: RefreshCw, title: 'Stay in sync', caption: 'Web and Android' },
];

export function Statement() {
  return (
    <section id="features" className="scroll-mt-24 bg-background py-28 sm:py-36">
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <ScrollRevealText
          className="justify-center text-[28px] leading-[1.25] font-normal tracking-[-0.03em] sm:text-[38px]"
          text="ISMO Workspace is a project and task platform for small teams that keeps every plan, deadline and update in one place, wherever the work happens."
        />
        <div className="mx-auto mt-12 h-px max-w-xl bg-border" />
        <Stagger className="mt-10 flex flex-wrap justify-center gap-x-12 gap-y-6" stagger={0.1}>
          {pillars.map(({ icon: Icon, title, caption }) => (
            <StaggerItem key={title} className="group flex items-center gap-3 text-left">
              <span className="flex size-11 items-center justify-center rounded-xl bg-lime text-lime-ink transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
                <Icon className="size-5" strokeWidth={1.8} />
              </span>
              <span>
                <span className="block text-[15px] font-medium">{title}</span>
                <span className="block text-[12.5px] text-muted-foreground">{caption}</span>
              </span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
