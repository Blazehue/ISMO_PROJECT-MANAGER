/**
 * Tiny event bus for the full-screen "closing" sequence, so non-UI code (like
 * logout) can wait for the curtain to cover the screen before changing routes.
 */
type Listener = (done: () => void) => void;
const listeners = new Set<Listener>();

export const cinema = {
  /** Resolves once the outro curtain fully covers the screen (immediately if nothing is listening). */
  playOutro(): Promise<void> {
    if (listeners.size === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve();
    return new Promise((resolve) => listeners.forEach((listener) => listener(resolve)));
  },
  onOutro(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
