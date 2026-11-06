/**
 * Minimal ambient declarations for the parts of the Lens Studio API that SignBloom uses.
 *
 * PURPOSE: lets `npm run typecheck:lens` catch typos, wrong argument types and
 * logic slips in Assets/Scripts/lens/ outside Lens Studio (for example in CI).
 *
 * These are hand-written approximations, NOT Snap's official typings. They cannot
 * prove the real API matches — Lens Studio's own compiler is the final judge.
 */

declare class vec2 {
  x: number;
  y: number;
  constructor(x: number, y: number);
}
declare class vec3 {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number);
  distance(other: vec3): number;
  static zero(): vec3;
  static one(): vec3;
}
declare class vec4 {
  x: number;
  y: number;
  z: number;
  w: number;
  constructor(x: number, y: number, z: number, w: number);
}
declare class quat {
  static fromEulerAngles(x: number, y: number, z: number): quat;
}
declare class mat4 {
  multiplyPoint(v: vec3): vec3;
}

declare class Transform {
  setLocalPosition(v: vec3): void;
  setLocalRotation(q: quat): void;
  setLocalScale(v: vec3): void;
  getLocalScale(): vec3;
  getInvertedWorldTransform(): mat4;
}
declare class Component {
  getSceneObject(): SceneObject;
}
declare class SceneObject {
  enabled: boolean;
  getTransform(): Transform;
  getComponent(type: string): any;
  destroy(): void;
}
declare class ScriptEvent {
  bind(fn: (e?: any) => void): void;
}
declare class BaseScriptComponent extends Component {
  createEvent(name: string): ScriptEvent;
}
declare class Pass {
  baseColor: vec4;
}
declare class Material {
  mainPass: Pass;
  clone(): Material;
}
declare class RenderMeshVisual extends Component {
  mainMaterial: Material;
}
declare class ObjectPrefab {
  instantiate(parent: SceneObject | null): SceneObject;
}
declare class Text extends Component {
  text: string;
  textFill: { color: vec4 };
}
declare class AudioComponent extends Component {
  play(loops: number): void;
  stop(fade: boolean): void;
}

declare function getDeltaTime(): number;
declare const global: any;

declare function component(target: any): void;
declare function input(target: any, key: string): void;
declare function hint(text: string): (target: any, key: string) => void;
declare function allowUndefined(target: any, key: string): void;
declare function widget(w: any): (target: any, key: string) => void;
declare class ComboBoxItem {
  constructor(label: string, value: any);
}
declare class ComboBoxWidget {
  constructor(items: ComboBoxItem[]);
}

declare module "SpectaclesInteractionKit.lspkg/SIK" {
  export const SIK: any;
}
