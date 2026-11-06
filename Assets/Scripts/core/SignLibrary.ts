import { FingerCurls } from "./HandPose";

export type Sign = {
  id: string;
  /** Bangla word shown to the learner. */
  bangla: string;
  /** Romanized pronunciation. */
  roman: string;
  english: string;
  /** Target finger curls: 0 = extended, 1 = curled. */
  curls: FingerCurls;
  /** Short coaching hint shown under the target. */
  hint: string;
};

const c = (thumb: number, index: number, middle: number, ring: number, pinky: number): FingerCurls => ({
  thumb,
  index,
  middle,
  ring,
  pinky,
});

/**
 * STARTER SET — finger-count numerals and a thumbs-up.
 *
 * These are intentionally simple hand shapes that can be recognised from finger
 * curl alone. Regional variants of number signs exist; before shipping this to
 * real learners, have a Bangla Sign Language (BdSL) educator review the set.
 * To add a sign, append an entry here — nothing else needs to change.
 */
export const SIGNS: readonly Sign[] = [
  {
    id: "zero",
    bangla: "শূন্য",
    roman: "shunyo",
    english: "Zero",
    curls: c(0.85, 1, 1, 1, 1),
    hint: "Close your hand into a fist.",
  },
  {
    id: "one",
    bangla: "এক",
    roman: "ek",
    english: "One",
    curls: c(0.85, 0, 1, 1, 1),
    hint: "Raise only your index finger.",
  },
  {
    id: "two",
    bangla: "দুই",
    roman: "dui",
    english: "Two",
    curls: c(0.85, 0, 0, 1, 1),
    hint: "Raise index and middle fingers.",
  },
  {
    id: "three",
    bangla: "তিন",
    roman: "tin",
    english: "Three",
    curls: c(0.85, 0, 0, 0, 1),
    hint: "Raise index, middle and ring fingers.",
  },
  {
    id: "four",
    bangla: "চার",
    roman: "char",
    english: "Four",
    curls: c(0.85, 0, 0, 0, 0),
    hint: "Raise four fingers, thumb tucked in.",
  },
  {
    id: "five",
    bangla: "পাঁচ",
    roman: "panch",
    english: "Five",
    curls: c(0, 0, 0, 0, 0),
    hint: "Open your whole hand.",
  },
  {
    id: "good",
    bangla: "ভালো",
    roman: "bhalo",
    english: "Good",
    curls: c(0, 1, 1, 1, 1),
    hint: "Fist with the thumb pointing up.",
  },
];
