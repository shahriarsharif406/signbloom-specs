import assert from "node:assert/strict";
import {
  FINGERS,
  FingerCurls,
  FingerJoints,
  HandJoints,
  Vec3,
  computeCurls,
  fingerCurl,
  matchPose,
} from "../Assets/Scripts/core/HandPose";
import { ASL_SIGNS as SIGNS } from "../Assets/Scripts/core/SignLibrary";
import { PACKS, getPack, DEFAULT_PACK_ID } from "../Assets/Scripts/core/Packs";
import { Lesson } from "../Assets/Scripts/core/Lesson";
import {
  DEFAULT_BLOOM,
  bloomLayout,
  easeOutBack,
  foldPoint,
  foldStroke,
  petalsInRing,
} from "../Assets/Scripts/core/Symmetry";

let passed = 0;
function test(name: string, fn: () => void): void {
  fn();
  passed++;
  console.log("  ok  " + name);
}
const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps, `${a} !~ ${b}`);

// ---- synthetic finger: bend each of the two joints by `bend` radians --------
function syntheticFinger(bend: number): FingerJoints {
  const seg = 1;
  const p0: Vec3 = { x: 0, y: 0, z: 0 };
  const p1: Vec3 = { x: 0, y: seg, z: 0 };
  const d1 = { x: 0, y: Math.cos(bend), z: Math.sin(bend) };
  const p2: Vec3 = { x: 0, y: p1.y + d1.y * seg, z: d1.z * seg };
  const d2 = { x: 0, y: Math.cos(2 * bend), z: Math.sin(2 * bend) };
  const p3: Vec3 = { x: 0, y: p2.y + d2.y * seg, z: p2.z + d2.z * seg };
  return [p0, p1, p2, p3];
}

function syntheticHand(curlByFinger: FingerCurls): HandJoints {
  const fingers = {} as HandJoints["fingers"];
  for (const f of FINGERS) fingers[f] = syntheticFinger((curlByFinger[f] * 2.8) / 2);
  return { wrist: { x: 0, y: -1, z: 0 }, fingers };
}

console.log("HandPose");
test("straight finger has curl 0", () => near(fingerCurl(syntheticFinger(0)), 0));
test("fully bent finger has curl 1", () => near(fingerCurl(syntheticFinger(1.4)), 1, 1e-6));
test("half bent finger is about 0.5", () => near(fingerCurl(syntheticFinger(0.7)), 0.5, 1e-6));
test("computeCurls round-trips synthetic hands", () => {
  const target = SIGNS[2].curls;
  const out = computeCurls(syntheticHand(target));
  for (const f of FINGERS) near(out[f], target[f], 1e-6);
});
test("exact pose matches itself with score 1", () => {
  const r = matchPose(SIGNS[1].curls, SIGNS[1].curls);
  near(r.score, 1);
  assert.equal(r.matched, true);
});
test("small noise still matches", () => {
  const noisy = { ...SIGNS[3].curls };
  noisy.index += 0.1;
  noisy.ring -= 0.08;
  assert.equal(matchPose(noisy, SIGNS[3].curls).matched, true);
});
test("no sign is confused with any other sign", () => {
  for (const a of SIGNS)
    for (const b of SIGNS) {
      if (a.id === b.id) continue;
      assert.equal(matchPose(a.curls, b.curls).matched, false, `${a.id} matched ${b.id}`);
    }
});

