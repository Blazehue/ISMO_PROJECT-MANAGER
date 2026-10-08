import { Activity } from 'lucide-react';
import { Marquee } from '@/components/fx/Marquee';
import { Reveal } from '@/components/motion/Reveal';
import { stackLogos } from './stackLogos';

/** "Built with" panel: real stack logos, greyscale until hovered (they light up in brand colour). */
export function LogoPanel() {
  return (
    <section aria-label="Built with" className="bg-canvas pt-8 pb-20">
      <Reveal className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14px] text-muted-foreground">Built on a modern, open-source stack</p>
          <a href="#principles" className="group inline-flex items-center gap-2.5 text-[13px]">
            <span className="flex size-7 items-center justify-center rounded-lg bg-lime text-lime-ink transition-transform duration-300 group-hover:rotate-12">
              <Activity className="size-3.5" />
            </span>
            How it's built
          </a>
        </div>
        <div className="mt-5 rounded-[22px] bg-card/70 py-9 ring-1 ring-border/60 backdrop-blur">
          <Marquee duration={36}>
            {stackLogos.map((logo) => (
              <span
                key={logo.title}
                title={logo.title}
                style={{ '--logo': logo.hex } as React.CSSProperties}
                className="group/logo flex items-center gap-2.5 px-9 text-muted-foreground/70 transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-7 fill-current transition-all duration-300 group-hover/logo:scale-110 group-hover/logo:fill-(--logo)"
                  aria-hidden
                >
                  <path d={logo.path} />
                </svg>
                <span className="text-[15px] font-medium tracking-tight transition-colors group-hover/logo:text-foreground">
                  {logo.title}
                </span>
              </span>
            ))}
          </Marquee>
        </div>
      </Reveal>
    </section>
  );
}
