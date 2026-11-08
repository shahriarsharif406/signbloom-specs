# Final submission checklist

Deadline: **Nov 9, 2026, 5:00 pm ET = Nov 10, 4:00 am Bangladesh time.** No edits after it. Aim to submit by **Nov 9, 6:00 pm Bangladesh time**.

## How you are judged (from the Official Rules)

1. **Stage One — pass/fail.** The project must *reasonably apply* the required tools (Devpost Learn skill pack → CLAD → Lens Studio → Lens Studio MCP) and meet the requirements. Fail this and nothing else counts.
2. **Stage Two — four equal criteria:** Design · Technical Implementation (incl. how well CLAD / Lens Studio / MCP were used) · Innovation · Presentation. Ties are broken by **Design** first.
3. Judges may judge from the video, text and images alone, and the process may include automated AI analysis — so the README and description must be clear on their own.

## Stage One gate (do these first)

- [ ] Install the skill pack: `npx skills add challengepost/learn-specs --all -y`
- [ ] In your coding agent say **"Run the plan-lens skill"**; answer using `devpost/plan-lens-answers.md`
- [ ] Commit what it writes into `devpost/` (design brief). Optional by the rules, but it is your proof
- [ ] Open Lens Studio (5.23.2 if 5.24 sign-in fails), enable CLAD + Lens Studio MCP, and let the CLAD agent build the scene from the brief, using `Assets/Scripts`
- [ ] **Lens Studio project files committed** (Assets, `.esproj`, scene) — the repo currently has scripts only
- [ ] The Lens runs in **Lens Studio preview** with no errors (Demo Mode)

## Truthful disclosure (required: "disclose any other pre-existing code or work")

- [ ] Say that the scripts in `Assets/Scripts/core` and `lens` were written with Claude (an AI coding assistant) during Oct 15 – Nov 9, and say exactly what CLAD built
- [ ] Standard tools used: Lens Studio, Spectacles Interaction Kit, TypeScript
- [ ] BdSL47 (CC BY 4.0): only mention it if you actually ran `tools/derive_curls.py`; then cite it
- [ ] Nothing is claimed that did not happen

## Video (under 3:00, public on YouTube)

- [ ] Screen recording of the **Lens Studio preview** showing it working end to end
- [ ] Optional but encouraged: a few seconds of the plan-lens brief and CLAD building
- [ ] No third-party logos (no Snap/Spectacles branding), no copyrighted music
- [ ] English narration or English captions

## Form

- [ ] Name, tagline, description from `submission-text.md` (fill the tooling paragraph and the disclosure)
- [ ] Public repo URL: https://github.com/shahriarsharif406/signbloom-specs
- [ ] YouTube link
- [ ] Press **Submit** (a draft is not a submission), then reopen the page and test every link
