# VirtuXperience

Learning galaxies as mini-games. Only **Neuromath** (math) is built so far; its
first playable planet is *Fundamentos · Inicial* — **Puente de operaciones**.

Plain JavaScript + [Phaser 3](https://phaser.io) for the canvas scenes, bundled
with Vite. No framework.

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/
npm run preview   # serve dist/ locally
npm run check:levels  # validate the bridge exercise bank
```

## Layout

```
index.html                    markup (HUD, overlays, bridge game shell)
src/
  main.js                     entry: styles, galaxy select, boots the map
  styles/                     CSS split by area; tokens live in base.css
  shared/                     toast, tooltip, confirm dialog, AI hint bubbles,
                              random helpers, host (iframe) messaging
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

A new mini-game goes in `galaxies/<galaxy>/games/<name>/`, exposes
`open(node, onFinish)` and is registered in that galaxy's `planets.js`.

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
