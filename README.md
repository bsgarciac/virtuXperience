# VirtuXperience

Learning galaxies as mini-games, aimed at university students who want to
check their foundations. Only **Neuromath** (math) is built so far, with two
playable planets: *Fundamentos · Inicial* — **Puente de operaciones** — and
*Fundamentos · Intermedio* — **Cañón parabólico**.

Plain JavaScript + [Phaser 3](https://phaser.io) for the canvas scenes, bundled
with Vite. No framework.

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/
npm run preview   # serve dist/ locally
npm run check:levels  # validate every game's exercise bank
```

## Layout

```
index.html                    markup (HUD, overlays, bridge game shell)
src/
  main.js                     entry: styles, galaxy select, boots the map
  styles/                     CSS split by area; tokens live in base.css
  shared/                     toast, tooltip, confirm dialog, AI hint bubbles,
                              random helpers, host (iframe) messaging
    guides.js                 Luma and Aura, the two narrative guides
    dialogue.js               the guides' one-line-at-a-time conversation box
    game/shell.js             mini-game frame: overlay, pips, banner, hint,
                              feedback card, final stars card
    game/scene-kit.js         Phaser pieces every game reuses (backdrop, rover,
                              particles, driving, celebration)
  galaxies/
    catalog.js                the galaxies shown on the select screen
    galaxy-art.js             procedural spiral-galaxy SVG for each card
    select.js                 galaxy select screen
    neuromath/
      data.js                 planets (subareas) × levels = the islands
      progress.js             completed islands (localStorage)
      story.js                intro and per-island briefings (BIOSA narrative)
      hud.js                  progress bar, info popover, reset
      islands.js              which islands have a game, opening/finishing them
      scene-common.js         starfield, rocket cursor, resize handling
      system-scene.js         Phaser scene: the sun and the orbiting planets
      island-scene.js         Phaser scene: one planet's path of islands
      games/bridge/           "Puente de operaciones"
        levels.js             exercise bank: 20 abysses in 5 tiers
        math.js               evaluation (right and left-to-right) + steps
        feedback.js           works out where the mistake is + card text
        controller.js         tiles, drag & drop, panel, flow
        scene.js              Phaser scene: abyss, planks, rover, effects
      games/cannon/           "Cañón parabólico", same layout
```

## Galaxias → planetas → islas

A galaxy is an area (Neuromath). Entering it shows a solar system: the
*Matriz Lógica* as the sun and one planet per subarea (Cálculo, Fundamentos
de matemáticas, Álgebra, Estadística), which the player can visit in any
order. A planet holds islands, one challenge each (Inicial, Intermedio,
Avanzado). Inside a planet the islands suggest an order: jumping past an
unfinished built island asks first; unbuilt islands don't block.

## Narrativa (BIOSA)

The player is the *Sintonizador*. On a planet, the **Neblina Gris** covers
every island past the first unfinished one; it drifts, its edge creeps
forward, and it rolls back when an island is restored. In the solar system
it drains the planets' colour, which comes back island by island. Inside a game the stage
starts grey and regains its colour exercise by exercise.
**Aura** (blue, logic) gives the hints and the closing recap; **Luma** (gold,
ethics) says why the island matters. The intro plays the first time the
player enters Neuromath (📜 Historia replays it), and each island has a
short briefing the first time it is opened.

## Puente de operaciones

Each play is a round of 5 abysses, one per difficulty tier (× before +,
× before −, four numbers, parentheses, parentheses with four numbers), drawn
from a bank of 20 in `levels.js`, so replaying brings different exercises.
`npm run check:levels` checks every abyss has a solution and that the rule its
tier teaches actually matters for it.

After each build, the feedback card under the expression explains the result:
- **Order mistake:** the tiles would give the target if read left to right,
  so the card replays that calculation and shows why × goes first.
- **Parentheses mistake:** same idea when the tiles only work without the
  parentheses.
- **Otherwise:** the tiles that differ from the closest correct arrangement
  get a red border, and the card notes when × changed the result.

Every step is listed with the rule that made it go first.

## Cañón parabólico

A wall with a crack blocks the rover. The shot follows
`f(x) = a·x² + b·x + c` from the cannon at the origin; the player sets the
parameters each wall allows with − / + steppers (the rest are fixed) and fires.
Hitting the crack brings the wall down and the rover drives on.

Rounds are 5 walls, one per tier, from a bank of 20: **Pendiente** (b, the
launch slope f'(0)), **Apertura** (a), **Vértice** (a and b — the crack only
gives way to a horizontal hit, f'(w) = 0), **Mástil** (c, the cannon's height)
and **Roca** (a and b, clearing a rock on the way).

The feedback card says what happened (landed at a root, hit the wall above or
below the crack, cleared the wall, hit the rock, hit the crack at an angle),
which parameter to move and which way, and why, with the calculation as
numbered steps. It never gives the value. The previous shot's trail stays on
the plane, dimmed, for comparison.

A new mini-game goes in `galaxies/<galaxy>/games/<name>/`, builds its panel
with `createShell` (shared/game/shell.js), mixes `SceneKit` into its Phaser
scene, exposes `open(island, onFinish)` and is registered with a title in that
galaxy's `islands.js`.

## Embedding

The build is a static site meant to be embedded with an `<iframe>` (it assumes
it owns the whole viewport). Asset URLs are relative, so `dist/` can be served
from any sub-path.

```html
<iframe src="https://your-host/virtuxperience/" style="width:100%;height:100vh;border:0" allow="fullscreen"></iframe>
```

The game reports to the host page with `postMessage`; every message has
`source: 'virtuxperience'`:

| `type`            | payload                         | when                          |
|-------------------|---------------------------------|-------------------------------|
| `ready`           | —                               | the map has booted            |
| `node-completed`  | `nodeId`, `score` (failed tries)| an island's game was finished |
| `progress-reset`  | —                               | the player reset progress     |

```js
window.addEventListener('message', function(e){
  if(!e.data || e.data.source !== 'virtuxperience') return;
  // check e.origin against where you host the game
});
```

Progress is also kept in the iframe's own `localStorage` for now.
