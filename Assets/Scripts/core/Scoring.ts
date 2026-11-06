import { LearnStats } from "./Lesson";

export type Stars = 1 | 2 | 3;

/**
 * Stars reward both accuracy and fluency.
 *   3 stars: accurate (>= 0.88 mean score) and quick (<= 6 s)
 *   2 stars: decent  (>= 0.78) and not slow (<= 12 s)
 *   1 star : you got it — every learned sign earns at least one
 * Pacing thresholds are scaled by `paceScale` so accessible presets are not punished.
 */
export function starsFor(stats: LearnStats, paceScale = 1): Stars {
  const quick = stats.seconds <= 6 * paceScale;
  const ok = stats.seconds <= 12 * paceScale;
  if (stats.avgScore >= 0.88 && quick) return 3;
  if (stats.avgScore >= 0.78 && ok) return 2;
  return 1;
}

export type ScoreSnapshot = {
  xp: number;
  /** Consecutive signs earned with 2+ stars. */
  streak: number;
  bestStreak: number;
  stars: number;
  maxStars: number;
  learnedCount: number;
  /** Mean accuracy over learned signs, 0..1. */
  accuracy: number;
  /** Total practice seconds across learned signs. */
  seconds: number;
  perSign: Record<string, Stars>;
};

export class ScoreKeeper {
  private xp = 0;
  private streak = 0;
  private bestStreak = 0;
  private perSign: Record<string, Stars> = {};
  private accuracySum = 0;
  private seconds = 0;
  private count = 0;

  constructor(
    private readonly totalSigns: number,
    private readonly paceScale = 1,
  ) {}

  /** Record a learned sign; returns the stars earned. */
  record(signId: string, stats: LearnStats): Stars {
    const stars = starsFor(stats, this.paceScale);
    this.streak = stars >= 2 ? this.streak + 1 : 0;
    this.bestStreak = Math.max(this.bestStreak, this.streak);
    this.xp += 100 * stars + 10 * Math.max(0, this.streak - 1);
    this.perSign[signId] = stars;
    this.accuracySum += stats.avgScore;
    this.seconds += stats.seconds;
    this.count += 1;
    return stars;
  }

  snapshot(): ScoreSnapshot {
    const stars = Object.values(this.perSign).reduce<number>((a, b) => a + b, 0);
    return {
      xp: this.xp,
      streak: this.streak,
      bestStreak: this.bestStreak,
      stars,
      maxStars: this.totalSigns * 3,
      learnedCount: this.count,
      accuracy: this.count > 0 ? this.accuracySum / this.count : 0,
      seconds: this.seconds,
      perSign: { ...this.perSign },
    };
  }

  reset(): void {
    this.xp = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.perSign = {};
    this.accuracySum = 0;
    this.seconds = 0;
    this.count = 0;
  }
}
