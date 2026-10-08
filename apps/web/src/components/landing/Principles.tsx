import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import { ease } from '@/lib/motion';
import { cn } from '@/lib/utils';

const principles = [
  {
    title: 'Ownership on every query',
    body: 'Projects and tasks are always looked up together with their owner. Someone else’s data returns “not found”, even if you guess its id.',
    facts: [
      ['Enforced in', 'Every read, update and delete'],
      ['Other users see', '404, never 403'],
      ['Covered by', 'Integration tests'],
    ],
    tone: 'bg-lime text-lime-ink',
  },
  {
    title: 'Sessions that rotate',
    body: 'Access tokens last 15 minutes; refresh tokens rotate on every use, and reusing an old one signs every session out.',
    facts: [
      ['Web', 'httpOnly, SameSite cookie'],
      ['Android', 'Device keystore'],
      ['On expiry', 'Back to login, with a message'],
    ],
    tone: 'bg-[#FFD9C7] text-[#3b1d0f]',
  },
  {
    title: 'One schema, three apps',
    body: 'The API, the website and the Android app validate with the same rules, so a form can never accept what the server rejects.',
    facts: [
      ['Shared', 'Zod schemas and types'],
      ['Checked', 'Fields, emails, dates, enums'],
      ['Bad input', 'Clear 400 with field errors'],
    ],
    tone: 'bg-[#CFE7FF] text-[#0d2a45]',
  },
  {
    title: 'Works when the signal doesn’t',
    body: 'The Android app keeps your last synced projects and tasks readable offline, and says so clearly instead of showing a blank screen.',
    facts: [
      ['Offline', 'Last synced data stays visible'],
      ['Refresh', 'Pull down on any list'],
      ['Reconnect', 'Refetches automatically'],
    ],
    tone: 'bg-[#E3DCFF] text-[#241a5c]',
  },
];

/** Colourful, draggable card carousel (in place of the reference's testimonials, with real content). */
export function Principles() {
  const [index, setIndex] = useState(0);
  const cardRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const go = (next: number) => setIndex((next + principles.length) % principles.length);

  // Slide by one card width (plus the gap); re-measured on resize.
  useEffect(() => {
    const measure = () => setStep((cardRef.current?.offsetWidth ?? 0) + 16);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <section id="principles" className="scroll-mt-24 px-3 py-6 sm:px-6">
      <div className="overflow-hidden rounded-[36px] bg-[#242426] px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1.5 text-[12.5px] text-white">
            Principles
          </span>
          <h2 className="mt-6 text-[36px] leading-[1.06] font-normal tracking-[-0.045em] text-white sm:text-[50px]">
            Built the <span className="accent text-lime">careful</span> way
          </h2>
        </Reveal>

        <div className="mx-auto mt-14 max-w-6xl">
          <motion.div
            className="flex cursor-grab gap-4 active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(index + 1);
              else if (info.offset.x > 60) go(index - 1);
            }}
            animate={{ x: -index * step }}
            transition={{ duration: 0.7, ease }}
          >
            {principles.map((p, i) => (
              <article
                key={p.title}
                ref={i === 0 ? cardRef : undefined}
                className={cn(
                  'grid w-full max-w-[760px] shrink-0 gap-8 rounded-[26px] p-8 transition-opacity duration-500 select-none sm:grid-cols-[1.3fr_1fr] sm:p-10',
                  p.tone,
                  i === index ? 'opacity-100' : 'opacity-50',
                )}
              >
                <div>
                  <h3 className="text-[28px] font-normal tracking-[-0.035em] text-inherit">{p.title}</h3>
                  <p className="mt-4 text-[15.5px] leading-relaxed opacity-80">{p.body}</p>
                </div>
                <dl className="divide-y divide-current/15">
                  {p.facts.map(([term, detail]) => (
                    <div key={term} className="py-3 first:pt-0">
                      <dt className="text-[12px] opacity-60">{term}</dt>
                      <dd className="mt-0.5 text-[15px] font-medium">{detail}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </motion.div>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex gap-2">
              {[
                { icon: ArrowLeft, label: 'Previous', step: -1 },
                { icon: ArrowRight, label: 'Next', step: 1 },
              ].map(({ icon: Icon, label, step }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(index + step)}
                  aria-label={label}
                  className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-lime hover:text-lime-ink"
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              {principles.map((p, i) => (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${p.title}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500',
                    i === index ? 'w-8 bg-lime' : 'w-3 bg-white/25',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
