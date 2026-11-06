import { SIK } from "SpectaclesInteractionKit.lspkg/SIK";
import { FINGERS, FingerJoints, FingerName, HandJoints, Vec3, computeCurls } from "../core/HandPose";
import { FingerCurls } from "../core/HandPose";
import { HandSource } from "./HandSource";

/**
 * Reads the real tracked hand through Spectacles Interaction Kit (SIK).
 *
 * VERIFY: joint property names below follow the SIK TrackedHand API
 * (thumbKnuckle / thumbInnerJoint / thumbOuterJoint / thumbTip, etc.).
 * If your installed SIK version names them differently, only the `JOINTS`
 * table needs to change — all the matching logic lives in core/ and is tested.
 */
const JOINTS: Record<FingerName, [string, string, string, string]> = {
  thumb: ["thumbKnuckle", "thumbInnerJoint", "thumbOuterJoint", "thumbTip"],
  index: ["indexKnuckle", "indexMidJoint", "indexUpperJoint", "indexTip"],
  middle: ["middleKnuckle", "middleMidJoint", "middleUpperJoint", "middleTip"],
  ring: ["ringKnuckle", "ringMidJoint", "ringUpperJoint", "ringTip"],
  pinky: ["pinkyKnuckle", "pinkyMidJoint", "pinkyUpperJoint", "pinkyTip"],
};

const PINCH_DISTANCE_CM = 2.5;

export class SIKHandSource implements HandSource {
  private readonly hand: any;

  constructor(handedness: "left" | "right" = "right") {
    this.hand = SIK.HandInputData.getHand(handedness);
  }

  private joint(name: string): Vec3 | null {
    const j = this.hand[name];
    if (!j || !j.position) return null;
    const p = j.position as vec3;
    return { x: p.x, y: p.y, z: p.z };
  }

  getCurls(): FingerCurls | null {
    if (!this.hand.isTracked()) return null;
    const fingers = {} as Record<FingerName, FingerJoints>;
    for (const f of FINGERS) {
      const pts = JOINTS[f].map((n) => this.joint(n));
      if (pts.some((p) => p === null)) return null;
      fingers[f] = pts as FingerJoints;
    }
    const wrist = this.joint("wrist");
    if (!wrist) return null;
    const joints: HandJoints = { wrist, fingers };
    return computeCurls(joints);
  }

  getIndexTip(): vec3 | null {
    if (!this.hand.isTracked()) return null;
    return this.hand.indexTip?.position ?? null;
  }

  isPinching(): boolean {
    if (!this.hand.isTracked()) return false;
    const a: vec3 | undefined = this.hand.thumbTip?.position;
    const b: vec3 | undefined = this.hand.indexTip?.position;
    if (!a || !b) return false;
    return a.distance(b) < PINCH_DISTANCE_CM;
  }
}
