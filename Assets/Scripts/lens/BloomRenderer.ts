import { DEFAULT_BLOOM, PetalSpec, easeOutBack, ringLayout } from "../core/Symmetry";

/**
 * Spawns and animates the alpona petals in the scene.
 * One ring appears per learned sign; petals pop in one after another.
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
  @hint("Optional: one material per palette colour. Leave empty to keep the prefab's own material.")
  palette: Material[];

  @input
  @hint("Overall size multiplier for the whole bloom.")
  sizeScale: number = 1;

  private rings: { objects: SceneObject[]; specs: PetalSpec[] }[] = [];

  onAwake() {
    // nothing to do until a ring is added
  }

  /** Create the petals for ring `ring` (hidden until animated in). */
  addRing(ring: number): void {
    const specs = ringLayout(ring, { ...DEFAULT_BLOOM, paletteSize: Math.max(1, this.palette?.length ?? 7) });
    const objects: SceneObject[] = [];
    for (const s of specs) {
      const obj = this.petalPrefab.instantiate(this.bloomRoot);
      const t = obj.getTransform();
      t.setLocalPosition(new vec3(s.x * this.sizeScale, s.y * this.sizeScale, 0));
      t.setLocalRotation(quat.fromEulerAngles(0, 0, s.rotation));
      t.setLocalScale(vec3.zero());
      if (this.palette && this.palette.length > 0) {
        const visual = obj.getComponent("Component.RenderMeshVisual") as RenderMeshVisual;
        if (visual) visual.mainMaterial = this.palette[s.colorIndex % this.palette.length];
      }
      objects.push(obj);
    }
    this.rings[ring] = { objects, specs };
  }

  /** Animate ring `ring` at progress 0..1 — petals pop in with a staggered overshoot. */
  setRingProgress(ring: number, progress: number): void {
    const r = this.rings[ring];
    if (!r) return;
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
