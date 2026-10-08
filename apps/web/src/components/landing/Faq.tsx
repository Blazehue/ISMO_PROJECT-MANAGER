import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { ease } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';
import { Highlight } from '@/components/fx/Highlight';
import { SectionHeading } from './SectionHeading';

const faqs = [
  {
    q: 'Can I use the same account on the web and on Android?',
    a: 'Yes. Register on either app and log in on the other. Both apps use the same API and database, so your projects and tasks are identical everywhere.',
  },
  {
    q: 'Is my data private?',
    a: 'Every project and task is looked up together with its owner, so other accounts can never read or change it, even by guessing an id. Passwords are stored only as bcrypt hashes.',
  },
  {
    q: 'Does the Android app work offline?',
    a: 'You can read your last synced projects and tasks without a connection, and a banner tells you you’re offline. Changes need a connection, then pull to refresh.',
  },
  {
    q: 'What happens when my session expires?',
    a: 'Sessions renew automatically in the background. If a session can’t be renewed, you’re taken back to the login screen with a clear message.',
  },
  {
    q: 'Is this a production service?',
    a: 'It’s a full-stack assessment build. Please use test data only; the demo account is there for exploring.',
  },
];

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="scroll-mt-24 bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeading
          center
          icon={HelpCircle}
          eyebrow="FAQ"
          title={
            <>
              We have the <Highlight>answers</Highlight>
            </>
          }
          description="How accounts, privacy, offline use and sessions work."
        />
        <ul className="mt-12 space-y-2">
          {faqs.map(({ q, a }, i) => {
            const isOpen = open === i;
            return (
              <li
                key={q}
                className={cn(
                  'overflow-hidden rounded-2xl transition-colors',
                  isOpen ? 'bg-[#242426] text-white shadow-xl' : 'bg-canvas hover:bg-muted',
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left text-[15px] font-medium"
                >
                  <span className="flex-1">{q}</span>
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.3, ease }}>
                    <Plus className="size-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease }}
                    >
                      <p className="px-5 pb-5 text-[14px] leading-relaxed opacity-75">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
