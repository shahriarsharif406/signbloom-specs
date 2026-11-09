/**
 * Symmetry — alpona geometry.
 *
 * Alpona (আল্পনা) is ritual floor art built from repeated, symmetric motifs.
 * Everything here is pure math: given learned signs or a drawn stroke, produce
 * 2D placements that the Lens renderer turns into scene objects.
 */

export type P2 = { x: number; y: number };

const TAU = Math.PI * 2;

/** Rotate a point around the origin. */
export function rotate(p: P2, angle: number): P2 {
  const cs = Math.cos(angle);
  const sn = Math.sin(angle);
  return { x: p.x * cs - p.y * sn, y: p.x * sn + p.y * cs };
}

/** Mirror across the vertical axis. */
export const mirrorX = (p: P2): P2 => ({ x: -p.x, y: p.y });

/**
 * Dihedral symmetry: `folds` rotated copies, plus (optionally) their mirror images.
 * Returns folds * 2 points when mirrored, folds points otherwise.
 */
export function foldPoint(p: P2, folds: number, mirrored = true): P2[] {
  const n = Math.max(1, Math.floor(folds));
  const out: P2[] = [];
  const base = mirrored ? [p, mirrorX(p)] : [p];
  for (let k = 0; k < n; k++) {
    for (const b of base) out.push(rotate(b, (TAU * k) / n));
  }
  return out;
}

/** Apply dihedral symmetry to a whole stroke. Returns one stroke per symmetric copy. */
export function foldStroke(stroke: P2[], folds: number, mirrored = true): P2[][] {
  if (stroke.length === 0) return [];
  const copies = foldPoint(stroke[0], folds, mirrored).length;
  const strokes: P2[][] = Array.from({ length: copies }, () => []);
  for (const p of stroke) {
    const pts = foldPoint(p, folds, mirrored);
    for (let i = 0; i < copies; i++) strokes[i].push(pts[i]);
  }
  return strokes;
}

export type PetalSpec = {
  x: number;
  y: number;
  /** Radians; petal "up" points away from the centre. */
  rotation: number;
  scale: number;
  /** Index into the colour palette. */
  colorIndex: number;
  /** Which learned sign (ring) this petal belongs to. */
  ring: number;
};

export type BloomOptions = {
  /** Distance from the centre of the first ring (scene units). */
  baseRadius: number;
  /** Extra distance added per ring. */
  ringStep: number;
  /** Petals in the first ring. */
  basePetals: number;
  /** Petals added per ring. */
  petalsPerRing: number;
  /** Upper bound on petals in any ring. */
  maxPetals: number;
  /** Scale of the first ring's petals; later rings shrink by `scaleFalloff`. */
  baseScale: number;
  scaleFalloff: number;
  paletteSize: number;
};

export const DEFAULT_BLOOM: BloomOptions = {
  baseRadius: 4,
  ringStep: 3.2,
  basePetals: 8,
  petalsPerRing: 4,
  maxPetals: 28,
  baseScale: 1,
  scaleFalloff: 0.92,
  paletteSize: 7,
};

export function petalsInRing(ring: number, o: BloomOptions = DEFAULT_BLOOM): number {
  return Math.min(o.maxPetals, o.basePetals + ring * o.petalsPerRing);
}

/** Layout for a single ring (one learned sign). */
export function ringLayout(ring: number, o: BloomOptions = DEFAULT_BLOOM): PetalSpec[] {
  const count = petalsInRing(ring, o);
  const radius = o.baseRadius + ring * o.ringStep;
  // Offset every other ring by half a petal so the pattern interlocks.
  const offset = ring % 2 === 0 ? 0 : Math.PI / count;
  const scale = o.baseScale * Math.pow(o.scaleFalloff, ring);
  const out: PetalSpec[] = [];
  for (let i = 0; i < count; i++) {
    const a = (TAU * i) / count + offset;
    out.push({
      x: Math.cos(a) * radius,
      y: Math.sin(a) * radius,
      rotation: a - Math.PI / 2,
      scale,
      colorIndex: (ring + (i % 2)) % Math.max(1, o.paletteSize),
      ring,
    });
  }
  return out;
}

/** Full bloom after `learnedCount` signs: one interlocking ring per sign. */
export function bloomLayout(learnedCount: number, o: BloomOptions = DEFAULT_BLOOM): PetalSpec[] {
  const out: PetalSpec[] = [];
  for (let r = 0; r < learnedCount; r++) out.push(...ringLayout(r, o));
  return out;
}

/** Overshoot easing for the petal "pop" animation. t in 0..1 -> 0..1 (peaks above 1). */
export function easeOutBack(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}
