import { FingerName } from "./HandPose";

export type Lang = "en" | "bn";

const EN = {
  tagline: "Learn signs. Grow alpona.",
  welcomeHand: "Raise your hand to begin",
  welcomeReady: "Hand found — let's bloom!",
  hold: "Hold it…",
  great: "Beautiful!",
  tryStraighten: "Try to straighten your {finger}.",
  tryCurl: "Try to curl your {finger}.",
  progress: "{n} / {total} signs",
  completeTitle: "It bloomed!",
  completeHint: "Pinch and draw in the air to paint your own alpona.",
  summaryTitle: "Lesson complete",
  stars: "{n} / {max} stars",
  xp: "{n} XP",
  bestStreak: "Best streak {n}",
  streak: "Streak ×{n}",
  accuracy: "Accuracy {n}%",
  quizTitle: "Quiz — no hints",
  quizHint: "Show the sign from memory.",
  paintFolds: "Symmetry ×{n}",
  paintStatus: "{folds} · brush {brush}",
  noHand: "Show your hand",
} as const;

export type StringKey = keyof typeof EN;

const BN: Record<StringKey, string> = {
  tagline: "ইশারা শিখুন, আল্পনা ফোটান",
  welcomeHand: "শুরু করতে আপনার হাত তুলুন",
  welcomeReady: "হাত পেয়েছি — শুরু করি!",
  hold: "ধরে রাখুন…",
  great: "চমৎকার!",
  tryStraighten: "আপনার {finger} সোজা করুন।",
  tryCurl: "আপনার {finger} ভাঁজ করুন।",
  progress: "{n} / {total}টি ইশারা",
  completeTitle: "ফুটেছে!",
  completeHint: "আঙুল চিমটি দিয়ে বাতাসে এঁকে নিজের আল্পনা বানান।",
  summaryTitle: "পাঠ সম্পূর্ণ",
  stars: "{n} / {max} তারা",
  xp: "{n} পয়েন্ট",
  bestStreak: "সেরা ধারা {n}",
  streak: "ধারা ×{n}",
  accuracy: "নির্ভুলতা {n}%",
  quizTitle: "কুইজ — কোনো ইঙ্গিত নেই",
  quizHint: "মনে করে ইশারাটি দেখান।",
  paintFolds: "প্রতিসাম্য ×{n}",
  paintStatus: "{folds} · তুলি {brush}",
  noHand: "আপনার হাত দেখান",
};

const TABLE: Record<Lang, Record<StringKey, string>> = { en: EN, bn: BN };

export const FINGER_NAMES: Record<Lang, Record<FingerName, string>> = {
  en: { thumb: "thumb", index: "index finger", middle: "middle finger", ring: "ring finger", pinky: "little finger" },
  bn: { thumb: "বুড়ো আঙুল", index: "তর্জনী", middle: "মধ্যমা", ring: "অনামিকা", pinky: "কনিষ্ঠা" },
};

/** Look up a string and fill `{name}` placeholders. Unknown placeholders are left intact. */
export function t(lang: Lang, key: StringKey, vars: Record<string, string | number> = {}): string {
  const raw = TABLE[lang][key];
  return raw.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
}

export function allKeys(): StringKey[] {
  return Object.keys(EN) as StringKey[];
}
