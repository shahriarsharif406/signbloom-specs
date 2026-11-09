---
status: approved
---

# Design brief: SignBloom

*Hold a sign. Grow a bloom.*

## The one spatial moment
I raise my right hand. A card in front of me shows a target sign, like the letter A. Five thin gauges, one per finger, fill up as my fingers match the sign. When all five are full and I hold still for a moment, a ring of glowing petals inspired by Bengali alpona patterns blooms around my hand with a soft chime, and the card turns into a flower badge. After a few signs I unlock Alpona Air: I move my hands in the air and a mirrored, symmetric alpona pattern grows around me, like a living rangoli.

## Why it belongs on glasses
- Uses: draws in the world (gauges and bloom sit on my real hand), leaves your body free (hands are the input, eyes stay up).
- Why it's better than the phone or laptop version: feedback appears on the hand that is making the sign, so I can see my fingers and the result together. Alpona Air is drawn in the space around me with my hands, which a flat screen can't do.

## Product or overlay
- Type: product. The lesson, scoring and bloom are the experience.
- What the real version would sense: finger curl for each finger from Spectacles hand tracking. This is only expected to work on device and has not been tested on real glasses.
- Stand-in for the preview: Demo Mode, a simulated hand source. A scripted hand pose curls each finger over time (a simple keyboard or slider control is the fallback), so the gauges fill and the bloom triggers through the same logic real tracking would use. The preview must be clearly labeled as simulated, and the Demo Mode switch must be obvious in the scene.

## Where things live
- Where the user is looking during the main task: at my signing hand and the petal ring, with the card in peripheral view.
- Sign card: about 0.6 m in front of me, slightly left of center, at chest height, about 25 cm wide, so it never blocks the hand.
- Five finger gauges: thin vertical bars, about 1 cm wide and 6 cm tall, attached next to the hand and following it, one per finger.
- Petal ring: blooms around the hand at its real position, roughly 20 to 25 cm across, and faces the user.
- Alpona Air pattern: drawn 0.5 to 0.7 m in front of me, filling a space about 60 cm wide at eye-to-chest height, mirrored left and right across a vertical center line.
- Buttons (Next, ASL and Bangla pack chips, Start Alpona Air, End, Clear): large, near the sign card, away from the signing hand. Exact size (default): at least 6 cm per target.

## Hands and input
- Move to the next sign: pinch a big Next button.
- Choose the sign pack: pinch the ASL or Bangla chip. ASL is the default pack, and the Bangla starter pack is included.
- Start Alpona Air: pinch Start Alpona Air, which appears after a set is finished.
- Draw in Alpona Air: pinch input or a simulated pointer, with mirrored symmetry across the center line.
- Stop drawing: pinch End to return to the lessons.
- Clear the pattern: pinch Clear.
- Targets are big and highlight when aimed at.
- Voice: none.
- In Demo Mode in the preview, the same pinch buttons are used with the mouse, and a Demo Mode switch plays the simulated hand.

## When things show
- Sign card: always visible during a lesson, in the periphery.
- Gauges and petal ring: show only when my hand is raised and tracked, and fade out softly when I lower it.
- Next, pack and Clear buttons: always visible but dim while I'm signing, and light up when my hand is lowered.
- Start Alpona Air: shows only after a set is finished.
- While I'm holding a sign, nothing else changes. There are no pop-ups.
- If something needs attention out of view, such as a finished set or a new unlock: the card softly pulses and a short chime plays. The message waits on the card until I look at it, and it never interrupts the sign I'm holding.

## Done criteria
Each one can be checked in Lens Studio's preview, with Demo Mode on.
1. In Demo Mode, the five gauges fill one by one as the simulated hand curls its fingers, and each gauge stays empty when its finger does not match the sign.
2. When all five gauges are full and the sign is held for about a second, the petal ring blooms around the hand, the chime plays, and the card turns into a flower badge.
3. If the hand drops out or the sign breaks before the hold finishes, the bloom does not trigger and the gauges fall back.
4. Pinching Next moves to the next sign, and pinching the ASL or Bangla chip switches the sign pack and updates the card.
5. After finishing a set, Start Alpona Air appears. Pressing it lets me draw in the preview, and the drawing is mirrored left and right across the center line. Clear wipes it.

## Out of scope
- Recognizing signs from camera frames or computer vision.
- Remembering progress between sessions.
- Two people sharing a Lens.
- Recording, identifying, or following anyone.
- Voice commands.

## Risks and open questions
- The real hand source reads finger curl from Spectacles hand tracking. It is expected to work on device only and is untested on real glasses. The preview must label itself as simulated, and the real tracking is "feel unproven".
- Two-hand tracking for Alpona Air can't be shown in the preview. The preview version uses pinch or a simulated pointer.
- The 1 cm wide gauges may be hard to read at about 0.5 m, so check readability in the preview and widen them if needed.
- The accuracy of the sign matching against real hands is unknown until it is tried on glasses.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
