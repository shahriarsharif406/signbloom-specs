# Roadmap

## Done (this hackathon)
- [x] Finger-curl hand matching with standard and relaxed tolerance
- [x] Learn mode, quiz mode, stars / XP / streaks, on-device progress
- [x] Bangla + English UI, accessible preset
- [x] Bloom animation, Alpona Air (4/6/8/12-fold, 7 brushes, undo/clear)
- [x] Demo mode for recording in the Lens Studio preview
- [x] 46 unit tests, Lens type-check, CI

## Next
0. **Real BdSL targets:** run `tools/derive_curls.py` on BdSL47 (10 digits ০–৯) and replace the starter set.
1. **Educator review** of the sign set with Bangla Sign Language educators and Deaf learners; adopt their corrections as the source of truth.
2. **Expanded curriculum:** alphabet (বর্ণমালা), greetings, family words, in levels with unlock progression.
3. **Ghost hand:** a rigged 3D hand that demonstrates each sign in front of the learner.
4. **Motion signs:** sequence recognition (dynamic time warping over fingertip trajectories) for signs that move.
5. **Two-handed signs** and non-manual markers (face/head).
6. **Spaced repetition:** resurface weak signs using the per-sign star history already stored.
7. **Classroom mode:** a teacher picks the sign set; shared bloom across a class.
8. **Share:** export the finished alpona as an image/clip.
9. **More regional art:** rangoli, kolam, mehndi as alternative bloom themes.

## Not planned
Collecting user data, accounts, or any network dependency.
