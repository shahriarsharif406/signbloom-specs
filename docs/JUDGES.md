# SignBloom — 60-second judge guide

**In one sentence:** a SPECS Lens where copying a sign-language handshape makes a floral pattern bloom in front of you.

**Why it matters:** about 70 million deaf people use 300+ sign languages (World Federation of the Deaf), yet most hearing people never learn one — practice gives no feedback. SignBloom gives instant, language-free feedback and makes practice feel like making art.

## Watch (video, under 3 min)
Hook: the bloom → one sign with live coaching → all rings interlocking → draw your own pattern.

## Where the depth is

| Look at | What you'll find |
|---|---|
| `core/HandPose.ts` | Joints → one **curl** value per finger; match score tolerant of hand size and rotation |
| `core/Packs.ts` | Language-agnostic sign packs (ASL default, Bangla starter) |
| `core/Session.ts` | The whole experience as one engine-free state machine |
| `core/Symmetry.ts` | Geometry that makes rings interlock and strokes mirror |
| `tools/derive_curls.py` | Builds a pack from open BdSL47 data (same math as the Lens) |

## Verify in 10 seconds

```bash
npm install && npm run check
```

49 tests, plus a type-check of the Lens scripts.

## Judging criteria, one line each

- **Design** — one complete loop: target → copy → hold → bloom → reward.
- **Technical** — tested core, thin Lens layer, real-data tooling.
- **Innovation** — learning a language by growing cultural art, for any sign language.
- **Presentation** — the video shows it end to end in the Lens Studio preview.

## Limits (stated plainly)

Static one-handed signs only; both packs are starter sets needing signer/educator review; Lens glue confirmed in Lens Studio, core confirmed by tests.
