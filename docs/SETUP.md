# Setup: build the SignBloom scene in Lens Studio

The code is complete; the scene objects (text, bars, a petal shape) are small and are created in Lens Studio's editor. This takes about 20–30 minutes.

> Script component names and Inspector fields below match the code in `Assets/Scripts/lens/`. If Lens Studio shows a compile error, copy the message to Claude — the logic in `core/` is already tested, so fixes are usually small.

## 1. Project

1. Lens Studio → **New Project** → pick a **Spectacles** template (one that includes Spectacles Interaction Kit).
2. Copy the `Assets/Scripts` folder from this repo into the project's **Assets** panel.
3. Confirm **Spectacles Interaction Kit** is in the project (Asset Library → install if missing). `SIKHandSource.ts` imports `SpectaclesInteractionKit.lspkg/SIK`.

## 2. Scene objects

Create this hierarchy under the camera-facing content area (about 60–80 cm in front of the user):

```
SignBloom
├── UI
│   ├── SignBangla      (Text, large)
│   ├── SignRoman       (Text, medium)
│   ├── HintText        (Text, small)
│   └── ProgressText    (Text, small)
├── Gauges
│   ├── TargetBars      5 thin Box meshes in a row  (thumb, index, middle, ring, pinky)
│   └── LiveBars        5 thin Box meshes in a row beside the target bars
├── HoldIndicator       (a flat Circle mesh; the script scales it 0 → 1)
├── BloomRoot           (empty SceneObject — petals are created under it)
└── PaintRoot           (empty SceneObject at the same position as BloomRoot)
```

Tips: colour the target bars warm gold and the live bars teal so the match reads at a glance; keep Text materials high-contrast (white on dark) for the SPECS display.

## 3. Prefabs

- **Petal prefab:** a single flat petal (a stretched Circle or Plane mesh works for a first version), pointing up (+Y), roughly 2 units tall. Right-click → *Save as Prefab*.
- **Dot prefab:** a tiny Circle/Sphere, ~0.3 units. Save as prefab.

## 4. Attach the scripts

| Script | Attach to | Inspector fields |
|---|---|---|
| `BloomRenderer` | `BloomRoot` | Petal Prefab, Bloom Root (itself), Palette (optional, 5–7 materials in warm alpona colours), Size Scale = 1 |
| `FreeAlponaPainter` | `PaintRoot` | Dot Prefab, Paint Root (itself), Folds = 8, Spacing = 0.6, Max Dots = 1500 |
| `SignBloomController` | `SignBloom` (root) | Sign Bangla / Roman / Hint / Progress texts, Target Bars ×5, Live Bars ×5, Hold Indicator, Bloom → BloomRoot, Painter → PaintRoot, **Demo Mode = ✔** |

Bar order everywhere is **thumb, index, middle, ring, pinky**.

**Bangla text:** use a font that supports Bengali script (e.g. Noto Sans Bengali) on the `SignBangla` Text component, otherwise the characters will not render.

**Optional Skip / Restart buttons:** add two SIK `PinchButton`s and, in their `onTriggerUp` event, call `SignBloomController.skipSign()` and `SignBloomController.restart()` (Script Events). Handy for the demo video.

## 5. Preview

1. Press **Preview**. With Demo Mode on, a virtual hand performs each sign: the live bars chase the target bars, the hold ring fills, a ring of petals blooms, and the next sign appears. After the 7th sign the Alpona Air spiral paints itself.
2. For the demo video, this is the recording to capture (see `devpost/video-script.md`).

## 6. On a real hand (optional, outside the preview)

Set **Demo Mode** off. `SIKHandSource` reads joints from SIK. If a joint property name differs in your SIK version, edit only the `JOINTS` table at the top of `SIKHandSource.ts`.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Bangla text shows boxes | Assign a Bengali-capable font to the Text component |
| Nothing blooms | Check **Petal Prefab** and **Bloom Root** are assigned on `BloomRenderer`, and `Bloom` is assigned on the controller |
| Petals are huge/tiny | Adjust **Size Scale** on `BloomRenderer` |
| Sign never "takes" in demo | Make sure Demo Mode is on and all 5 + 5 bars are assigned |
| Import error for `SIK` | Install Spectacles Interaction Kit from the Asset Library |
