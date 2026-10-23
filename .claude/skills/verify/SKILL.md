---
name: verify
description: Check a VirtuXperience change actually works — build, validate level banks, and play it in the browser with dev shortcuts. Use before saying a change is done, or when asked to test, verify or "probar" the app.
---

# Verify a change

1. `npm run build` — must succeed with no new warnings beyond the known
   Phaser chunk size.
2. `npm run check:levels` — required if a `levels.js`, `math.js` or
   `scripts/check-*.js` changed. Every line must be ✓.
3. Play it: `npm run dev` (background) and open
   `http://localhost:5173/?dev=<code>` — read the code from `.dev-code`
   yourself and **never print it in the chat or commit it**. The dev bar can
   complete an island, skip Activa tu idea's walk, or win the current phase,
   so you can reach the screen you changed quickly. Add `&debug` for physics
   bodies in Activa tu idea. `?dev=off` turns the bar off.
4. Look at it at desktop size and at ~390 px wide (touch controls, panel
   layout). Check the browser console for errors.
5. If progress state matters, reset it with the HUD reset button (or clear
   the `neuromath_atlas_progress_v2` localStorage key) and try a first visit:
   intro, briefing, lesson, game, rewards.

Report what you checked and what you couldn't (e.g. no browser available).
