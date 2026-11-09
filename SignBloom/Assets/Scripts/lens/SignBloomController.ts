import { FINGERS, FingerCurls } from "../core/HandPose";
import { LESSON_PRESETS } from "../core/Lesson";
import { MemoryStore, ProgressStore } from "../core/Progress";
import { Session, SessionSnapshot } from "../core/Session";
import { getPack } from "../core/Packs";
import { Sign } from "../core/SignLibrary";
import { FINGER_NAMES, Lang, StringKey, t } from "../core/Strings";
import { THEME } from "../core/Theme";
import { easeOutBack } from "../core/Symmetry";
import { AudioFeedback } from "./AudioFeedback";
import { BloomRenderer } from "./BloomRenderer";
import { Tinter, setTextColor } from "./ColorUtil";
import { FreeAlponaPainter } from "./FreeAlponaPainter";
import { HandSource } from "./HandSource";
import { LensPersistentStore } from "./LensPersistentStore";
import { SIKHandSource } from "./SIKHandSource";
import { SimulatedHandSource } from "./SimulatedHandSource";

/**
 * SignBloomController — the single entry point attached to one SceneObject.
 *
 * Each frame: read the hand -> advance the Session -> render text, finger
 * gauges, the bloom and (in the reward phase) the Alpona Air painter.
 * All decisions live in core/Session; this file only presents them.
 */
@component
export class SignBloomController extends BaseScriptComponent {
  // ---- UI text --------------------------------------------------------------
  @input signLabel: Text;
  @input signSubtitle: Text;
  @input hintText: Text;
  @input progressText: Text;

  @input
  @allowUndefined
  @hint("Optional: shows the combo streak, e.g. 'Streak ×3'.")
  streakText: Text;

  @input
  @allowUndefined
  @hint("Optional: shows XP / stars / accuracy.")
  statsText: Text;

  // ---- finger gauges (5 objects each: thumb, index, middle, ring, pinky) -----
  @input
  @hint("Bars showing the TARGET pose. Tall bar = finger extended.")
  targetBars: SceneObject[];

  @input
  @hint("Bars showing YOUR live hand, drawn next to the target bars.")
  liveBars: SceneObject[];

  @input
  @allowUndefined
  @hint("Optional object scaled from 0 to 1 as the sign is held.")
  holdIndicator: SceneObject;

  // ---- sub-systems ---------------------------------------------------------
  @input bloom: BloomRenderer;
  @input painter: FreeAlponaPainter;

  @input
  @allowUndefined
  audio: AudioFeedback;

  // ---- buttons whose visibility follows the session phase -------------------
  @input
  @allowUndefined
  @hint("Shown only after a set is finished (summary phase).")
  startAirButton: SceneObject;

  @input
  @allowUndefined
  @hint("Shown only while drawing in Alpona Air.")
  airButtons: SceneObject[];

  @input
  @allowUndefined
  @hint("Next + pack chips: dim while the hand is up, bright when it is lowered.")
  lessonButtons: SceneObject[];

  @input
  @allowUndefined
  @hint("Label that makes it obvious the hand is simulated (visible only in Demo Mode).")
  demoBanner: SceneObject;

  @input
  @allowUndefined
  @hint("Flower badge on the card; shown while the bloom plays after a sign is learned. Its children are the petals.")
  flowerBadge: SceneObject;

  @input
  @allowUndefined
  @hint("Parent of the five gauges; fades out when no hand is tracked.")
  gaugeRoot: SceneObject;

  // ---- settings ------------------------------------------------------------
  @input
  @hint("Use the scripted virtual hand (for Lens Studio preview and the demo video).")
  demoMode: boolean = true;

  @input
  @hint("Which hand to track on device.")
  rightHand: boolean = true;

  @input
  @widget(
    new ComboBoxWidget([
      new ComboBoxItem("Demo (fast, for video)", "demo"),
      new ComboBoxItem("Standard", "standard"),
      new ComboBoxItem("Accessible (slower, forgiving)", "accessible"),
    ]),
  )
  @hint("Pacing and match strictness.")
  preset: string = "demo";

  @input
  @widget(
    new ComboBoxWidget([
      new ComboBoxItem("American Sign Language (default)", "asl"),
      new ComboBoxItem("Bangla numerals (starter)", "bangla"),
    ]),
  )
  @hint("Which sign-language pack to teach.")
  signPack: string = "asl";

  @input
  @hint("Start in Bangla. Can be toggled at runtime with toggleLanguage().")
  banglaUi: boolean = false;

