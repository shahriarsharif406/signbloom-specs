/**
 * HandPose — pure, dependency-free hand math for SignBloom.
 *
 * Works on raw joint positions (any consistent unit) and reduces each finger
 * to a single "curl" value: 0 = fully extended, 1 = fully curled.
 * Matching signs by finger curl (instead of raw joint distances) makes the
 * lesson tolerant to hand size, distance from the camera and hand rotation.
 */

export type Vec3 = { x: number; y: number; z: number };

export type FingerName = "thumb" | "index" | "middle" | "ring" | "pinky";

export const FINGERS: readonly FingerName[] = ["thumb", "index", "middle", "ring", "pinky"];

/** Four joints per finger, base to tip: knuckle, mid, upper, tip. */
export type FingerJoints = [Vec3, Vec3, Vec3, Vec3];

export type HandJoints = {
  wrist: Vec3;
  fingers: Record<FingerName, FingerJoints>;
};

export type FingerCurls = Record<FingerName, number>;

/** Sum of the two bend angles (radians) that we treat as a fully curled finger. */
const MAX_TOTAL_BEND = 2.8;

const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const dot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;
const len = (a: Vec3): number => Math.sqrt(dot(a, a));

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Angle in radians between two vectors (0 when either is degenerate). */
export function angleBetween(a: Vec3, b: Vec3): number {
  const la = len(a);
  const lb = len(b);
  if (la < 1e-9 || lb < 1e-9) return 0;
  const c = Math.max(-1, Math.min(1, dot(a, b) / (la * lb)));
  return Math.acos(c);
}

/** 0 = straight finger, 1 = fully curled. */
export function fingerCurl(joints: FingerJoints): number {
  const [a, b, c, d] = joints;
  const bendAtMid = angleBetween(sub(b, a), sub(c, b));
  const bendAtUpper = angleBetween(sub(c, b), sub(d, c));
  return clamp01((bendAtMid + bendAtUpper) / MAX_TOTAL_BEND);
}

export function computeCurls(hand: HandJoints): FingerCurls {
  return {
    thumb: fingerCurl(hand.fingers.thumb),
    index: fingerCurl(hand.fingers.index),
    middle: fingerCurl(hand.fingers.middle),
    ring: fingerCurl(hand.fingers.ring),
    pinky: fingerCurl(hand.fingers.pinky),
  };
}

export type MatchResult = {
  /** 0..1, higher is a closer match. */
  score: number;
  /** Largest single-finger difference, 0..1. */
  maxDiff: number;
  /** True when the pose is close enough to count as "holding the sign". */
  matched: boolean;
};

export type MatchTolerance = {
  /** Minimum overall score (0..1) to count as a match. */
  scoreThreshold: number;
  /** Largest allowed single-finger curl difference (0..1). */
  maxFingerDiff: number;
};

export const STANDARD_TOLERANCE: MatchTolerance = { scoreThreshold: 0.7, maxFingerDiff: 0.4 };
/** Wider tolerance for learners with limited finger dexterity or tremor. */
export const RELAXED_TOLERANCE: MatchTolerance = { scoreThreshold: 0.6, maxFingerDiff: 0.5 };

export const MATCH_SCORE_THRESHOLD = STANDARD_TOLERANCE.scoreThreshold;
export const MATCH_MAX_FINGER_DIFF = STANDARD_TOLERANCE.maxFingerDiff;

/** Per-finger difference is scaled so a 0.5 curl gap counts as a total miss. */
const FULL_ERROR_DIFF = 0.5;

export function matchPose(
  live: FingerCurls,
  target: FingerCurls,
  tolerance: MatchTolerance = STANDARD_TOLERANCE,
): MatchResult {
  let errorSum = 0;
  let maxDiff = 0;
  for (const f of FINGERS) {
    const diff = Math.abs(live[f] - target[f]);
    maxDiff = Math.max(maxDiff, diff);
    errorSum += Math.min(1, diff / FULL_ERROR_DIFF);
  }
  const score = 1 - errorSum / FINGERS.length;
  return {
    score,
    maxDiff,
    matched: score >= tolerance.scoreThreshold && maxDiff <= tolerance.maxFingerDiff,
  };
}

/** Exponential smoothing so tracking jitter does not flicker the match state. */
export function smoothCurls(prev: FingerCurls | null, next: FingerCurls, alpha: number): FingerCurls {
  if (!prev) return { ...next };
  const a = clamp01(alpha);
  const out = {} as FingerCurls;
  for (const f of FINGERS) out[f] = prev[f] + (next[f] - prev[f]) * a;
  return out;
}
