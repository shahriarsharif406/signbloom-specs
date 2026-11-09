import { DEFAULT_PAINT, PaintSession } from "../core/PaintSession";
import { THEME } from "../core/Theme";
import { makeMaterials } from "./ColorUtil";

/**
 * "Alpona Air" — the free-drawing reward unlocked after the lesson.
 * While the learner pinches, every point the index fingertip passes through is
 * mirrored and rotated around the centre, so a single stroke paints a whole
 * symmetric alpona. Supports undo, clear, 4/6/8/12-fold symmetry and 7 brush colours.
 */
@component
export class FreeAlponaPainter extends BaseScriptComponent {
  @input
  @hint("Small dot prefab used as ink.")
  dotPrefab: ObjectPrefab;

  @input
  @hint("Same position as the bloom, so drawing is centred on it.")
  paintRoot: SceneObject;

  @input
  @allowUndefined
  @hint("Optional: the dot prefab's material. When set, brushes get the alpona colour palette.")
  dotMaterial: Material;

  @input
  @hint("Minimum distance between ink dots (scene units).")
  spacing: number = 0.6;

  @input
  @hint("Stop painting after this many dots to protect frame rate.")
  maxDots: number = 1500;

  private session: PaintSession = new PaintSession(DEFAULT_PAINT);
  private strokes: SceneObject[][] = [];
  private brushes: Material[] = [];

  onAwake() {
    this.session = new PaintSession({
      ...DEFAULT_PAINT,
      spacing: this.spacing,
      maxDots: this.maxDots,
      brushCount: THEME.petals.length,
    });
    if (this.dotMaterial) this.brushes = makeMaterials(this.dotMaterial, THEME.petals);
  }

  /** Feed the fingertip position in the paintRoot's local space (x, y). */
  paint(localX: number, localY: number): void {
    const pts = this.session.add({ x: localX, y: localY });
    if (!pts) return;
    while (this.strokes.length < this.session.strokeCount) this.strokes.push([]);
    const stroke = this.strokes[this.strokes.length - 1];
    for (const p of pts) {
      const dot = this.dotPrefab.instantiate(this.paintRoot);
      dot.getTransform().setLocalPosition(new vec3(p.x, p.y, 0));
      // The dot mesh is flat in XZ; tilt it to face the viewer.
      dot.getTransform().setLocalRotation(quat.fromEulerAngles(Math.PI / 2, 0, 0));
      if (this.brushes.length > 0) {
        const visual = dot.getComponent("Component.RenderMeshVisual") as RenderMeshVisual | null;
        if (visual) visual.mainMaterial = this.brushes[p.brush % this.brushes.length];
      }
      stroke.push(dot);
    }
  }

  endStroke(): void {
    this.session.endStroke();
  }

  undo(): void {
    if (this.session.undo() === 0) return;
    const s = this.strokes.pop();
    if (s) for (const d of s) d.destroy();
  }

  clear(): void {
    for (const s of this.strokes) for (const d of s) d.destroy();
    this.strokes = [];
    this.session.clear();
  }

  cycleSymmetry(): number {
    return this.session.cycleFolds();
  }

  cycleBrush(): number {
    return this.session.cycleBrush();
  }

  get folds(): number {
    return this.session.folds;
  }

  get brush(): number {
    return this.session.brushIndex + 1;
  }
}
