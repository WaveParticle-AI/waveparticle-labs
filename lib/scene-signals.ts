type Listener = (value: number) => void;

let progress = 0;
const listeners = new Set<Listener>();

export const quizProgress = {
  get(): number {
    return progress;
  },
  set(value: number) {
    progress = Math.min(1, Math.max(0, value));
    for (const listener of listeners) listener(progress);
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
