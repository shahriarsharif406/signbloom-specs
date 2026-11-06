# SignBloom — Project Plan

> Status: hand-written planning notes.
> **TODO (Shahariar):** run the Devpost Learn skill pack for SPECS in your coding agent and save its generated planning documents in this folder next to this file. The rules welcome them (not required) and the video may show them.

## Problem
Sign language is a language most hearing people never learn, and practice tools are either flat video lessons or feedback-free. Learners can't tell whether their hand shape is right.

## Who it's for
Hearing family members, teachers and classmates of Deaf and hard-of-hearing people in Bangladesh and the Bangla-speaking world — starting with number signs.

## Idea
Make practice rewarding and visual. Every sign you get right blooms into a ring of *alpona*, the traditional Bengali floor art. Finishing the set unlocks free, symmetric mid-air drawing.

## Judging criteria → how SignBloom answers them

| Criterion | Our answer |
|---|---|
| **Design** | One complete loop: target → copy → hold → bloom → next sign → reward mode. Finger gauges give instant, language-free feedback; a coach line names the finger to fix. |
| **Technical Implementation** | Pose matching on finger curl (size/rotation tolerant), smoothing + forgiving hold, state-machine lesson, dihedral-symmetry alpona geometry. Core logic is pure TypeScript with 21 unit tests; thin Lens Studio components on top. |
| **Innovation / Idea** | Learning-as-making: sign practice produces cultural art. Alpona is rarely seen in AR. |
| **Presentation** | Under 3 minutes: problem (15 s) → live demo of the full loop (100 s) → how it was built (35 s) → why it matters (20 s). See `video-script.md`. |

## Scope (deliberately small, finished)
- 7 signs, finger-curl based.
- 1 learning loop + 1 reward mode.
- Demo mode so everything is recordable in the Lens Studio preview.

## Out of scope for the hackathon
- Full Bangla Sign Language alphabet and motion-based signs (need sequence recognition).
- Two-handed signs, facial grammar.
- Educator-reviewed curriculum (flagged in README).

## Build log (fill in as you go)
- [ ] Core logic + tests — done (see `tests/`)
- [ ] Scene built in Lens Studio
- [ ] Preview run end-to-end in demo mode
- [ ] Planning docs from the Devpost Learn skill pack added here
- [ ] Demo video recorded
