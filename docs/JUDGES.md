# SignBloom — 60-second judge guide

**In one sentence:** a SPECS Lens where copying a Bangla hand sign makes a piece of alpona bloom in front of you.

**Why it matters:** most hearing people never learn sign language because practice gives no feedback. SignBloom gives instant, language-free feedback and makes practice feel like making art.

## Watch (video, under 3 min)
Hook: the bloom → one sign with live coaching → all rings interlocking → draw your own alpona.

## Where the depth is

| Look at | What you'll find |
|---|---|
| `core/HandPose.ts` | Joints → one **curl** value per finger; match score tolerant of hand size and rotation |
| `core/Session.ts` | The whole experience as one state machine, engine-free |
| `core/Symmetry.ts` | The geometry that makes rings interlock and strokes mirror |
| `tools/derive_curls.py` | Derives sign targets from real BdSL47 data (same math as the Lens) |

## Verify in 10 seconds

```bash
npm install && npm run check
```

46 tests, plus a type-check of the Lens scripts.

## Judging criteria, one line each

- **Design** — one complete loop: target → copy → hold → bloom → reward.
- **Technical** — tested core, thin Lens layer, real-data tooling.
- **Innovation** — learning a language by making cultural art.
- **Presentation** — the video shows it end to end in the Lens Studio preview.

## Limits (stated plainly)

Static one-handed signs only; starter set needs educator review; Lens glue confirmed in Lens Studio, core confirmed by tests.
