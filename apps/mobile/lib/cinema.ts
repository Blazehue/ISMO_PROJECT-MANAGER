/** Event bus for the full-screen closing curtain (logout waits for it to cover the screen). */
type Listener = (covered: () => void) => void;
const listeners = new Set<Listener>();

export const cinema = {
  playOutro(): Promise<void> {
    if (listeners.size === 0) return Promise.resolve();
    return new Promise((resolve) => listeners.forEach((listener) => listener(resolve)));
  },
  onOutro(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
