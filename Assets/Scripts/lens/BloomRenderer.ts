import { THEME } from "../core/Theme";
import { DEFAULT_BLOOM, PetalSpec, easeOutBack, ringLayout } from "../core/Symmetry";
import { makeMaterials } from "./ColorUtil";

/**
 * Spawns and animates the alpona petals in the scene.
 * One ring appears per learned sign; petals pop in one after another, then the
 * whole bloom gently "breathes" so it feels alive.
 */
@component
export class BloomRenderer extends BaseScriptComponent {
  @input
  @hint("Prefab of a single petal. A flat, upward-pointing shape works best.")
  petalPrefab: ObjectPrefab;

  @input
  @hint("Parent object that the petals are created under (placed in front of the learner).")
  bloomRoot: SceneObject;

  @input
  @allowUndefined
  @hint("Optional: the petal prefab's material. When set, the Lens auto-makes a premium alpona palette from it.")
  petalMaterial: Material;

  @input
  @allowUndefined
  @hint("Optional: your own materials (overrides the automatic palette).")
  palette: Material[];

  @input
  @hint("Overall size multiplier for the whole bloom.")
  sizeScale: number = 1;

  @input
  @hint("Gentle idle breathing of the finished bloom.")
  breathe: boolean = true;

  private materials: Material[] = [];
  private rings: { objects: SceneObject[]; specs: PetalSpec[]; last: number }[] = [];
  private time = 0;

  onAwake() {
    if (this.palette && this.palette.length > 0) this.materials = this.palette;
    else if (this.petalMaterial) this.materials = makeMaterials(this.petalMaterial, THEME.petals);

    this.createEvent("UpdateEvent").bind(() => {
      if (!this.breathe) return;
      this.time += getDeltaTime();
      const s = 1 + 0.025 * Math.sin(this.time * 1.4);
      this.bloomRoot.getTransform().setLocalScale(new vec3(s, s, s));
    });
  }

  /** Create the petals for ring `ring` (hidden until animated in). */
  addRing(ring: number): void {
    const specs = ringLayout(ring, { ...DEFAULT_BLOOM, paletteSize: Math.max(1, this.materials.length || THEME.petals.length) });
    const objects: SceneObject[] = [];
    for (const s of specs) {
      const obj = this.petalPrefab.instantiate(this.bloomRoot);
      const t = obj.getTransform();
      t.setLocalPosition(new vec3(s.x * this.sizeScale, s.y * this.sizeScale, 0));
      t.setLocalRotation(quat.fromEulerAngles(0, 0, s.rotation));
      t.setLocalScale(new vec3(0, 0, 0));
      if (this.materials.length > 0) {
        const visual = obj.getComponent("Component.RenderMeshVisual") as RenderMeshVisual | null;
        if (visual) visual.mainMaterial = this.materials[s.colorIndex % this.materials.length];
      }
      objects.push(obj);
    }
    this.rings[ring] = { objects, specs, last: -1 };
  }

  /** Animate ring `ring` at progress 0..1 — petals pop in with a staggered overshoot. */
  setRingProgress(ring: number, progress: number): void {
    const r = this.rings[ring];
    if (!r || Math.abs(r.last - progress) < 1e-4) return; // nothing changed
    r.last = progress;
    const n = r.objects.length;
    for (let i = 0; i < n; i++) {
      const stagger = (i / n) * 0.5; // each petal starts a little after the previous one
      const local = Math.max(0, Math.min(1, (progress - stagger) / 0.5));
      const s = r.specs[i].scale * this.sizeScale * easeOutBack(local);
      r.objects[i].getTransform().setLocalScale(new vec3(s, s, s));
    }
  }

  clear(): void {
    for (const r of this.rings) if (r) for (const o of r.objects) o.destroy();
    this.rings = [];
  }
}
