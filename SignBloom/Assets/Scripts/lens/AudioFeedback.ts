export type Cue = "learned" | "star3" | "complete" | "tap";

/**
 * Optional sound cues. Assign an AudioComponent (with an audio track) to any
 * slot you want; empty slots are simply silent. Use short, soft sounds —
 * think wind chimes — and keep volume modest for comfort and accessibility.
 */
@component
export class AudioFeedback extends BaseScriptComponent {
  @input
  @allowUndefined
  @hint("Played when a sign is learned (1–2 stars).")
  learned: AudioComponent;

  @input
  @allowUndefined
  @hint("Played when a sign is learned with 3 stars.")
  star3: AudioComponent;

  @input
  @allowUndefined
  @hint("Played when the lesson is complete.")
  complete: AudioComponent;

  @input
  @allowUndefined
  @hint("Played on button taps (quiz, language, undo…).")
  tap: AudioComponent;

  play(cue: Cue): void {
    const slot = cue === "learned" ? this.learned : cue === "star3" ? this.star3 : cue === "complete" ? this.complete : this.tap;
    if (slot) slot.play(1);
  }
}
