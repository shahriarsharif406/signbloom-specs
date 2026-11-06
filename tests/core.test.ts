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
import { SIGNS } from "../Assets/Scripts/core/SignLibrary";
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
  assert.deepEqual(learned, ["zero"]);
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

console.log(`\n${passed} tests passed`);
