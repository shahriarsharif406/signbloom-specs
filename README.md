# SignBloom 🌸

**Hold a sign. Grow an alpona.**

A Snap SPECS Lens that teaches Bangla number signs. Every sign you get right blooms into a piece of traditional alpona art.

> ⏱ **Short on time?** Read the [60-second judge guide](docs/JUDGES.md).

## How it works

1. **Copy** the hand shape shown by five finger gauges.
2. **Hold** it for a second — petals bloom.
3. **Finish** the set, then draw your own symmetric alpona in mid-air.

## Why it's more than a demo

- **Finger-curl matching** — each finger becomes one 0–1 number, so it works for any hand size and rotation. Tests prove no sign is mistaken for another.
- **One tested state machine** — the whole experience (welcome → learn → summary → paint) is pure TypeScript with 46 tests and CI.
- **Real data path** — sign targets can be derived from the open BdSL47 dataset with `tools/derive_curls.py`.
- **Bangla + English, an accessible mode, no network** — progress stays on the device.

## Run it

```bash
npm install && npm run check   # 46 tests + Lens type-check
```

Build the scene in Lens Studio with [`docs/SETUP.md`](docs/SETUP.md) (Demo Mode plays the full run in the preview).

## Honest limits

The starter signs are finger-count numerals and must be reviewed by a Bangla Sign Language educator (or replaced with BdSL47-derived targets) before real teaching. The Lens scene glue is type-checked against local stubs and must be confirmed in Lens Studio.

## Built with

Lens Studio · Spectacles Interaction Kit · TypeScript · AI-assisted development with Claude (permitted by the hackathon rules) · MIT license
