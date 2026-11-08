# Setup: build the SignBloom scene in Lens Studio

The code is complete; the scene objects (text, bars, a petal shape) are small and are created in Lens Studio's editor. This takes about 30 minutes.

> Component names and Inspector fields below match `Assets/Scripts/lens/`. The Lens scripts were type-checked against local stubs (`npm run typecheck:lens`) but not run inside Lens Studio — if you see a compile error there, copy the message to Claude; the logic in `core/` is already tested, so fixes are usually small.

## 1. Project

1. Lens Studio → **New Project** → a **Spectacles** template that includes Spectacles Interaction Kit (SIK).
2. Copy the `Assets/Scripts` folder from this repo into the project's **Assets** panel.
3. Confirm **SIK** is in the project (Asset Library → install if missing). `SIKHandSource.ts` imports `SpectaclesInteractionKit.lspkg/SIK`.

## 2. Scene objects

Create this hierarchy about 60–80 cm in front of the user:

```
SignBloom
├── UI
│   ├── SignLabel       (Text, large)
│   ├── SignSubtitle    (Text, medium)
│   ├── HintText        (Text, small)
│   ├── ProgressText    (Text, small)
│   ├── StreakText      (Text, small)        ← optional
│   └── StatsText       (Text, small)        ← optional
├── Gauges
│   ├── TargetBars      5 thin Box meshes in a row  (thumb, index, middle, ring, pinky)
│   └── LiveBars        5 thin Box meshes in a row beside the target bars
├── HoldIndicator       (a flat Circle mesh; the script scales it 0 → 1)   ← optional
├── BloomRoot           (empty SceneObject — petals are created under it)
└── PaintRoot           (empty SceneObject at the same position as BloomRoot)
```

Bar order everywhere is **thumb, index, middle, ring, pinky**. Colours are applied by the script from the theme, so you don't need to colour anything by hand — but each bar must have a mesh with a material.

**Keep the screen clean:** for judges and the video, leave the optional `StreakText` and `StatsText` empty — fewer words on screen reads faster.

**Bangla:** the Bangla pack and Bangla UI need a font that supports Bengali script (e.g. Noto Sans Bengali) on the Text components, otherwise the characters will not render.

## 3. Prefabs and materials

- **Petal prefab:** a single flat petal (a stretched Circle or Plane mesh is fine), pointing up (+Y), about 2 units tall. Right-click → *Save as Prefab*. Note its material.
- **Dot prefab:** a tiny Circle/Sphere, about 0.3 units. Save as prefab. Note its material.

Giving the scripts these two materials is what unlocks the 7-colour alpona palette automatically.

## 4. Attach the scripts

| Script | Attach to | Inspector fields |
|---|---|---|
| `BloomRenderer` | `BloomRoot` | Petal Prefab, Bloom Root (itself), **Petal Material** (the petal prefab's material), Size Scale = 1, Breathe ✔ |
| `FreeAlponaPainter` | `PaintRoot` | Dot Prefab, Paint Root (itself), **Dot Material**, Spacing = 0.6, Max Dots = 1500 |
| `AudioFeedback` *(optional)* | any object | Audio components for Learned / Star3 / Complete / Tap — leave empty for silence |
| `SignBloomController` | `SignBloom` (root) | Texts (Sign Label / Sign Subtitle / Hint / Progress, optional Streak / Stats), Target Bars ×5, Live Bars ×5, Hold Indicator, Bloom → BloomRoot, Painter → PaintRoot, Audio, **Demo Mode ✔**, Preset = *Demo* |

### Controller settings

| Field | Meaning |
|---|---|
| Demo Mode | Scripted virtual hand + throw-away storage. Turn **off** on a real device |
| Sign Pack | *American Sign Language* (default) or *Bangla numerals (starter)* |
| Preset | *Demo* (fast, for video) · *Standard* · *Accessible* (slower, forgiving) |
| Bangla Ui | Start in Bangla (also switchable at runtime) |
| Right Hand | Which hand to track on device |

## 5. Buttons (recommended)

Add SIK `PinchButton`s and, in each button's `onTriggerUp` Script Event, call a controller function:

| Button | Calls |
|---|---|
| Start | `begin` |
| Skip | `skipSign` |
| Quiz | `startQuiz` |
| Learn | `startLearn` |
| Language | `toggleLanguage` |
| Continue | `continueToPaint` |
| Undo / Clear | `paintUndo` / `paintClear` |
| Symmetry / Brush | `paintCycleSymmetry` / `paintCycleBrush` |
| Restart | `restart` |

None are required: with Demo Mode on, the experience runs by itself end-to-end (welcome → 7 signs → summary → Alpona Air).

## 6. Preview

Press **Preview**. A virtual hand performs each sign; the live bars chase the target bars and turn green on a match; the hold ring fills; petals bloom; after the 7th sign a summary (stars, XP, accuracy) shows for 4 s and Alpona Air paints a spiral in 8-fold symmetry. This is the run to record for the video — see `devpost/video-script.md`.

## 7. On a real hand (optional)

Set **Demo Mode** off and Preset to *Standard* or *Accessible*. `SIKHandSource` reads joints from SIK. If a joint property name differs in your SIK version, edit only the `JOINTS` table at the top of `SIKHandSource.ts`. Progress is then saved on the device.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Bangla text shows boxes | Assign a Bengali-capable font to each Text component (only needed for the Bangla pack/UI) |
| Nothing blooms | Check **Petal Prefab** and **Bloom Root** on `BloomRenderer`, and **Bloom** on the controller |
| Petals are all one colour | Assign **Petal Material** (and **Dot Material** for the painter) |
| Petals are huge/tiny | Adjust **Size Scale** on `BloomRenderer` |
| Stuck on the welcome screen | Demo Mode needs ~2 s; on device, show your hand or press Start (`begin`) |
| Sign never "takes" in demo | Make sure all 5 + 5 bars are assigned |
| Import error for `SIK` | Install Spectacles Interaction Kit from the Asset Library |

## Design notes for the SPECS display

- SPECS use a see-through display: **dark areas look transparent**. Give text a light plate or a light outline, and prefer bright, saturated colours.
- Keep panels few and small. Place the bloom in the world at arm's reach and real size, not as a screen floating in front of the face.
- Hands are both the input and the lesson, so keep the centre of view free.
