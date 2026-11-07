# SignBloom — Plan (one page)

> **TODO (Shahariar):** run the Devpost Learn skill pack for SPECS in your coding agent and save its generated planning documents next to this file. This page is hand-written.

**Problem.** About 70M deaf people use 300+ sign languages; hearing people rarely learn one because practice gives no feedback.
**Idea.** Copy a sign → it blooms into a floral pattern (inspired by Bengali alpona) → finish and draw your own.
**For.** Hearing family, teachers and classmates of Deaf and hard-of-hearing people, anywhere.

**Scope (finished, not sprawling).** two sign packs (ASL default, Bangla starter) of static one-handed signs · learn loop · reward painting · Bangla/English · accessible preset · demo mode for recording.

**Out of scope.** Motion signs, two-handed signs, full alphabet (see `docs/ROADMAP.md`).

**Biggest risk.** The starter signs are unreviewed. Mitigation: `tools/derive_curls.py` builds Bangla targets from the open BdSL47 data; signer/educator review is the next step.

**Build log**
- [x] Core logic, 49 tests, Lens type-check, CI
- [ ] Scene built in Lens Studio and previewed end to end
- [ ] Planning docs from the Devpost Learn skill pack added here
- [ ] Demo video recorded and submission sent
