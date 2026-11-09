import { hexToRgba } from "../core/Theme";

export function toVec4(hex: string): vec4 {
  const [r, g, b, a] = hexToRgba(hex);
  return new vec4(r, g, b, a);
}

export function setTextColor(text: Text | undefined, hex: string): void {
  if (text) text.textFill.color = toVec4(hex);
}

/** Clone `base` once per colour so many objects can share a handful of materials. */
export function makeMaterials(base: Material, hexes: readonly string[]): Material[] {
  return hexes.map((hex) => {
    const m = base.clone();
    m.mainPass.baseColor = toVec4(hex);
    return m;
  });
}

/**
 * Tints a scene object's mesh. The object gets its own material copy on first use
 * so tinting never leaks to other objects that share the original material.
 */
export class Tinter {
  private owned: { obj: SceneObject; mat: Material }[] = [];

  tint(obj: SceneObject | undefined, hex: string): void {
    if (!obj) return;
    let entry = this.owned.find((e) => e.obj === obj);
    if (!entry) {
      const visual = obj.getComponent("Component.RenderMeshVisual") as RenderMeshVisual | null;
      if (!visual) return;
      const mat = visual.mainMaterial.clone();
      visual.mainMaterial = mat;
      entry = { obj, mat };
      this.owned.push(entry);
    }
    entry.mat.mainPass.baseColor = toVec4(hex);
  }
}
