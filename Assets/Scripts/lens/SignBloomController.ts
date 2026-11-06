import { FINGERS, FingerCurls } from "../core/HandPose";
import { Lesson, LessonSnapshot } from "../core/Lesson";
import { SIGNS } from "../core/SignLibrary";
import { BloomRenderer } from "./BloomRenderer";
import { FreeAlponaPainter } from "./FreeAlponaPainter";
import { HandSource } from "./HandSource";
import { SIKHandSource } from "./SIKHandSource";
import { SimulatedHandSource } from "./SimulatedHandSource";

/**
 * SignBloomController — the single entry point attached to one SceneObject.
 *
 * Each frame: read the hand -> advance the Lesson -> update UI, finger gauges,
 * bloom animation, and (after the last sign) the free Alpona Air painter.
 */
@component
export class SignBloomController extends BaseScriptComponent {
  // ---- UI text --------------------------------------------------------------
  @input signBangla: Text;
  @input signRoman: Text;
  @input hintText: Text;
  @input progressText: Text;

  // ---- finger gauges (5 objects each: thumb, index, middle, ring, pinky) -----
  @input
  @hint("Bars showing the TARGET pose. Tall bar = finger extended.")
  targetBars: SceneObject[];
  @input
  @hint("Bars showing YOUR live hand, drawn next to the target bars.")
  liveBars: SceneObject[];

  // ---- progress ring -------------------------------------------------------
  @input
  @allowUndefined
  @hint("Optional object scaled from 0 to 1 as the sign is held.")
  holdIndicator: SceneObject;

  // ---- sub-systems ---------------------------------------------------------
  @input bloom: BloomRenderer;
  @input painter: FreeAlponaPainter;

  @input
  @hint("Use the scripted virtual hand (for Lens Studio preview and the demo video).")
  demoMode: boolean = true;

  @input
  @hint("Which hand to track on device.")
  rightHand: boolean = true;

  private lesson: Lesson;
  private source: HandSource;
  private sim: SimulatedHandSource | null = null;

  onAwake() {
    this.lesson = new Lesson(SIGNS);

    if (this.demoMode) {
      this.sim = new SimulatedHandSource();
      this.source = this.sim;
    } else {
      this.source = new SIKHandSource(this.rightHand ? "right" : "left");
    }

    this.lesson.onLearned = (_sign, ring) => {
      this.bloom.addRing(ring);
    };

    this.createEvent("UpdateEvent").bind(() => this.onUpdate(getDeltaTime()));
  }

  private onUpdate(dt: number) {
    if (this.sim) {
      this.sim.setTarget(this.lesson.snapshot().phase === "practice" ? this.lesson.currentSign.curls : null);
      this.sim.setDrawing(this.lesson.snapshot().phase === "complete");
      this.sim.update(dt);
    }

    const snap = this.lesson.update(dt, this.source.getCurls());
    this.renderUi(snap);
    this.renderGauges(snap);
    this.renderBloom(snap);
    this.renderPainter(snap);
  }

  private renderUi(snap: LessonSnapshot) {
    if (snap.phase === "complete") {
      this.signBangla.text = "ফুটেছে!";
      this.signRoman.text = "It bloomed!";
      this.hintText.text = "Pinch and draw in the air to paint your own alpona.";
      this.progressText.text = `${snap.learned.length} / ${SIGNS.length} signs`;
    } else if (snap.phase === "blooming") {
      this.signBangla.text = snap.sign.bangla;
      this.signRoman.text = `${snap.sign.roman} — ${snap.sign.english}`;
      this.hintText.text = "Beautiful!";
      this.progressText.text = `${snap.learned.length} / ${SIGNS.length} signs`;
    } else {
      this.signBangla.text = snap.sign.bangla;
      this.signRoman.text = `${snap.sign.roman} — ${snap.sign.english}`;
      this.hintText.text = snap.match ? this.coach(snap) : snap.sign.hint;
      this.progressText.text = `${snap.learned.length} / ${SIGNS.length} signs`;
    }

    if (this.holdIndicator) {
      const s = snap.phase === "practice" ? snap.holdProgress : 1;
      this.holdIndicator.getTransform().setLocalScale(new vec3(s, s, s));
    }
  }

  /** Tell the learner which finger to fix. */
  private coach(snap: LessonSnapshot): string {
    if (!snap.smoothedCurls) return snap.sign.hint;
    if (snap.match?.matched) return "Hold it…";
    let worst = FINGERS[0];
    let worstDiff = -1;
    for (const f of FINGERS) {
      const d = Math.abs(snap.smoothedCurls[f] - snap.sign.curls[f]);
      if (d > worstDiff) {
        worstDiff = d;
        worst = f;
      }
    }
    const want = snap.sign.curls[worst] > 0.5 ? "curl" : "straighten";
    return `Try to ${want} your ${worst} finger.`;
  }

  private renderGauges(snap: LessonSnapshot) {
    const live: FingerCurls | null = snap.smoothedCurls;
    for (let i = 0; i < FINGERS.length; i++) {
      this.setBar(this.targetBars[i], snap.sign.curls[FINGERS[i]]);
      this.setBar(this.liveBars[i], live ? live[FINGERS[i]] : 1);
    }
  }

  /** Bar height = how extended the finger is (1 - curl). */
  private setBar(bar: SceneObject | undefined, curl: number) {
    if (!bar) return;
    const t = bar.getTransform();
    const base = t.getLocalScale();
    const h = Math.max(0.08, 1 - curl);
    t.setLocalScale(new vec3(base.x, h, base.z));
  }

  private renderBloom(snap: LessonSnapshot) {
    // Fully grown rings stay at full size; the newest ring animates.
    const learned = snap.learned.length;
    for (let r = 0; r < learned; r++) {
      const animating = snap.phase === "blooming" && r === learned - 1;
      this.bloom.setRingProgress(r, animating ? snap.bloomProgress : 1);
    }
  }

  private renderPainter(snap: LessonSnapshot) {
    if (snap.phase !== "complete") return;
    const tip = this.source.getIndexTip();
    if (tip && this.source.isPinching()) {
      const local = this.painter.paintRoot.getTransform().getInvertedWorldTransform().multiplyPoint(tip);
      this.painter.paint(local.x, local.y);
    } else {
      this.painter.endStroke();
    }
  }

  /** Hook this to a button/tap: skips the current sign (handy for demos). */
  skipSign() {
    this.lesson.skip();
  }

  /** Hook this to a button/tap: start over. */
  restart() {
    this.lesson.reset();
    this.bloom.clear();
    this.painter.clear();
  }
}
