#!/usr/bin/env python3
"""
derive_curls.py — turn real BdSL47 hand-keypoint data into SignBloom sign targets.

BdSL47 (Rayeed et al., CC BY 4.0, https://data.mendeley.com/datasets/pbb3w3f92y)
contains one-handed static Bangla Sign Language signs recorded as 21 MediaPipe
hand keypoints. Digit signs are labels 37..46 (০..৯).

This script computes, for every digit, the median "finger curl" (0 = straight,
1 = curled) using the SAME math as Assets/Scripts/core/HandPose.ts, then:
  * prints a table (median and spread per finger, sample count),
  * warns about digit pairs that finger-curl alone cannot tell apart,
  * prints ready-to-paste SignLibrary.ts entries.

Usage
-----
  python3 tools/derive_curls.py --selftest
  python3 tools/derive_curls.py /path/to/BdSL47/digits [--labels-0-9]

CSV layout (per the dataset paper): 63 feature columns x00,y00,z00 ... x20,y20,z20
followed by a label column; a header row may or may not be present.
Caveat: the dataset min-max normalises x and y per axis and standardises z, which
slightly distorts angles. Treat results as a strong starting point, then confirm
with a BdSL educator.
"""
import csv
import glob
import math
import os
import statistics
import sys

# MediaPipe landmark indices: wrist=0; per finger: base/MCP, mid, upper, tip.
FINGERS = {
    "thumb": (1, 2, 3, 4),   # CMC, MCP, IP, tip
    "index": (5, 6, 7, 8),   # MCP, PIP, DIP, tip
    "middle": (9, 10, 11, 12),
    "ring": (13, 14, 15, 16),
    "pinky": (17, 18, 19, 20),
}
ORDER = ["thumb", "index", "middle", "ring", "pinky"]
MAX_TOTAL_BEND = 2.8  # must match HandPose.ts

DIGITS = [  # label offset 0..9 -> (digit, bangla word, romanisation, id)
    ("০", "শূন্য", "shunyo", "zero"),
    ("১", "এক", "ek", "one"),
    ("২", "দুই", "dui", "two"),
    ("৩", "তিন", "tin", "three"),
    ("৪", "চার", "char", "four"),
    ("৫", "পাঁচ", "panch", "five"),
    ("৬", "ছয়", "chhoy", "six"),
    ("৭", "সাত", "shat", "seven"),
    ("৮", "আট", "aat", "eight"),
    ("৯", "নয়", "noy", "nine"),
]
ENGLISH = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]


def _sub(a, b):
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def _angle(a, b):
    la = math.sqrt(sum(v * v for v in a))
    lb = math.sqrt(sum(v * v for v in b))
    if la < 1e-9 or lb < 1e-9:
        return 0.0
    c = max(-1.0, min(1.0, sum(x * y for x, y in zip(a, b)) / (la * lb)))
    return math.acos(c)


def finger_curl(p0, p1, p2, p3):
    bend_mid = _angle(_sub(p1, p0), _sub(p2, p1))
    bend_upper = _angle(_sub(p2, p1), _sub(p3, p2))
    return max(0.0, min(1.0, (bend_mid + bend_upper) / MAX_TOTAL_BEND))


def curls_from_points(pts):
    """pts: list of 21 (x, y, z) tuples -> dict finger -> curl."""
    return {f: finger_curl(*(pts[i] for i in FINGERS[f])) for f in ORDER}


def parse_row(row, labels_0_9):
    """Return (label_index 0..9, points) or None if the row is not a usable digit row."""
    try:
        vals = [float(v) for v in row[-64:]]  # 63 features + label (name column, if any, is before)
    except ValueError:
        return None
    if len(vals) != 64:
        return None
    label = int(round(vals[63]))
    idx = label if labels_0_9 else label - 37
    if not 0 <= idx <= 9:
        return None
    pts = [(vals[i * 3], vals[i * 3 + 1], vals[i * 3 + 2]) for i in range(21)]
    return idx, pts


def load(root, labels_0_9):
    per = {i: {f: [] for f in ORDER} for i in range(10)}
    files = glob.glob(os.path.join(root, "**", "*.csv"), recursive=True)
    for path in files:
        with open(path, newline="", encoding="utf-8-sig") as fh:
            for row in csv.reader(fh):
                parsed = parse_row(row, labels_0_9)
                if not parsed:
                    continue
                idx, pts = parsed
                for f, c in curls_from_points(pts).items():
                    per[idx][f].append(c)
    return per, len(files)


def q(values, p):
    v = sorted(values)
    k = (len(v) - 1) * p
    lo, hi = math.floor(k), math.ceil(k)
    return v[lo] + (v[hi] - v[lo]) * (k - lo)


def summarise(per):
    out = {}
    for i in range(10):
        n = len(per[i]["thumb"])
        if n == 0:
            continue
        out[i] = {
            "n": n,
            "median": {f: statistics.median(per[i][f]) for f in ORDER},
            "iqr": {f: q(per[i][f], 0.75) - q(per[i][f], 0.25) for f in ORDER},
        }
    return out


def confusable(summary, max_diff=0.4):
    """Pairs whose median curls are within SignBloom's standard tolerance on every finger."""
    pairs = []
    keys = sorted(summary)
    for a in range(len(keys)):
        for b in range(a + 1, len(keys)):
            ka, kb = keys[a], keys[b]
            diff = max(abs(summary[ka]["median"][f] - summary[kb]["median"][f]) for f in ORDER)
            if diff <= max_diff:
                pairs.append((ka, kb, diff))
    return pairs