  private session: Session;
  private signs: readonly Sign[] = [];
  private source: HandSource | null = null;
  private sim: SimulatedHandSource | null = null;
  private progress: ProgressStore;
  private lang: Lang = "en";
  private tinter = new Tinter();
  private lastCurls: FingerCurls | null = null;
  private liveColor = "";
  private painting = false;

  onAwake() {
    // Demo runs use throw-away storage so recording a video never pollutes real progress.
    this.progress = new ProgressStore(this.demoMode ? new MemoryStore() : new LensPersistentStore());
    this.lang = this.banglaUi ? "bn" : this.progress.get().lang;

    this.buildSession(this.signPack);

    if (this.demoMode) {
      this.sim = new SimulatedHandSource();
      this.sim.reactionSeconds = this.preset === "demo" ? 0.5 : 1.2;
      // Standard / Accessible: the gauges fill one finger at a time.
      this.sim.sequential = this.preset !== "demo";
      this.source = this.sim;
    } else {
      // SIK hand data is only guaranteed ready once the Lens has started.
      this.createEvent("OnStartEvent").bind(() => {
        this.source = new SIKHandSource(this.rightHand ? "right" : "left");
      });
    }

    if (this.demoBanner) this.demoBanner.enabled = this.demoMode;

    this.applyTheme();
    this.createEvent("UpdateEvent").bind(() => this.onUpdate(getDeltaTime()));
  }


  /** (Re)create the session for a sign pack. */
  private buildSession(packId: string) {
    this.signPack = packId;
    this.signs = getPack(packId).signs;
    const lessonCfg = LESSON_PRESETS[this.preset] ?? LESSON_PRESETS.standard;
    this.session = new Session(
      this.signs,
      lessonCfg,
      {
        // Wait for the Start Alpona Air button instead of skipping the summary.
        summaryAutoSeconds: null,
        paceScale: this.preset === "accessible" ? 2 : 1,
      },
      this.progress,
    );
    this.session.onLearned = (_sign, ring, stars) => {
      this.bloom.addRing(ring);
      this.audio?.play(stars === 3 ? "star3" : "learned");
    };
    this.session.onPhaseChange = (phase) => {
      if (phase === "summary") this.audio?.play("complete");
    };

  }

  // ---------------------------------------------------------------- per frame

  private onUpdate(dt: number) {
    if (this.sim) {
      this.sim.setTarget(this.session.isPracticing ? this.session.currentSign.curls : null);
      this.sim.setDrawing(this.session.currentPhase === "paint");
      this.sim.update(dt);
    }

    this.lastCurls = this.source ? this.source.getCurls() : null;
    const snap = this.session.update(dt, this.lastCurls);

    this.renderText(snap);
    this.renderGauges(snap);
    this.renderBloom(snap);
    this.renderPainter(snap);
    this.renderVisibility(snap);
  }

  /** Buttons and gauges appear only when they are useful. */
  private renderVisibility(snap: SessionSnapshot) {
    const handUp = !!this.lastCurls && snap.phase === "learn";
    if (this.gaugeRoot) this.gaugeRoot.enabled = handUp || snap.phase === "learn";
    if (this.startAirButton) this.startAirButton.enabled = snap.phase === "summary";
    if (this.flowerBadge) {
      const blooming = snap.phase === "learn" && snap.lesson?.phase === "blooming";
      this.flowerBadge.enabled = blooming;
      if (blooming) {
        // Pop in with the same overshoot easing as the petals.
        const s = easeOutBack(Math.min(1, snap.lesson!.bloomProgress * 2));
        this.flowerBadge.getTransform().setLocalScale(new vec3(s, s, s));
      }
    }
    const painting = snap.phase === "paint";
    for (const b of this.airButtons ?? []) if (b) b.enabled = painting;
    for (const b of this.lessonButtons ?? []) if (b) b.enabled = !painting;
  }

  // ---------------------------------------------------------------- rendering

  private s(key: StringKey, vars: Record<string, string | number> = {}): string {
    return t(this.lang, key, vars);
  }

