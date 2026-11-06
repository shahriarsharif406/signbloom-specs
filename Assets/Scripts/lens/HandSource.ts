import { FingerCurls } from "../core/HandPose";

/**
 * Anything that can report the learner's current finger curls.
 * Two implementations: SIKHandSource (real tracked hand) and
 * SimulatedHandSource (scripted hand for the Lens Studio preview / demo video).
 */
export interface HandSource {
  /** Latest finger curls, or null when no hand is tracked. */
  getCurls(): FingerCurls | null;
  /** Position of the index fingertip in world space, or null when not tracked. */
  getIndexTip(): vec3 | null;
  /** True while thumb and index finger are pinched together. */
  isPinching(): boolean;
}
