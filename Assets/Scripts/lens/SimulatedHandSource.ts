import { FINGERS, FingerCurls, clamp01 } from "../core/HandPose";
import { HandSource } from "./HandSource";

/**
 * A scripted "virtual hand" so the whole experience can be previewed and
 * screen-recorded in Lens Studio without a physical hand or headset.
 *
 * It eases towards whatever target curls the controller gives it, adds a little
 * natural wobble, and pauses between signs like a person would.
 */
export class SimulatedHandSource implements HandSource {
  private current: FingerCurls = { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 };
  private target: FingerCurls | null = null;
  private time = 0;
  private delay = 0;
  private pinch = false;
  private tip = new vec3(0, 0, 0);

  /** Seconds to wait before "performing" each new target, to look human. */
  reactionSeconds = 1.2;
  /** Curl units per second the virtual fingers move. */
  speed = 2.2;

  setTarget(target: FingerCurls | null): void {
    const changed =
      (target === null) !== (this.target === null) ||
      (target !== null && this.target !== null && FINGERS.some((f) => target[f] !== this.target![f]));
    this.target = target;
    if (changed) this.delay = this.reactionSeconds;
  }

  /** Drive the free-drawing demo: a slow spiral drawn while "pinching". */
  setDrawing(on: boolean): void {
    this.pinch = on;
  }

  update(dt: number): void {
    this.time += dt;
    if (this.delay > 0) {
      this.delay -= dt;
    } else if (this.target) {
      for (const f of FINGERS) {
        const diff = this.target[f] - this.current[f];
        const stepSize = this.speed * dt;
        this.current[f] += Math.abs(diff) <= stepSize ? diff : Math.sign(diff) * stepSize;
      }
    }
    // Spiral path for the Alpona Air demo.
    const r = 4 + 3 * Math.sin(this.time * 0.6);
    const a = this.time * 1.3;
    this.tip = new vec3(Math.cos(a) * r, Math.sin(a) * r, 0);
  }

  getCurls(): FingerCurls | null {
    const out = {} as FingerCurls;
    for (const f of FINGERS) {
      const wobble = Math.sin(this.time * 7 + f.length) * 0.015;
      out[f] = clamp01(this.current[f] + wobble);
    }
    return out;
  }

  getIndexTip(): vec3 | null {
    return this.tip;
  }

  isPinching(): boolean {
    return this.pinch;
  }
}