  private renderText(snap: SessionSnapshot) {
    const sc = snap.score;
    const progressLabel = this.s("progress", { n: sc.learnedCount, total: this.signs.length });
    let hold = 0;

    switch (snap.phase) {
      case "welcome":
        this.signLabel.text = "SignBloom";
        this.signSubtitle.text = this.s("tagline");
        this.hintText.text = snap.welcomeReady ? this.s("welcomeReady") : this.s("welcomeHand");
        this.progressText.text = "";
        break;

      case "learn": {
        const l = snap.lesson!;
        const sign = l.sign;
        const quiz = snap.mode === "quiz";
        this.signLabel.text = sign.label;
        this.signSubtitle.text = this.subtitle(sign);
        if (l.phase === "blooming") this.hintText.text = this.s("great");
        else if (quiz) this.hintText.text = this.s("quizHint");
        else this.hintText.text = this.coach(snap);
        this.progressText.text = progressLabel;
        hold = l.phase === "practice" ? l.holdProgress : 1;
        break;
      }

      case "summary":
        this.signLabel.text = this.s("summaryTitle");
        this.signSubtitle.text = this.s("stars", { n: sc.stars, max: sc.maxStars });
        this.hintText.text = `${this.s("accuracy", { n: Math.round(sc.accuracy * 100) })}  ·  ${this.s("bestStreak", { n: sc.bestStreak })}`;
        this.progressText.text = this.s("xp", { n: sc.xp });
        hold = 1;
        break;

      case "paint":
        this.signLabel.text = this.s("completeTitle");
        this.signSubtitle.text = this.s("paintStatus", {
          folds: this.s("paintFolds", { n: this.painter.folds }),
          brush: this.painter.brush,
        });
        this.hintText.text = this.s("completeHint");
        this.progressText.text = progressLabel;
        hold = 1;
        break;
    }

    if (this.holdIndicator) {
      this.holdIndicator.getTransform().setLocalScale(new vec3(hold, hold, hold));
    }
    if (this.streakText) this.streakText.text = sc.streak >= 2 ? this.s("streak", { n: sc.streak }) : "";
    if (this.statsText) {
      this.statsText.text = sc.learnedCount > 0 ? `${this.s("xp", { n: sc.xp })}  ·  ${this.s("stars", { n: sc.stars, max: sc.maxStars })}` : "";
    }
  }

  private subtitle(sign: Sign): string {
    return sign.reading ? `${sign.reading} — ${sign.english}` : sign.english;
  }

  /** Tell the learner which finger to fix. */
  private coach(snap: SessionSnapshot): string {
    const l = snap.lesson!;
    const sign = l.sign;
    const baseHint = this.lang === "bn" ? sign.hintBn : sign.hint;
    if (!l.smoothedCurls) return this.s("noHand");
    if (l.match?.matched) return this.s("hold");
    if (l.match && l.match.score > 0.45) {
      let worst = FINGERS[0];
      let worstDiff = -1;
      for (const f of FINGERS) {
        const d = Math.abs(l.smoothedCurls[f] - sign.curls[f]);
        if (d > worstDiff) {
          worstDiff = d;
          worst = f;
        }
      }
      const key: StringKey = sign.curls[worst] > 0.5 ? "tryCurl" : "tryStraighten";
      return this.s(key, { finger: FINGER_NAMES[this.lang][worst] });
    }
    return baseHint;
  }

  private renderGauges(snap: SessionSnapshot) {
    const l = snap.lesson;
    const target: FingerCurls = l ? l.sign.curls : { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 };
    const live: FingerCurls | null = l ? l.smoothedCurls : this.lastCurls;
    const hideTarget = snap.mode === "quiz" && snap.phase === "learn";

    for (let i = 0; i < FINGERS.length; i++) {
      const tb = this.targetBars[i];
      if (tb) tb.enabled = !hideTarget;
      this.setBar(tb, target[FINGERS[i]]);
      // Live gauge = how well THIS finger matches the sign (same formula as the matcher):
      // empty at a 0.5 curl gap or worse, full when it matches.
      const diff = live && l ? Math.abs(live[FINGERS[i]] - target[FINGERS[i]]) : 1;
      const fill = 1 - Math.min(1, diff / 0.5);
      this.setBar(this.liveBars[i], 1 - fill);
    }

    const matched = !!l?.match?.matched;
    const color = matched ? THEME.success : THEME.teal;
    if (color !== this.liveColor) {
      this.liveColor = color;
      for (const b of this.liveBars) this.tinter.tint(b, color);
    }
  }

  /** Bar height = how extended the finger is (1 - curl). */
  private setBar(bar: SceneObject | undefined, curl: number) {
    if (!bar) return;
    const tr = bar.getTransform();
    const base = tr.getLocalScale();
    const h = Math.max(0.08, 1 - curl);
    tr.setLocalScale(new vec3(base.x, h, base.z));
    // Anchor the bar's bottom so it fills upward like a gauge.
    const pos = tr.getLocalPosition();
    tr.setLocalPosition(new vec3(pos.x, -0.5 + h / 2, pos.z));
  }

