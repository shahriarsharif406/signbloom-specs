# SignBloom 🌸

**Hold a sign. Grow a bloom.**

A Snap SPECS Lens that teaches sign language by making art. Every handshape you get right grows into an interlocking floral pattern, inspired by Bengali *alpona* folk art.

> ⏱ **Short on time?** Read the [60-second judge guide](docs/JUDGES.md).

**Why it matters.** About 70 million deaf people use 300+ sign languages (World Federation of the Deaf). Most hearing people never learn one, because practice gives no feedback.

## How it works

1. **Copy** the hand shape shown by five finger gauges.
2. **Hold** it for a second — petals bloom.
3. **Finish** the set, then draw your own symmetric bloom in mid-air.

## Any sign language

The engine is language-agnostic: a **sign pack** is just a list of handshapes. It ships with **ASL** numbers and handshapes (default) and a **Bangla** numerals starter, and a pack can be derived from open data — `tools/derive_curls.py` turns the BdSL47 dataset into Bangla Sign Language targets.

## Why it's more than a demo

- **Finger-curl matching** — each finger becomes one 0–1 number, so it works for any hand size and rotation. Tests prove no sign in any pack is mistaken for another.
- **One tested state machine** — welcome → learn → summary → paint is pure TypeScript with 49 tests and CI.
- **Inclusive and private** — English + Bangla UI, an accessible mode, no network; progress stays on the device.

## Run it

```bash
npm install && npm run check   # 49 tests + Lens type-check
```

Build the scene in Lens Studio with [`docs/SETUP.md`](docs/SETUP.md); Demo Mode plays the full run in the preview.

## Honest limits

Static one-handed signs only. Both packs are starter sets that a signer or educator should review before real teaching. The Lens scene glue is type-checked against local stubs and must be confirmed in Lens Studio.

## Built with

Lens Studio · Spectacles Interaction Kit · TypeScript · AI-assisted development with Claude (permitted by the hackathon rules) · MIT license
