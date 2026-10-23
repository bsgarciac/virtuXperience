---
name: add-minigame
description: Scaffold and register a new mini-game for a VirtuXperience island (controller + Phaser scene + content, wired to createShell and SceneKit). Use when asked to build a new game, challenge or "reto" for an island.
---

# Add a mini-game

Read an existing game first and copy its shape. `neuromath/games/cannon/` is
the cleanest example of a shell-based game; `activa-tu-idea/games/alianzas/`
is the walkable, multi-phase one.

## Files — `src/galaxies/<galaxy>/games/<name>/`

| file | what goes in it |
|---|---|
| `levels.js` or `content.js` | the exercise bank / content data, plus `pickRound()` and canned Luma `hint`s |
| `math.js` | pure logic (no DOM, no Phaser) so `scripts/` can import it under Node |
| `feedback.js` | works out *what* went wrong and builds the feedback card; never reveals the answer |
| `scene.js` | Phaser scene; `Object.assign` it with `SceneKit` (`shared/game/scene-kit.js`) |
| `controller.js` | `createShell({...})`, DOM, flow; exports `open<Name>(island, onFinish)` |

Add `src/styles/<name>.css` and import it where the other game styles are
imported (see `src/main.js`). Use the tokens from `base.css`.

## Contract

- `open<Name>(island, onFinish)` opens the shell with
  `shell.open(island.planet.name + ' · Isla ' + island.level.label, close)`.
- When the player wins, the final card's continue calls
  `onFinish(fails, close)` — `fails` is the score (failed tries; stars come
  from `starsFor` in shell.js).
- The stage starts grey (Neblina Gris) and regains colour per exercise.
- Optional: dev shortcuts ("win this phase") via `setDevActions`
  (`shared/dev.js`), as `alianzas/controller.js` does. "Completar isla"
  already works for every game.

## Register it

In the galaxy's `index.js`:

```js
import { openName } from './games/<name>/controller.js';
games: {
  '<island-id>': { title: 'Título en español', open: openName, cells: 100 }
  // optional: badge: { id: 'kebab-id', name: 'Nombre del badge' }
},
briefings: { '<island-id>': [ { who: 'luma', text: '…' }, { who: 'luma', text: '…' } ] }
```

Also add the island's lesson (see the `add-lesson` skill).

## If it has an exercise bank

Write `scripts/check-<name>.js` modelled on `scripts/check-bridge.js`
(every exercise solvable, the rule the tier teaches actually matters, exit
code 1 on failure) and append it to `check:levels` in `package.json`.

## Finish

`npm run build`, `npm run check:levels`, play it through in `npm run dev`
(desktop and phone width), then document the game in README.md (layout tree
+ a section on how it plays). Ask the `narrative-reviewer` agent to check
the Spanish copy.