def snap(v):
    """Round to the nearest 0.05 to keep the library readable."""
    return round(v * 20) / 20


def report(summary):
    print("digit  n      " + "  ".join(f"{f:>13}" for f in ORDER))
    for i in sorted(summary):
        s = summary[i]
        cells = "  ".join(f"{s['median'][f]:.2f} (±{s['iqr'][f]:.2f})".rjust(13) for f in ORDER)
        print(f"{DIGITS[i][0]}      {s['n']:<6} {cells}")
    bad = confusable(summary)
    print()
    if bad:
        print("⚠ Finger-curl cannot separate these pairs (every finger within 0.40):")
        for a, b, d in bad:
            print(f"   {DIGITS[a][0]} ({DIGITS[a][2]}) vs {DIGITS[b][0]} ({DIGITS[b][2]})   max diff {d:.2f}")
        print("   Keep only one of each pair, or add a feature (finger spread / thumb contact).")
    else:
        print("✓ All digits are separable by finger curl at the standard tolerance.")
    print("\n// Paste into Assets/Scripts/core/SignLibrary.ts (add hints before shipping):")
    for i in sorted(summary):
        m = summary[i]["median"]
        digit, bn, roman, sid = DIGITS[i]
        vals = ", ".join(f"{snap(m[f]):.2f}".rstrip("0").rstrip(".") for f in ORDER)
        print(
            f'  {{ id: "{sid}", bangla: "{bn}", roman: "{roman}", english: "{ENGLISH[i]}",\n'
            f'    curls: c({vals}),\n'
            f'    hint: "TODO", hintBn: "TODO" }},  // {digit}'
        )


# ------------------------------------------------------------------ self-test
def _synthetic_finger(bend):
    """Four points: a straight first segment, then two joints each bent by `bend` radians."""
    p0 = (0.0, 0.0, 0.0)
    p1 = (0.0, 1.0, 0.0)
    d1 = (0.0, math.cos(bend), math.sin(bend))
    p2 = (0.0, p1[1] + d1[1], d1[2])
    d2 = (0.0, math.cos(2 * bend), math.sin(2 * bend))
    p3 = (0.0, p2[1] + d2[1], p2[2] + d2[2])
    return [p0, p1, p2, p3]


def _synthetic_hand(curls):
    pts = [(0.0, -1.0, 0.0)] + [(0.0, 0.0, 0.0)] * 20
    for f in ORDER:
        for idx, p in zip(FINGERS[f], _synthetic_finger(curls[f] * MAX_TOTAL_BEND / 2)):
            pts[idx] = p
    return pts


def selftest():
    import tempfile

    ok = True

    def check(name, cond):
        nonlocal ok
        print(("  ok  " if cond else "  FAIL ") + name)
        ok = ok and cond

    # 1. curl math matches the TypeScript tests (0, 0.5, 1)
    for target in (0.0, 0.5, 1.0):
        got = finger_curl(*_synthetic_finger(target * MAX_TOTAL_BEND / 2))
        check(f"curl {target} round-trips", abs(got - target) < 1e-6)

    # 2. end-to-end: write a dataset-shaped CSV, load it, recover the medians
    truth = {
        37: dict(thumb=0.85, index=1, middle=1, ring=1, pinky=1),  # a fist
        38: dict(thumb=0.85, index=0, middle=1, ring=1, pinky=1),  # index up
    }
    with tempfile.TemporaryDirectory() as d:
        with open(os.path.join(d, "user1.csv"), "w", newline="") as fh:
            w = csv.writer(fh)
            w.writerow(["name"] + [f"{a}{i:02d}" for i in range(21) for a in "xyz"] + ["label"])
            for label, c in truth.items():
                for k in range(5):
                    pts = _synthetic_hand(c)
                    flat = [v for p in pts for v in p]
                    w.writerow([f"{label}_{k}.jpg"] + flat + [label])
        per, files = load(d, labels_0_9=False)
        summary = summarise(per)
        check("reads the file", files == 1)
        check("finds both digits with 5 samples each", summary.get(0, {}).get("n") == 5 and summary.get(1, {}).get("n") == 5)
        check(
            "recovers medians",
            all(abs(summary[i]["median"][f] - truth[37 + i][f]) < 1e-6 for i in (0, 1) for f in ORDER),
        )
        check("flags no confusable pair for distinct signs", confusable(summary) == [])
        near = {0: dict(truth[37]), 1: dict(truth[37], index=0.8)}
        fake = {i: {"n": 1, "median": near[i], "iqr": {f: 0 for f in ORDER}} for i in (0, 1)}
        check("flags confusable pair", len(confusable(fake)) == 1)

    print("\nself-test", "passed" if ok else "FAILED")
    return 0 if ok else 1


def main(argv):
    if "--selftest" in argv:
        return selftest()
    args = [a for a in argv if not a.startswith("--")]
    if not args:
        print(__doc__)
        return 2
    per, files = load(args[0], "--labels-0-9" in argv)
    summary = summarise(per)
    if not summary:
        print(f"No digit rows found in {files} CSV file(s) under {args[0]}.")
        print("Check the folder, or pass --labels-0-9 if the digit labels are 0..9 instead of 37..46.")
        return 1
    print(f"Read {files} CSV file(s).\n")
    report(summary)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
