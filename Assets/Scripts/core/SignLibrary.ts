import { FingerCurls } from "./HandPose";

/**
 * A single static, one-handed sign. Language-neutral: `label` is the text shown
 * large on screen (a numeral, a letter, or a word in the pack's own script).
 */
export type Sign = {
  id: string;
  /** Large on-screen label, e.g. "3", "L", "তিন". */
  label: string;
  /** Optional reading/pronunciation shown beside the English name. */
  reading?: string;
  english: string;
  /** Target finger curls: 0 = extended, 1 = curled. */
  curls: FingerCurls;
  /** Coaching hint in English. */
  hint: string;
  /** Coaching hint in Bangla. */
  hintBn: string;
};

const c = (thumb: number, index: number, middle: number, ring: number, pinky: number): FingerCurls => ({
  thumb,
  index,
  middle,
  ring,
  pinky,
});

/**
 * American Sign Language starter handshapes: numbers 1–5 plus three iconic
 * handshapes (L, Y, "I love you"). Chosen because each is recognisable from
 * finger curl alone and all eight are mutually distinct (enforced by tests).
 * Numbers 6–9 and 0 rely on thumb–finger contact, which curl cannot capture —
 * see docs/ROADMAP.md.
 */
export const ASL_SIGNS: readonly Sign[] = [
  { id: "asl.one", label: "1", english: "One", curls: c(0.85, 0, 1, 1, 1), hint: "Raise only your index finger.", hintBn: "শুধু তর্জনী তুলুন।" },
  { id: "asl.two", label: "2", english: "Two", curls: c(0.85, 0, 0, 1, 1), hint: "Raise index and middle fingers.", hintBn: "তর্জনী ও মধ্যমা তুলুন।" },
  { id: "asl.three", label: "3", english: "Three", curls: c(0, 0, 0, 1, 1), hint: "Raise thumb, index and middle fingers.", hintBn: "বুড়ো আঙুল, তর্জনী ও মধ্যমা তুলুন।" },
  { id: "asl.four", label: "4", english: "Four", curls: c(0.85, 0, 0, 0, 0), hint: "Raise four fingers, thumb tucked in.", hintBn: "বুড়ো আঙুল ভেতরে রেখে চার আঙুল তুলুন।" },
  { id: "asl.five", label: "5", english: "Five", curls: c(0, 0, 0, 0, 0), hint: "Open your whole hand.", hintBn: "পুরো হাত খুলে দিন।" },
  { id: "asl.l", label: "L", english: "Letter L", curls: c(0, 0, 1, 1, 1), hint: "Thumb and index finger out, making an L.", hintBn: "বুড়ো আঙুল ও তর্জনী বের করে L আকৃতি করুন।" },
  { id: "asl.y", label: "Y", english: "Letter Y", curls: c(0, 1, 1, 1, 0), hint: "Thumb and little finger out, others curled.", hintBn: "বুড়ো আঙুল ও কনিষ্ঠা তুলুন, বাকিগুলো ভাঁজ করুন।" },
  { id: "asl.ily", label: "ILY", english: "I love you", curls: c(0, 0, 1, 1, 0), hint: "Thumb, index and little finger out; middle and ring curled.", hintBn: "বুড়ো আঙুল, তর্জনী ও কনিষ্ঠা তুলুন; মধ্যমা ও অনামিকা ভাঁজ করুন।" },
];

/**
 * Bangla numerals — STARTER set of finger-count shapes.
 * NOT verified against Bangla Sign Language (BdSL). Replace with targets derived
 * from the open BdSL47 dataset using tools/derive_curls.py, then have a BdSL
 * educator review them.
 */
export const BANGLA_STARTER_SIGNS: readonly Sign[] = [
  { id: "bn.zero", label: "শূন্য", reading: "shunyo", english: "Zero", curls: c(0.85, 1, 1, 1, 1), hint: "Close your hand into a fist.", hintBn: "হাত মুঠো করুন।" },
  { id: "bn.one", label: "এক", reading: "ek", english: "One", curls: c(0.85, 0, 1, 1, 1), hint: "Raise only your index finger.", hintBn: "শুধু তর্জনী তুলুন।" },
  { id: "bn.two", label: "দুই", reading: "dui", english: "Two", curls: c(0.85, 0, 0, 1, 1), hint: "Raise index and middle fingers.", hintBn: "তর্জনী ও মধ্যমা তুলুন।" },
  { id: "bn.three", label: "তিন", reading: "tin", english: "Three", curls: c(0.85, 0, 0, 0, 1), hint: "Raise index, middle and ring fingers.", hintBn: "তর্জনী, মধ্যমা ও অনামিকা তুলুন।" },
  { id: "bn.four", label: "চার", reading: "char", english: "Four", curls: c(0.85, 0, 0, 0, 0), hint: "Raise four fingers, thumb tucked in.", hintBn: "বুড়ো আঙুল ভেতরে রেখে চার আঙুল তুলুন।" },
  { id: "bn.five", label: "পাঁচ", reading: "panch", english: "Five", curls: c(0, 0, 0, 0, 0), hint: "Open your whole hand.", hintBn: "পুরো হাত খুলে দিন।" },
  { id: "bn.good", label: "ভালো", reading: "bhalo", english: "Good", curls: c(0, 1, 1, 1, 1), hint: "Fist with the thumb pointing up.", hintBn: "মুঠো করে বুড়ো আঙুল উপরে তুলুন।" },
];