console.log("Symmetry");
test("foldPoint mirrored gives 2*folds points", () => assert.equal(foldPoint({ x: 1, y: 0 }, 8).length, 16));
test("foldPoint keeps distance from centre", () => {
  for (const q of foldPoint({ x: 3, y: 4 }, 6)) near(Math.hypot(q.x, q.y), 5);
});
test("foldStroke returns equal-length strokes", () => {
  const strokes = foldStroke(
    [
      { x: 1, y: 0 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
    ],
    4,
  );
  assert.equal(strokes.length, 8);
  for (const s of strokes) assert.equal(s.length, 3);
});
test("bloom grows ring by ring", () => {
  assert.equal(bloomLayout(0).length, 0);
  assert.equal(bloomLayout(1).length, petalsInRing(0));
  assert.equal(bloomLayout(3).length, petalsInRing(0) + petalsInRing(1) + petalsInRing(2));
});
test("petal counts are capped", () => assert.equal(petalsInRing(99), DEFAULT_BLOOM.maxPetals));
test("petals sit on their ring radius", () => {
  for (const p of bloomLayout(2)) {
    const expected = DEFAULT_BLOOM.baseRadius + p.ring * DEFAULT_BLOOM.ringStep;
    near(Math.hypot(p.x, p.y), expected, 1e-9);
  }
});
test("easeOutBack starts at 0, ends at 1 and overshoots", () => {
  near(easeOutBack(0), 0);
  near(easeOutBack(1), 1);
  assert.ok(easeOutBack(0.8) > 1);
});

console.log("Lesson");
function runLesson(lesson: Lesson, seconds: number, curls: FingerCurls | null, dt = 1 / 30) {
  let snap = lesson.snapshot();
  for (let t = 0; t < seconds; t += dt) snap = lesson.update(dt, curls);
  return snap;
}
test("holding the right sign learns it and blooms", () => {
  const lesson = new Lesson(SIGNS);
  const learned: string[] = [];
  lesson.onLearned = (s) => learned.push(s.id);
  runLesson(lesson, 1.5, SIGNS[0].curls);
  assert.deepEqual(learned, [SIGNS[0].id]);
  assert.equal(lesson.snapshot().phase, "blooming");
});
test("after the bloom the next sign starts", () => {
  const lesson = new Lesson(SIGNS);
  runLesson(lesson, 1.5, SIGNS[0].curls);
  const snap = runLesson(lesson, 2, null);
  assert.equal(snap.phase, "practice");
  assert.equal(snap.signIndex, 1);
  assert.equal(snap.holdProgress, 0);
});
test("the wrong sign never progresses", () => {
  const lesson = new Lesson(SIGNS);
  const snap = runLesson(lesson, 5, SIGNS[5].curls); // open hand while 'zero' is asked
  assert.equal(snap.learned.length, 0);
  assert.equal(snap.holdProgress, 0);
});
test("losing the hand drains progress", () => {
  const lesson = new Lesson(SIGNS);
  runLesson(lesson, 0.6, SIGNS[0].curls);
  assert.ok(lesson.snapshot().holdProgress > 0.3);
  const snap = runLesson(lesson, 1.0, null);
  assert.equal(snap.holdProgress, 0);
});
test("full run completes and fires onComplete", () => {
  const lesson = new Lesson(SIGNS);
  let completed = 0;
  lesson.onComplete = () => completed++;
  for (const s of SIGNS) {
    runLesson(lesson, 1.5, s.curls);
    runLesson(lesson, 2, null);
  }
  assert.equal(lesson.snapshot().phase, "complete");
  assert.equal(lesson.snapshot().learned.length, SIGNS.length);
  assert.equal(completed, 1);
});
test("skip advances without learning", () => {
  const lesson = new Lesson(SIGNS);
  lesson.skip();
  const snap = lesson.snapshot();
  assert.equal(snap.signIndex, 1);
  assert.equal(snap.learned.length, 0);
});
test("huge dt (frame hitch) cannot skip the hold requirement", () => {
  const lesson = new Lesson(SIGNS);
  const snap = lesson.update(10, SIGNS[0].curls);
  assert.equal(snap.learned.length, 0);
});


// ============================ v2 features ===================================
import { RELAXED_TOLERANCE } from "../Assets/Scripts/core/HandPose";
import { ACCESSIBLE_LESSON, DEMO_LESSON } from "../Assets/Scripts/core/Lesson";
import { ScoreKeeper, starsFor } from "../Assets/Scripts/core/Scoring";
import { MemoryStore, ProgressStore, parseProgress, PROGRESS_KEY } from "../Assets/Scripts/core/Progress";
import { FINGER_NAMES, allKeys, t } from "../Assets/Scripts/core/Strings";
import { THEME, hexToRgba } from "../Assets/Scripts/core/Theme";
import { FOLD_OPTIONS, PaintSession } from "../Assets/Scripts/core/PaintSession";
import { Session } from "../Assets/Scripts/core/Session";
import { shuffled } from "../Assets/Scripts/core/Rng";

console.log("Tolerance");
test("relaxed tolerance accepts bigger errors the standard one rejects", () => {
  const off = { ...SIGNS[3].curls };
  off.index += 0.45;
  assert.equal(matchPose(off, SIGNS[3].curls).matched, false);
  assert.equal(matchPose(off, SIGNS[3].curls, RELAXED_TOLERANCE).matched, true);
});
test("signs stay mutually distinct even under relaxed tolerance", () => {
  for (const a of SIGNS)
    for (const b of SIGNS) {
      if (a.id === b.id) continue;
      assert.equal(matchPose(a.curls, b.curls, RELAXED_TOLERANCE).matched, false, `${a.id}~${b.id}`);
    }
});

console.log("Packs");
test("sign ids are unique across all packs", () => {
  const ids = PACKS.flatMap((p) => p.signs.map((s) => s.id));
  assert.equal(new Set(ids).size, ids.length);
});
test("every pack is mutually distinct under standard and relaxed tolerance", () => {
  for (const pack of PACKS)
    for (const a of pack.signs)
      for (const b of pack.signs) {
        if (a.id === b.id) continue;
        assert.equal(matchPose(a.curls, b.curls).matched, false, `${pack.id}: ${a.id}~${b.id}`);
        assert.equal(matchPose(a.curls, b.curls, RELAXED_TOLERANCE).matched, false, `${pack.id} relaxed: ${a.id}~${b.id}`);
      }
});
test("default pack is ASL and unknown ids fall back to it", () => {
  assert.equal(DEFAULT_PACK_ID, "asl");
  assert.equal(getPack("nope").id, "asl");
  assert.equal(getPack("bangla").id, "bangla");
});

console.log("Scoring");
test("stars reward accuracy and speed", () => {
  assert.equal(starsFor({ seconds: 3, avgScore: 0.95 }), 3);
  assert.equal(starsFor({ seconds: 9, avgScore: 0.95 }), 2);
  assert.equal(starsFor({ seconds: 3, avgScore: 0.8 }), 2);
  assert.equal(starsFor({ seconds: 30, avgScore: 0.95 }), 1);
  assert.equal(starsFor({ seconds: 3, avgScore: 0.5 }), 1);
});
test("pace scale forgives slower learners", () => {
  assert.equal(starsFor({ seconds: 9, avgScore: 0.95 }, 2), 3);
});
test("score keeper tracks streak, xp and best streak", () => {
  const k = new ScoreKeeper(7);
  k.record("a", { seconds: 3, avgScore: 0.95 }); // 3 stars, streak 1
  k.record("b", { seconds: 3, avgScore: 0.95 }); // streak 2
  k.record("c", { seconds: 40, avgScore: 0.7 }); // 1 star, streak reset
  const s = k.snapshot();
  assert.equal(s.bestStreak, 2);
  assert.equal(s.streak, 0);
  assert.equal(s.stars, 7);
  assert.equal(s.maxStars, 21);
  assert.equal(s.xp, 300 + 310 + 100);
  assert.equal(s.learnedCount, 3);
});

console.log("Progress");
test("progress round-trips through storage", () => {
  const mem = new MemoryStore();
  const p = new ProgressStore(mem);
  p.recordSession({ perSign: { zero: 3, one: 2 }, xp: 500, bestStreak: 2 });
  const again = new ProgressStore(mem).get();
  assert.deepEqual(again.mastered.sort(), ["one", "zero"]);
  assert.equal(again.totalXp, 500);
  assert.equal(again.sessions, 1);
});
test("progress never regresses best stars", () => {
  const p = new ProgressStore(new MemoryStore());
  p.recordSession({ perSign: { zero: 3 }, xp: 100, bestStreak: 1 });
  p.recordSession({ perSign: { zero: 1 }, xp: 50, bestStreak: 0 });
  assert.equal(p.get().bestStars.zero, 3);
  assert.equal(p.get().totalXp, 150);
  assert.equal(p.get().bestStreak, 1);
});
test("corrupt or foreign stored data falls back to defaults", () => {
  assert.equal(parseProgress("not json").sessions, 0);
  assert.equal(parseProgress('{"version":99}').totalXp, 0);
  const mem = new MemoryStore();
  mem.set(PROGRESS_KEY, '{"version":1,"lang":"xx","mastered":[1,"one"],"bestStars":{"one":9,"two":2},"totalXp":-5}');
  const p = new ProgressStore(mem).get();
  assert.equal(p.lang, "en");
  assert.deepEqual(p.mastered, ["one"]);
  assert.deepEqual(p.bestStars, { two: 2 });
  assert.equal(p.totalXp, 0);
});
test("language preference persists", () => {
  const mem = new MemoryStore();
  new ProgressStore(mem).setLang("bn");
  assert.equal(new ProgressStore(mem).get().lang, "bn");
});

console.log("Strings & Theme");
test("every string key exists in both languages and placeholders match", () => {
  const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(",");
  for (const k of allKeys()) {
    const en = t("en", k, {});
    const bn = t("bn", k, {});
    assert.ok(en.length > 0 && bn.length > 0, k);
    assert.equal(ph(en), ph(bn), `placeholders differ for ${k}`);
  }
});
test("placeholders are filled", () => {
  assert.equal(t("en", "progress", { n: 3, total: 7 }), "3 / 7 signs");
  assert.ok(t("bn", "tryCurl", { finger: FINGER_NAMES.bn.ring }).includes("অনামিকা"));
});
test("hexToRgba parses with and without alpha", () => {
  assert.deepEqual(hexToRgba("#FF0000"), [1, 0, 0, 1]);
  near(hexToRgba("#00000080")[3], 128 / 255);
  assert.throws(() => hexToRgba("nope"));
  for (const c of THEME.petals) hexToRgba(c);
});
test("every sign in every pack has a label and both hints", () => {
  for (const pack of PACKS)
    for (const s of pack.signs) assert.ok(s.label.length > 0 && s.hint.length > 0 && s.hintBn.length > 0, s.id);
});

console.log("PaintSession");
test("add respects spacing and returns symmetric points", () => {
  const p = new PaintSession();
  const first = p.add({ x: 5, y: 0 });
  assert.equal(first!.length, p.folds * 2);
  assert.equal(p.add({ x: 5.1, y: 0 }), null);
  assert.ok(p.add({ x: 7, y: 0 }));
});
test("undo removes exactly one stroke", () => {
  const p = new PaintSession();
  p.add({ x: 5, y: 0 });
  p.add({ x: 8, y: 0 });
  p.endStroke();
  p.add({ x: 5, y: 5 });
  p.endStroke();
  const total = p.dots;
  const removed = p.undo();
  assert.equal(removed, p.folds * 2);
  assert.equal(p.dots, total - removed);
  assert.equal(p.strokeCount, 1);
  assert.equal(p.undo(), p.folds * 4);
  assert.equal(p.undo(), 0);
});
test("dot budget is enforced", () => {
  const p = new PaintSession({ spacing: 0.1, maxDots: 40, brushCount: 3, startFoldIndex: 2 });
  let n = 0;
  for (let i = 0; i < 100; i++) if (p.add({ x: 5 + i, y: 0 })) n++;
  assert.ok(p.dots <= 40);
  assert.equal(n, 2); // 16 dots per sample at 8-fold mirrored
});
test("fold and brush cycling wraps", () => {
  const p = new PaintSession();
  for (let i = 0; i < FOLD_OPTIONS.length; i++) p.cycleFolds();
  assert.equal(p.folds, 8);
  for (let i = 0; i < 7; i++) p.cycleBrush();
  assert.equal(p.brushIndex, 0);
});

console.log("Session");
function driveSession(s: Session, seconds: number, curlsFn: () => FingerCurls | null, dt = 1 / 30) {
  let snap = s.snapshot();
  for (let t0 = 0; t0 < seconds; t0 += dt) snap = s.update(dt, curlsFn());
  return snap;
}
const HAND: FingerCurls = SIGNS[5].curls;
test("welcome waits for a visible hand", () => {
  const s = new Session(SIGNS, DEMO_LESSON);
  assert.equal(driveSession(s, 3, () => null).phase, "welcome");
  assert.equal(driveSession(s, 2, () => HAND).phase, "learn");
});
test("begin() skips the welcome screen", () => {
  const s = new Session(SIGNS, DEMO_LESSON);
  s.begin();
  assert.equal(s.currentPhase, "learn");
});
test("a full learn run reaches summary, saves progress and then paint", () => {
  const mem = new MemoryStore();
  const s = new Session(SIGNS, DEMO_LESSON, { summaryAutoSeconds: null }, new ProgressStore(mem));
  const phases: string[] = [];
  s.onPhaseChange = (p) => phases.push(p);
  s.begin();
  for (const sign of SIGNS) {
    driveSession(s, 1.2, () => sign.curls);
    driveSession(s, 1.5, () => null);
  }
  assert.equal(s.currentPhase, "summary");
  const snap = s.snapshot();
  assert.equal(snap.score.learnedCount, SIGNS.length);
  assert.ok(snap.score.xp > 0);
  assert.equal(new ProgressStore(mem).get().mastered.length, SIGNS.length);
  s.continue();
  assert.equal(s.currentPhase, "paint");
  assert.deepEqual(phases, ["learn", "summary", "paint"]);
});
test("summary can auto-advance", () => {
  const s = new Session(SIGNS.slice(0, 1), DEMO_LESSON, { summaryAutoSeconds: 2 });
  s.begin();
  driveSession(s, 1.2, () => SIGNS[0].curls);
  driveSession(s, 1.5, () => null);
  assert.equal(s.currentPhase, "summary");
  driveSession(s, 2.5, () => null);
  assert.equal(s.currentPhase, "paint");
});
test("quiz order is shuffled, deterministic and covers every sign", () => {
  const a = shuffled(SIGNS.map((x) => x.id), 7);
  const b = shuffled(SIGNS.map((x) => x.id), 7);
  assert.deepEqual(a, b);
  assert.deepEqual([...a].sort(), SIGNS.map((x) => x.id).sort());
  assert.notDeepEqual(a, SIGNS.map((x) => x.id));
});
test("quiz mode runs on shuffled signs and resets the score", () => {
  const s = new Session(SIGNS, DEMO_LESSON, { quizSeed: 3 });
  s.begin();
  s.startQuiz();
  assert.equal(s.currentMode, "quiz");
  const first = s.currentSign;
  driveSession(s, 1.2, () => first.curls);
  assert.equal(s.snapshot().score.learnedCount, 1);
  s.startQuiz();
  assert.equal(s.snapshot().score.learnedCount, 0);
});
test("restart returns to welcome with a clean slate", () => {
  const s = new Session(SIGNS, DEMO_LESSON);
  s.begin();
  driveSession(s, 1.2, () => SIGNS[0].curls);
  s.restart();
  assert.equal(s.currentPhase, "welcome");
  assert.equal(s.snapshot().score.learnedCount, 0);
});
test("accessible preset is slower and more tolerant than demo", () => {
  assert.ok(ACCESSIBLE_LESSON.holdSeconds > DEMO_LESSON.holdSeconds);
  assert.ok(ACCESSIBLE_LESSON.tolerance.maxFingerDiff > DEMO_LESSON.tolerance.maxFingerDiff);
});

console.log(`\n${passed} tests passed (total)`);
