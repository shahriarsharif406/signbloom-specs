import { foldPoint } from "../core/Symmetry";

/**
 * "Alpona Air" — the free-drawing reward unlocked after the last sign.
 * While the learner pinches, every point the index fingertip passes through
 * is mirrored and rotated around the bloom's centre, so a single stroke
 * paints a whole symmetric alpona.
 */
@component
export class FreeAlponaPainter extends BaseScriptComponent {
  @input
  @hint("Small dot prefab used as ink.")
  dotPrefab: ObjectPrefab;

  @input
  @hint("Same parent as the bloom, so drawing is centred on it.")
  paintRoot: SceneObject;

  @input
  @hint("Rotational symmetry (8 is classic alpona).")
  folds: number = 8;

  @input
  @hint("Minimum distance between ink dots (scene units).")
  spacing: number = 0.6;

  @input
  @hint("Stop painting after this many dots to protect frame rate.")
  maxDots: number = 1500;

  private dots: SceneObject[] = [];
  private last: vec2 | null = null;

  /** Feed the fingertip position in the paintRoot's local space (x, y). */
  paint(localX: number, localY: number): void {
    if (this.dots.length >= this.maxDots) return;
    if (this.last && Math.hypot(localX - this.last.x, localY - this.last.y) < this.spacing) return;
    this.last = new vec2(localX, localY);
    for (const p of foldPoint({ x: localX, y: localY }, this.folds, true)) {
      const dot = this.dotPrefab.instantiate(this.paintRoot);
      dot.getTransform().setLocalPosition(new vec3(p.x, p.y, 0));
      this.dots.push(dot);
    }
  }

  endStroke(): void {
    this.last = null;
  }

  clear(): void {
    for (const d of this.dots) d.destroy();
    this.dots = [];
    this.last = null;
  }
}
