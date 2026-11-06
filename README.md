# SignBloom 🌸🤟

**Learn Bangla number signs with your hands — every sign you master blooms into a piece of alpona.**

A Snap **SPECS** Lens built for the *Learn AR with SPECS* hackathon.

SignBloom turns learning sign language into making art. A target hand shape is shown as five finger gauges. You copy it with your own hand, hold it for a second, and the sign "takes": a ring of petals blooms in front of you, interlocking with the rings from earlier signs. Master all seven signs and you unlock **Alpona Air** — pinch and draw in mid-air, and every stroke is mirrored eight ways into a symmetric alpona.

alpona (আল্পনা) is the traditional Bengali floor art drawn for celebrations. Sign language is a language many hearing people never get a chance to learn. SignBloom connects the two: practising becomes decorating.

## How it works

```
 tracked hand ──► finger curls ──► match vs. target ──► hold 1 s ──► sign learned
                  (0 = straight,    (tolerant to hand    (forgiving     │
                   1 = curled)       size & rotation)     of slips)     ▼
                                                              petal ring blooms
                                                                        │
                                                    all signs learned ──► Alpona Air
```

- **Hand → curls.** Each finger is reduced to one number from its joint bend angles, so matching works for any hand size and distance.
- **Smoothing + forgiving hold.** Tracking jitter is smoothed, and a brief slip drains progress slowly instead of resetting it.
- **Coaching.** When you're close, the Lens names the finger to fix ("Try to straighten your ring finger").
- **Alpona geometry.** Each learned sign adds a ring with more petals than the last (8, 12, 16, …), offset by half a petal so rings interlock. Alpona Air applies 8-fold rotational + mirror symmetry to your stroke.
- **Demo mode.** A scripted virtual hand drives the whole experience so it can be previewed and recorded in the Lens Studio preview without a headset.

## Repository layout

| Path | What it is |
|---|---|
| `Assets/Scripts/core/` | Pure TypeScript logic (hand math, sign library, lesson state machine, alpona geometry). No engine dependencies. **Unit-tested.** |
| `Assets/Scripts/lens/` | Thin Lens Studio components that connect the core to the scene (SIK hand input, simulated hand, petal renderer, painter, controller). |
| `tests/` | 21 tests covering matching, symmetry and the full lesson flow. |
| `docs/SETUP.md` | Step-by-step: open in Lens Studio, build the scene, wire the Inspector, preview. |
| `devpost/` | Planning docs, submission text, video script and final checklist. |

## Run the tests (no Lens Studio needed)

```bash
npm install
npm test
```

## Run the Lens

See [`docs/SETUP.md`](docs/SETUP.md). In short: create a SPECS project in Lens Studio, copy `Assets/Scripts` in, build the small scene described there, set **Demo Mode** on, and press Preview.

## The sign set

Seven starter signs, chosen because they can be recognised reliably from finger curl alone:

শূন্য (0) · এক (1) · দুই (2) · তিন (3) · চার (4) · পাঁচ (5) · ভালো (good)

> **Note for real-world use:** number-sign variants differ by region and community. This starter set should be reviewed by a Bangla Sign Language (BdSL) educator before it is used for teaching. Adding a sign is a single entry in `core/SignLibrary.ts`.

## Built with

- Lens Studio + Spectacles Interaction Kit (hand tracking)
- TypeScript
- AI-assisted development with Claude (code and documentation drafted with an AI coding assistant, as permitted by the hackathon rules)

## License

MIT — see [LICENSE](LICENSE).
