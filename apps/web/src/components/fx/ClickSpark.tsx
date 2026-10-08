import { useEffect } from 'react';

const SPARKS = 8;

/**
 * Tiny burst of sparks wherever the user clicks (React Bits-style). Purely
 * decorative DOM nodes, removed after the animation; off with reduced motion.
 */
export function ClickSpark({ color = 'var(--brand-500)' }: { color?: string }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onClick = (event: MouseEvent) => {
      const host = document.createElement('div');
      host.setAttribute('aria-hidden', 'true');
      host.style.cssText = `position:fixed;left:${event.clientX}px;top:${event.clientY}px;pointer-events:none;z-index:9999`;
      for (let i = 0; i < SPARKS; i++) {
        const spark = document.createElement('span');
        const angle = (360 / SPARKS) * i;
        spark.style.cssText = `position:absolute;left:-1px;top:-1px;width:2px;height:9px;border-radius:2px;background:${color};transform-origin:1px 1px;transform:rotate(${angle}deg) translateY(-6px) scaleY(1);opacity:1;transition:transform .45s cubic-bezier(.22,1,.36,1),opacity .45s ease`;
        host.appendChild(spark);
        requestAnimationFrame(() => {
          spark.style.transform = `rotate(${angle}deg) translateY(-20px) scaleY(0.2)`;
          spark.style.opacity = '0';
        });
      }
      document.body.appendChild(host);
      window.setTimeout(() => host.remove(), 500);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [color]);
  return null;
}