  private renderBloom(snap: SessionSnapshot) {
    const learned = snap.score.learnedCount;
    const animating = snap.phase === "learn" && snap.lesson?.phase === "blooming" ? learned - 1 : -1;
    for (let r = 0; r < learned; r++) {
      this.bloom.setRingProgress(r, r === animating ? snap.lesson!.bloomProgress : 1);
    }
  }

  private renderPainter(snap: SessionSnapshot) {
    if (snap.phase !== "paint") {
      if (this.painting) {
        this.painter.endStroke();
        this.painting = false;
      }
      return;
    }
    const tip = this.source ? this.source.getIndexTip() : null;
    if (tip && this.source && this.source.isPinching()) {
      const local = this.painter.paintRoot.getTransform().getInvertedWorldTransform().multiplyPoint(tip);
      this.painter.paint(local.x, local.y);
      this.painting = true;
    } else if (this.painting) {
      this.painter.endStroke();
      this.painting = false;
    }
  }

  private applyTheme() {
    setTextColor(this.signLabel, THEME.gold);
    setTextColor(this.signSubtitle, THEME.ivory);
    setTextColor(this.hintText, THEME.mutedText);
    setTextColor(this.progressText, THEME.ivory);
    setTextColor(this.streakText, THEME.warning);
    setTextColor(this.statsText, THEME.mutedText);
    for (const b of this.targetBars) this.tinter.tint(b, THEME.gold);
    for (const b of this.liveBars) this.tinter.tint(b, THEME.teal);
    this.liveColor = THEME.teal;
    if (this.holdIndicator) this.tinter.tint(this.holdIndicator, THEME.success);
    if (this.flowerBadge) {
      const n = this.flowerBadge.getChildrenCount();
      for (let i = 0; i < n; i++) {
        // Last child is the centre (gold); the rest cycle through the petal palette.
        const hex = i === n - 1 ? THEME.gold : THEME.petals[i % THEME.petals.length];
        this.tinter.tint(this.flowerBadge.getChild(i), hex);
      }
    }
  }

  private resetVisuals() {
    this.bloom.clear();
    this.painter.clear();
    this.painting = false;
  }

  // ------------------------------------------------- hooks for buttons / taps
  // Wire these to SIK PinchButton "onTriggerUp" events (see docs/SETUP.md).

  /** Tap to start without waiting for the hand-detection welcome. */
  begin() {
    this.session.begin();
    this.audio?.play("tap");
  }

  /** Skip the current sign (demo and accessibility helper). */
  skipSign() {
    this.session.skip();
  }

  /** Back to the welcome screen with a clean slate. */
  restart() {
    this.resetVisuals();
    this.session.restart();
    this.audio?.play("tap");
  }

  /** Start a guided lesson again. */
  startLearn() {
    this.resetVisuals();
    this.session.startLearn();
    this.audio?.play("tap");
  }

  /** Start a shuffled, no-hints quiz. */
  startQuiz() {
    this.resetVisuals();
    this.session.startQuiz();
    this.audio?.play("tap");
  }

  /** From the summary screen to free painting. */
  continueToPaint() {
    this.session.continue();
    this.audio?.play("tap");
  }

  /** Switch English <-> Bangla (saved). */
  toggleLanguage() {
    this.lang = this.lang === "en" ? "bn" : "en";
    this.progress.setLang(this.lang);
    this.audio?.play("tap");
  }

  /** Switch the sign pack (ASL / Bangla) and restart the lesson on it. */
  setPack(id: string) {
    this.resetVisuals();
    this.buildSession(id);
    this.session.startLearn();
    this.audio?.play("tap");
  }
  setPackAsl() {
    this.setPack("asl");
  }
  setPackBangla() {
    this.setPack("bangla");
  }

  /** End Alpona Air and return to the lessons. */
  endPaint() {
    this.resetVisuals();
    this.session.startLearn();
    this.audio?.play("tap");
  }

  paintUndo() {
    this.painter.undo();
    this.audio?.play("tap");
  }

  paintClear() {
    this.painter.clear();
    this.audio?.play("tap");
  }

  paintCycleSymmetry() {
    this.painter.cycleSymmetry();
    this.audio?.play("tap");
  }

  paintCycleBrush() {
    this.painter.cycleBrush();
    this.audio?.play("tap");
  }
}
