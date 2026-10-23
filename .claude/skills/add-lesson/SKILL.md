---
name: add-lesson
description: Add or edit the short topic lesson shown when a VirtuXperience island opens (an infographic: icons, cards, steps, KaTeX). Use when asked to write, change or register a lesson ("lección", "tema") for an island.
---

# Add a lesson to an island

A lesson is a one-screen **infographic** shown before the island's game
starts (📖 Tema reopens it): a title with a big icon and a few visual blocks
with very little text — "for dummies", not paragraphs. It's a plain object
rendered by `src/shared/infographic.js`, which documents the block types:
`cards`, `steps`, `formula`, `compare` (✗ vs ✓) and `tip` (Luma's note).

## Steps

1. Find the island id: `<planet-id>-<level-id>`, e.g. `fund-inicial`,
   `dc-inicial`. Planets and levels are in `src/galaxies/<galaxy>/index.js`.
2. Write `src/galaxies/<galaxy>/lessons/<island-id>.js` exporting
   `{ icon, title, lead, blocks: [...] }`. Copy the shape of
   `neuromath/lessons/fund-inicial.js` (steps + compare + tip) or
   `activa-tu-idea/lessons/dc-inicial.js` (cards + steps + tip).
3. Register it:
   - **Neuromath:** import it in `src/galaxies/neuromath/lessons/index.js`
     and add it to `LESSONS`.
   - **Other galaxies:** import it in the galaxy's `index.js` and add it to
     `lessons: { '<island-id>': ... }`.
4. `npm run build`, then open the island in `npm run dev` and look at it on
   a phone-width window too: it should fit on one screen without much
   scrolling.

## Writing rules

- Spanish, `tú`, for university students checking their foundations.
- Very short: `lead` is one sentence; each card or step is a title plus one
  line. Two to four blocks, ending with a `tip` that ties the topic to what
  the player does on this island.
- Prefer an icon, a number or a ✗/✓ example over a sentence.
- Math between `$…$` (escape backslashes in JS strings: `'$3 \\times 2$'`).
  Use `\\times`, not `*`.
- Teach the rule the game checks — no more. Don't give away the game's
  exercises.
