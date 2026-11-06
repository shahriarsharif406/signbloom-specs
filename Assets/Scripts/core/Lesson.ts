import { FingerCurls, MatchResult, matchPose, smoothCurls } from "./HandPose";
import { Sign } from "./SignLibrary";

export type LessonPhase = "practice" | "blooming" | "complete";

export type LessonConfig = {
  /** Seconds the sign must be held to count as learned. */
  holdSeconds: number;
  /** Seconds the petal-bloom animation plays after a sign is learned. */
  bloomSeconds: number;
  /** Curl smoothing factor per update, 0..1 (higher = more responsive). */
  smoothing: number;
};

export const DEFAULT_LESSON: LessonConfig = {
  holdSeconds: 1.0,
  bloomSeconds: 1.4,
  smoothing: 0.35,
};

export type LessonSnapshot = {
  phase: LessonPhase;
  /** Sign currently being practised (the last one once complete). */
  sign: Sign;
  signIndex: number;
  /** 0..1, how long the sign has been held correctly. */
  holdProgress: number;
  /** 0..1 bloom animation progress for the ring that was just earned. */
  bloomProgress: number;
  match: MatchResult | null;
  smoothedCurls: FingerCurls | null;
  /** Ids of signs learned so far, in order. */
  learned: string[];
};

/**
 * Lesson — the learning loop as a small state machine.
 *
 *   practice --(hold sign)--> blooming --(animation ends)--> practice (next sign)
 *                                                      └──> complete (after last sign)
 *
 * Pure and deterministic: feed it `dt` and the latest finger curls (or null when
 * no hand is tracked) and read back a snapshot. No engine types involved.
 */
export class Lesson {
  private phase: LessonPhase = "practice";
  private signIndex = 0;
  private hold = 0;
  private bloom = 0;
  private curls: FingerCurls | null = null;
  private match: MatchResult | null = null;
  private learned: string[] = [];

  onLearned: ((sign: Sign, ringIndex: number) => void) | null = null;
  onComplete: (() => void) | null = null;

  constructor(
    private readonly signs: readonly Sign[],
    private readonly config: LessonConfig = DEFAULT_LESSON,
  ) {
    if (signs.length === 0) throw new Error("Lesson needs at least one sign");
  }

  update(dt: number, liveCurls: FingerCurls | null): LessonSnapshot {
    const step = Math.max(0, Math.min(dt, 0.25)); // guard against frame hitches

    if (this.phase === "practice") {
      if (liveCurls) {
        this.curls = smoothCurls(this.curls, liveCurls, this.config.smoothing);
        this.match = matchPose(this.curls, this.currentSign.curls);
      } else {
        this.curls = null;
        this.match = null;
      }

      if (this.match?.matched) this.hold += step / this.config.holdSeconds;
      else this.hold -= (step / this.config.holdSeconds) * 1.5; // forgive brief slips
      this.hold = Math.max(0, Math.min(1, this.hold));

      if (this.hold >= 1) {
        const earned = this.currentSign;
        this.learned.push(earned.id);
        this.phase = "blooming";
        this.bloom = 0;
        this.onLearned?.(earned, this.learned.length - 1);
      }
    } else if (this.phase === "blooming") {
      this.bloom += step / this.config.bloomSeconds;
      if (this.bloom >= 1) {
        this.bloom = 1;
        if (this.signIndex >= this.signs.length - 1) {
          this.phase = "complete";
          this.onComplete?.();
        } else {
          this.signIndex += 1;
          this.phase = "practice";
          this.hold = 0;
          this.bloom = 0;
          this.curls = null;
          this.match = null;
        }
      }
    }

    return this.snapshot();
  }

  /** Skip the current sign without learning it (useful for demos and accessibility). */
  skip(): void {
    if (this.phase !== "practice") return;
    if (this.signIndex < this.signs.length - 1) {
      this.signIndex += 1;
      this.hold = 0;
      this.curls = null;
      this.match = null;
    }
  }

  reset(): void {
    this.phase = "practice";
    this.signIndex = 0;
    this.hold = 0;
    this.bloom = 0;
    this.curls = null;
    this.match = null;
    this.learned = [];
  }

  get currentSign(): Sign {
    return this.signs[this.signIndex];
  }

  snapshot(): LessonSnapshot {
    return {
      phase: this.phase,
      sign: this.currentSign,
      signIndex: this.signIndex,
      holdProgress: this.hold,
      bloomProgress: this.bloom,
      match: this.match,
      smoothedCurls: this.curls,
      learned: [...this.learned],
    };
  }
}
