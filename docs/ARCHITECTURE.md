# Architecture

SignBloom is split into two layers on purpose.

```
Assets/Scripts/
├── core/   pure TypeScript — no Lens Studio types, fully unit-tested
└── lens/   thin adapters — read the hand, render the snapshot
```

**Rule of thumb:** if it is a decision, it lives in `core/`. If it touches a `SceneObject`, it lives in `lens/`.

## Core modules

| Module | Responsibility |
|---|---|
| `HandPose` | Joint positions → one **curl** value per finger (0 straight … 1 curled); pose matching with selectable tolerance; smoothing |
| `SignLibrary` · `Packs` | Language-neutral signs (label, target curls, hints) grouped into **sign packs** — ASL (default) and a Bangla starter; ids are namespaced and tests enforce uniqueness and mutual distinctness per pack |
| `Lesson` | Practice → blooming → next state machine; hold timer that drains slowly on slips; per-sign stats (time, mean accuracy); presets `standard` / `demo` / `accessible` |
| `Scoring` | Stars from accuracy and pace; XP and streak (`ScoreKeeper`) |
| `Session` | The whole experience: welcome → learn / quiz → summary → paint; owns the Lesson, ScoreKeeper and progress saving |
| `Progress` | Defensive, versioned persistence behind a tiny `KeyValueStore` interface |
| `PaintSession` | Alpona Air logic: spacing, dot budget, symmetric points, per-stroke undo |
| `Symmetry` | Dihedral-symmetry geometry for the bloom rings and free drawing |
| `Strings` | English + Bangla UI strings and finger names; tests enforce key and placeholder parity |
| `Theme` | Design tokens (palette, hex → RGBA) |
| `Rng` | Seeded shuffle, so quiz order is reproducible |

## Lens modules

| Module | Responsibility |
|---|---|
| `SignBloomController` | Single entry point. Each frame: read hand → `Session.update` → render text, gauges, bloom, painter. Exposes button hooks |
| `SIKHandSource` | Real hand via Spectacles Interaction Kit → finger curls, fingertip, pinch |
| `SimulatedHandSource` | Scripted virtual hand for preview and demo recording |
| `BloomRenderer` | Spawns/animates petals, auto-builds the colour palette, idle breathing |
| `FreeAlponaPainter` | Scene objects for Alpona Air; mirrors the `PaintSession` stroke stack |
| `AudioFeedback` | Optional sound cues |
| `LensPersistentStore` | `KeyValueStore` backed by Lens Studio storage |
| `ColorUtil` | Theme colours → materials/text |

## Tools

`tools/derive_curls.py` computes curls from BdSL47 keypoints with the same formula as `HandPose.ts` (self-tested), so sign targets can come from real data instead of guesses.

## Why finger curl?

Raw joint distances change with hand size, camera distance and rotation. Reducing each finger to one bend-based number makes matching tolerant of all three, easy to explain to a learner ("curl your ring finger"), and trivially testable with synthetic hands. The trade-off — it cannot represent motion or fine finger positions — is listed in the [roadmap](ROADMAP.md).

## Data flow per frame

```
HandSource.getCurls()  ─►  Session.update(dt, curls)  ─►  SessionSnapshot
                                                              │
        ┌──────────────────────┬──────────────────────┬───────┴────────┐
        ▼                      ▼                      ▼                ▼
   renderText            renderGauges           renderBloom     renderPainter
```

## Testing strategy

- `npm test` — 49 tests over `core/`, including synthetic-hand round trips, "no sign is mistaken for another" (standard *and* relaxed tolerance), full lesson/session lifecycles, persistence corruption handling and Bangla/English string parity.
- `npm run typecheck:lens` — compiles `lens/` against `types/lens-studio.d.ts`. These stubs are hand-written approximations, so this catches typos and logic slips but cannot prove the real Lens Studio API matches; Lens Studio is the final check.
- CI runs both on every push.

## Privacy

No network calls, accounts or analytics. Progress is stored on the device only (`LensPersistentStore`), and demo runs use throw-away in-memory storage.
