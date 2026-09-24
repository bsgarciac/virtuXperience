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
    game/shell.js             mini-game frame: overlay, pips, banner, hint,
                              feedback card, final stars card
    game/scene-kit.js         Phaser pieces every game reuses (backdrop, rover,
                              particles, driving, celebration)
  galaxies/
    catalog.js                the galaxies shown on the select screen
    select.js                 galaxy select screen
    neuromath/
      data.js                 topics × levels = the planets (NODES)
      progress.js             completed planets (localStorage)
      hud.js                  progress bar, info popover, reset
      planets.js              which planets have a game, opening/finishing them
      map-scene.js            Phaser scene: the winding path of planets
      games/bridge/           "Puente de operaciones"
        levels.js             exercise bank: 20 abysses in 5 tiers
        math.js               evaluation (right and left-to-right) + steps
        feedback.js           works out where the mistake is + card text
        controller.js         tiles, drag & drop, panel, flow
        scene.js              Phaser scene: abyss, planks, rover, effects
      games/cannon/           "Cañón parabólico", same layout
```

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
scene, exposes `open(node, onFinish)` and is registered with a title in that
galaxy's `planets.js`.

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
| `node-completed`  | `nodeId`, `score` (failed tries)| a planet's game was finished  |
| `progress-reset`  | —                               | the player reset progress     |

```js
window.addEventListener('message', function(e){
  if(!e.data || e.data.source !== 'virtuxperience') return;
  // check e.origin against where you host the game
});
```

Progress is also kept in the iframe's own `localStorage` for now.
