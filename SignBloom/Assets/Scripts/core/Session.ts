import { FingerCurls } from "./HandPose";
import { DEFAULT_LESSON, LearnStats, Lesson, LessonConfig, LessonSnapshot } from "./Lesson";
import { ProgressStore } from "./Progress";
import { shuffled } from "./Rng";
import { ScoreKeeper, ScoreSnapshot, Stars } from "./Scoring";
import { Sign } from "./SignLibrary";

export type SessionPhase = "welcome" | "learn" | "summary" | "paint";
export type SessionMode = "learn" | "quiz";

export type SessionOptions = {
  /** Minimum time the welcome screen stays up. */
  welcomeMinSeconds: number;
  /** How long a hand must be continuously visible to leave the welcome screen. */
  handSeenSeconds: number;
  /** Auto-continue from the summary after this many seconds; null = wait for continue(). */
  summaryAutoSeconds: number | null;
  /** Seed for quiz ordering. */
  quizSeed: number;
  /** Scales the pace thresholds used for stars (use >1 for accessible presets). */
  paceScale: number;
};

export const DEFAULT_SESSION: SessionOptions = {
  welcomeMinSeconds: 1.5,
  handSeenSeconds: 0.8,
  summaryAutoSeconds: null,
  quizSeed: 1,
  paceScale: 1,
};

export type SessionSnapshot = {
  phase: SessionPhase;
  mode: SessionMode;
  /** Null during welcome / summary / paint. */
  lesson: LessonSnapshot | null;
  score: ScoreSnapshot;
  /** Seconds a hand has been continuously visible (welcome screen). */
  handSeconds: number;
  /** True once the welcome screen has seen a hand long enough and is about to start. */
  welcomeReady: boolean;
};

/**
 * Session — the whole experience as one state machine.
 *
 *   welcome ──hand seen──► learn ──all signs──► summary ──continue──► paint
 *      ▲                      │ (or quiz mode: same loop, shuffled, no hints)
 *      └────── restart ───────┘
 *
 * Pure and engine-free; the Lens controller just feeds it hand data and renders
 * the snapshot.
 */
export class Session {
  private phase: SessionPhase = "welcome";
  private mode: SessionMode = "learn";
  private lesson: Lesson;
  private score: ScoreKeeper;
  private welcomeT = 0;
  private handT = 0;
  private summaryT = 0;
  private completePending = false;
  private opts: SessionOptions;

  onLearned: ((sign: Sign, ring: number, stars: Stars, stats: LearnStats) => void) | null = null;
  onPhaseChange: ((phase: SessionPhase) => void) | null = null;

  constructor(
    private readonly signs: readonly Sign[],
    private readonly lessonConfig: LessonConfig = DEFAULT_LESSON,
    options: Partial<SessionOptions> = {},
    private readonly progress: ProgressStore | null = null,
  ) {
    this.opts = { ...DEFAULT_SESSION, ...options };
    this.score = new ScoreKeeper(signs.length, this.opts.paceScale);
    this.lesson = this.makeLesson(signs);
  }

  private makeLesson(order: readonly Sign[]): Lesson {
    const l = new Lesson(order, this.lessonConfig);
    l.onLearned = (sign, ring, stats) => {
      const stars = this.score.record(sign.id, stats);
      this.onLearned?.(sign, ring, stars, stats);
    };
    l.onComplete = () => {
      this.completePending = true;
    };
    return l;
  }

  update(dt: number, curls: FingerCurls | null): SessionSnapshot {
    const step = Math.max(0, Math.min(dt, 0.25));

    if (this.phase === "welcome") {
      this.welcomeT += step;
      this.handT = curls ? this.handT + step : 0;
      if (this.welcomeT >= this.opts.welcomeMinSeconds && this.handT >= this.opts.handSeenSeconds) {
        this.setPhase("learn");
      }
    } else if (this.phase === "learn") {
      this.lesson.update(step, curls);
      if (this.completePending) {
        this.completePending = false;
        this.summaryT = 0;
        this.saveProgress();
        this.setPhase("summary");
      }
    } else if (this.phase === "summary") {
      this.summaryT += step;
      if (this.opts.summaryAutoSeconds !== null && this.summaryT >= this.opts.summaryAutoSeconds) {
        this.setPhase("paint");
      }
    }

    return this.snapshot();
  }

  /** Leave the welcome screen immediately (tap-to-start). */
  begin(): void {
    if (this.phase === "welcome") this.setPhase("learn");
  }

  /** Move from the summary to free painting. */
  continue(): void {
    if (this.phase === "summary") this.setPhase("paint");
  }

  /** Start a fresh quiz: shuffled order, hints hidden by the UI. */
  startQuiz(): void {
    this.mode = "quiz";
    this.resetRun(shuffled(this.signs, this.opts.quizSeed++));
    this.setPhase("learn");
  }

  /** Start a fresh guided lesson. */
  startLearn(): void {
    this.mode = "learn";
    this.resetRun(this.signs);
    this.setPhase("learn");
  }

  restart(): void {
    this.mode = "learn";
    this.resetRun(this.signs);
    this.welcomeT = 0;
    this.handT = 0;
    this.setPhase("welcome");
  }

  skip(): void {
    if (this.phase === "learn") this.lesson.skip();
  }

  get currentPhase(): SessionPhase {
    return this.phase;
  }
  get currentMode(): SessionMode {
    return this.mode;
  }
  /** Sign the learner is currently practising (for driving a simulated hand). */
  get currentSign(): Sign {
    return this.lesson.currentSign;
  }
  /** True while the lesson itself is accepting poses (not blooming/complete). */
  get isPracticing(): boolean {
    return this.phase === "learn" && this.lesson.snapshot().phase === "practice";
  }

  snapshot(): SessionSnapshot {
    return {
      phase: this.phase,
      mode: this.mode,
      lesson: this.phase === "learn" ? this.lesson.snapshot() : null,
      score: this.score.snapshot(),
      handSeconds: this.handT,
      welcomeReady: this.phase === "welcome" && this.handT >= this.opts.handSeenSeconds,
    };
  }

  private resetRun(order: readonly Sign[]): void {
    this.score.reset();
    this.completePending = false;
    this.summaryT = 0;
    this.lesson = this.makeLesson(order);
  }

  private setPhase(next: SessionPhase): void {
    if (this.phase === next) return;
    this.phase = next;
    this.onPhaseChange?.(next);
  }

  private saveProgress(): void {
    if (!this.progress) return;
    const s = this.score.snapshot();
    this.progress.recordSession({ perSign: s.perSign, xp: s.xp, bestStreak: s.bestStreak });
  }
}
