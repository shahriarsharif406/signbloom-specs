import { Lang } from "./Strings";

/** Minimal key/value storage. Lens Studio's persistent storage and tests both implement it. */
export interface KeyValueStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

export class MemoryStore implements KeyValueStore {
  private data = new Map<string, string>();
  get(key: string): string | null {
    return this.data.has(key) ? (this.data.get(key) as string) : null;
  }
  set(key: string, value: string): void {
    this.data.set(key, value);
  }
}

export type Progress = {
  version: 1;
  lang: Lang;
  /** Ids of every sign the learner has ever mastered. */
  mastered: string[];
  /** Best stars ever earned per sign id. */
  bestStars: Record<string, number>;
  totalXp: number;
  bestStreak: number;
  sessions: number;
};

export const PROGRESS_KEY = "signbloom.progress.v1";

export function defaultProgress(): Progress {
  return { version: 1, lang: "en", mastered: [], bestStars: {}, totalXp: 0, bestStreak: 0, sessions: 0 };
}

const isNum = (v: unknown): v is number => typeof v === "number" && isFinite(v) && v >= 0;

/** Parse stored JSON defensively: corrupt or foreign data falls back to defaults. */
export function parseProgress(raw: string | null): Progress {
  const base = defaultProgress();
  if (!raw) return base;
  try {
    const o = JSON.parse(raw);
    if (!o || o.version !== 1) return base;
    const bestStars: Record<string, number> = {};
    if (o.bestStars && typeof o.bestStars === "object") {
      for (const k of Object.keys(o.bestStars)) {
        const v = o.bestStars[k];
        if (v === 1 || v === 2 || v === 3) bestStars[k] = v;
      }
    }
    return {
      version: 1,
      lang: o.lang === "bn" ? "bn" : "en",
      mastered: Array.isArray(o.mastered) ? o.mastered.filter((x: unknown) => typeof x === "string") : [],
      bestStars,
      totalXp: isNum(o.totalXp) ? o.totalXp : 0,
      bestStreak: isNum(o.bestStreak) ? o.bestStreak : 0,
      sessions: isNum(o.sessions) ? o.sessions : 0,
    };
  } catch {
    return base;
  }
}

export type SessionResult = {
  perSign: Record<string, number>;
  xp: number;
  bestStreak: number;
};

export class ProgressStore {
  private progress: Progress;

  constructor(
    private readonly store: KeyValueStore,
    private readonly key: string = PROGRESS_KEY,
  ) {
    this.progress = parseProgress(store.get(key));
  }

  get(): Progress {
    return { ...this.progress, mastered: [...this.progress.mastered], bestStars: { ...this.progress.bestStars } };
  }

  setLang(lang: Lang): void {
    this.progress.lang = lang;
    this.save();
  }

  /** Merge a finished session into lifetime progress (best-of, never regress). */
  recordSession(result: SessionResult): void {
    const p = this.progress;
    for (const id of Object.keys(result.perSign)) {
      if (!p.mastered.includes(id)) p.mastered.push(id);
      p.bestStars[id] = Math.max(p.bestStars[id] ?? 0, result.perSign[id]);
    }
    p.totalXp += result.xp;
    p.bestStreak = Math.max(p.bestStreak, result.bestStreak);
    p.sessions += 1;
    this.save();
  }

  reset(): void {
    this.progress = defaultProgress();
    this.save();
  }

  private save(): void {
    this.store.set(this.key, JSON.stringify(this.progress));
  }
}
