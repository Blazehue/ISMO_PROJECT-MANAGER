import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Link } from 'react-router';
import { ColorBlobs } from '@/components/fx/ColorBlobs';
import { Highlight } from '@/components/fx/Highlight';
import { LimeButton } from '@/components/fx/LimeButton';
import { LogoMark } from '@/components/layout/Logo';
import { Reveal } from '@/components/motion/Reveal';
import { useAuth } from '@/lib/auth';
import { BrowserMockup } from './MockupParts';
import { sections } from './LandingNav';

export function CtaBand() {
  const { status } = useAuth();
  const signedIn = status === 'authenticated';
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const shotY = useTransform(scrollYProgress, [0, 1], [140, 0]);

  return (
    <section className="px-3 pb-6 sm:px-6">
      <div
        ref={ref}
        className="relative overflow-hidden rounded-[36px] bg-[#242426] px-5 pt-24 text-center sm:px-8 sm:pt-28"
      >
        <ColorBlobs opacity={0.22} />
        <Reveal className="relative mx-auto max-w-2xl">
          <h2 className="text-[38px] leading-[1.05] font-normal tracking-[-0.045em] text-white sm:text-[56px]">
            Ready to bring your projects into <Highlight>focus?</Highlight>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15.5px] text-white/60">
            Create an account in seconds, or explore everything with the demo workspace.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <LimeButton to={signedIn ? '/dashboard' : '/register'} variant="lime" size="lg">
              {signedIn ? 'Open dashboard' : 'Get started free'}
            </LimeButton>
            {!signedIn && (
              <Link
                to="/login"
                className="flex h-[52px] items-center rounded-[14px] bg-white/10 px-6 text-[15px] text-white transition-colors hover:bg-white/20"
              >
                Try the demo
              </Link>
            )}
          </div>
        </Reveal>
        <motion.div
          style={{ y: shotY }}
          className="relative mx-auto mt-16 max-w-4xl translate-y-10 opacity-90 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
        >
          <BrowserMockup />
        </motion.div>
      </div>
    </section>
  );
}

const footerColumns = [
  { title: 'Product', links: sections.map(({ id, label }) => ({ label, href: `#${id}` })) },
  {
    title: 'App',
    links: [
      { label: 'Log in', to: '/login' },
      { label: 'Create account', to: '/register' },
      { label: 'Dashboard', to: '/dashboard' },
    ],
  },
  {
    title: 'Built with',
    links: [
      { label: 'React + Vite', href: '#features' },
      { label: 'Express + PostgreSQL', href: '#features' },
      { label: 'Expo (Android)', href: '#android' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="overflow-hidden bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-16 pb-6 sm:px-8 md:grid-cols-[1fr_auto]">
        <div>
          <LogoMark className="size-10" />
          <p className="mt-4 max-w-xs text-[13.5px] text-muted-foreground">
            Projects and tasks on the web and Android. A full-stack assessment build with test data only.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <div className="text-[14px] font-medium">{column.title}</div>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {'to' in link && link.to ? (
                      <Link
                        to={link.to}
                        className="text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={'href' in link ? link.href : '#'}
                        className="text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      {/* Giant wordmark that rises into view */}
      <motion.div
        aria-hidden
        initial={{ y: '40%', opacity: 0 }}
        whileInView={{ y: '18%', opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-6xl px-5 text-[26vw] leading-[0.8] font-medium tracking-[-0.08em] text-foreground select-none sm:px-8 lg:text-[300px]"
      >
        ISMO<span className="text-lime">.</span>
      </motion.div>
    </footer>
  );
}
