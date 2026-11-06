# Devpost submission text (paste into the form)

## Project name
SignBloom

## Tagline
Learn Bangla number signs with your hands — every sign you master blooms into alpona.

## Inspiration
Millions of people live alongside Deaf family members or classmates and never learn their language, partly because practice is dull and gives no feedback. Meanwhile alpona — the Bengali floor art drawn at celebrations — is all about repetition and symmetry. We asked: what if practising signs *made* alpona?

## What it does
SignBloom is a Lens for SPECS. A target hand shape is shown as five finger gauges and a Bangla/romanised label. You copy the shape with your own hand and hold it for a second. When it takes, a ring of petals blooms in front of you, interlocking with rings from earlier signs. Master all seven starter signs (শূন্য, এক, দুই, তিন, চার, পাঁচ, ভালো) and you unlock **Alpona Air**: pinch and draw in mid-air, and your stroke is mirrored eight ways into a symmetric alpona.

## How we built it
- **Hand → finger curls:** each finger is reduced to a 0–1 curl value from its joint bend angles, so matching tolerates different hand sizes, distances and rotations.
- **Lesson state machine:** smoothing against tracking jitter, a hold timer that drains slowly on slips, and a coach line that names the finger to fix.
- **Alpona geometry:** each learned sign adds a ring with more petals than the last, offset by half a petal so rings interlock; free drawing applies 8-fold rotational and mirror symmetry.
- **Architecture:** all logic is pure, dependency-free TypeScript with 21 unit tests (matching, symmetry, full lesson flow). Thin Lens Studio components connect it to the scene via Spectacles Interaction Kit. A scripted virtual hand ("demo mode") drives the whole experience so it can be previewed and recorded in the Lens Studio preview.
- **Tooling:** [TODO — describe truthfully how you used CLAD, Lens Studio and the Lens Studio MCP, and the Devpost Learn skill pack. Judges score this.] Code and documentation were drafted with an AI coding assistant (Claude).

## Challenges
Making hand-shape matching forgiving enough to feel good but strict enough that no sign is mistaken for another (a test checks that all 7 signs are mutually distinct). Keeping the experience finishable and recordable in a preview without a headset.

## Accomplishments
A complete, end-to-end loop — learn, reward, create — rather than a tech demo, plus a tested core that can grow into a real curriculum.

## What we learned
Reducing a hand to a few robust features beats chasing raw joint precision for a learning tool; and a cultural art form can be a surprisingly good game-feel layer for education.

## What's next
Educator-reviewed Bangla Sign Language curriculum, motion-based signs (sequence recognition), two-handed signs, a ghost-hand model that demonstrates each sign, and a classroom mode.

## Built with
Lens Studio, Spectacles Interaction Kit, TypeScript, Claude (AI-assisted development)

## Links
- Code: https://github.com/shahriarsharif406/signbloom-specs
- Video: [paste YouTube link]
