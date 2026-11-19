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
                              random helpers, host messaging (only when embedded)
    guides.js                 Luma, the narrative guide
    dialogue.js               the guides' one-line-at-a-time conversation box (typed out)
    fx.js                     game feel: synthesized sounds (🔊 in the HUD mutes them),
                              confetti, Células flying to the wallet, hyperspace jump
    a11y.js                   accessibility panel (Aa in the HUD, Alt + A): text size,
                              contrast, easy-reading font, spacing, calm motion, voice
    infographic.js            renders a lesson as an infographic (cards,
                              steps, formula, ✗/✓, Luma's tip; $math$ via KaTeX)
    markdown.js               Markdown + KaTeX (still accepted for a lesson)
    game/shell.js             mini-game frame: overlay, pips, banner, hint,
                              feedback card, final stars card
    game/scene-kit.js         Phaser pieces every game reuses (backdrop, rover,
                              particles, driving, celebration)
  atlas/                      the map engine, shared by every galaxy
    define.js                 galaxy content → planets × levels = islands
    world.js                  the galaxies with a built path; the current one
    progress.js               completed islands, Células Lógicas, badges
                              (localStorage)
    story.js                  each galaxy's intro and per-island briefings
    hud.js                    Índice de Equilibrio, Células, info, reset
    nav.js                    the map's portholes: mini system (top left) and
                              galaxy (top right); clicking flies there
    islands.js                opening/finishing islands, rewards
    scene-common.js           starfield, rocket cursor, resize handling
    system-scene.js           Phaser scene: the sun and the orbiting planets
    island-scene.js           Phaser scene: one planet's path of islands
  home/
    home.js                   the home page, the first screen: hero, story, how to
                              play, the six galaxies, Luma, live accessibility, the
                              black hole and a closing call; "Inicio" brings it back
    hero.js                   its animated universe (one canvas): galaxies orbiting
                              the black hole under the Neblina Gris
  galaxies/
    catalog.js                the galaxies shown on the select screen
    galaxy-art.js             procedural spiral-galaxy SVG for each card
    starfield.js              canvas backdrop: stars flying towards you
    select.js                 galaxy select screen
    vortex.js                 the black hole of Interferencia Estática at its centre,
                              its corridors and Luma's panel (Hacks + VirtuXperience video)
    neuromath/
      index.js                planets, games, intro and briefings
      recursos.js             each planet's path: old-site resources + games
      lessons/                the topic lesson shown when each island opens
                              (one infographic object per island)
      games/bridge/           "Puente de operaciones"
        levels.js             exercise bank: 20 abysses in 5 tiers
        math.js               evaluation (right and left-to-right) + steps
        feedback.js           works out where the mistake is + card text
        controller.js         tiles, drag & drop, panel, flow
        scene.js              Phaser scene: abyss, planks, rover, effects
      games/cannon/           "Cañón parabólico", same layout
    activa-tu-idea/
      index.js                its planets, the three walk-game comets, intro
      recursos.js             each planet's path: old-site resources + games
      lessons/                lesson for each island
      games/alianzas/         the Distrito Cristalino's islands (one game)
        content.js            entities, needs, call steps, decision cards,
                              and ISLANDS: each island's phases, gems, lines
        sprites.js            cuts the Sintonizador's poses out of the sheet
        scene.js              Phaser scene: the walkable district, the Nodo
        controller.js         the four phases, panel, flow
    comunicarte/              ComunicArte (resource islands, see below)
      index.js                galaxy definition, built from content.js
      content.js              planets and their resources (Genially/YouTube
                              URL, optional goal, hint, recap)
      lessons/                lesson for the islands that have one
    latidosocial/             LatidoSocial, same layout as comunicarte/
    gerencia/                 Gerencia+, same layout as comunicarte/
    voxcivitas/               VoxCivitas, same layout as comunicarte/
        controller.js         the embed in the stage, "Terminé", final card
public/assets/                images served as-is (art, Luma's portrait, entity logos)
```

## Home page

The first screen (`src/home/`), in front of the galaxy select. One page that
scrolls over an animated universe: the six galaxies circle the black hole of
Interferencia Estática, all grey under the Neblina Gris. The player's light
(the pointer, or a wandering light on touch screens) clears the fog and
brings back the colour around it. Scrolling restores more and more of it,
until the closing call shows the whole universe in colour. Galaxies already
restored keep their colour.

The sections, in order:

- **Hero:** the title revealed word by word.
- **Story:** lit word by word with the scroll.
- **How a galaxy is restored:** isla, meteoro and cometa, with counts read
  from the galaxy definitions.
- **Galaxy cards:** each one jumps straight into its galaxy; so does
  clicking a galaxy in the sky.
- **Luma:** her lines typed out.
- **Accessibility:** the settings, working live.
- **The black hole:** its Hacks and the VirtuXperience video.
- **"Comenzar el viaje":** fades into the galaxy select. Its "Inicio" button
  brings the home page back.

Reduce motion gives a still sky with every text shown.

## Galaxias → planetas → nodos

A galaxy is an area (Neuromath, Activa tu idea, ComunicArte, LatidoSocial,
VoxCivitas, Gerencia+). Entering it shows a solar system: its hack as the
sun (the *Matriz Lógica*, the *Nanocatalizador Creativo*, the *Holófono
Cuántico*, the *Pulsar Social*, the *Gafas de Realidad Social*, the
*Brújula de Gestión Ágil*) and one planet per
subarea, which the player can visit in any order. A planet holds a path of
**nodes**, numbered in a suggested order: jumping past an unfinished one asks
first.

Each node is one of three kinds, drawn differently on the path
(`atlas/island-scene.js`) and paying different **Células Lógicas** the first
time it's restored:

| Kind | Holds | Drawn as | Células |
|---|---|---|---|
| Isla | a YouTube video | a floating island | 20 |
| Meteoro | a Genially | a burning rock with a flame trail and embers | 50 |
| Cometa | one of our games | an icy nucleus with a glowing coma and two tails | 100 |

Comets are our mini-games: in Neuromath the challenge opens on the stage
(Puente de operaciones, Cañón parabólico); in Activa tu idea you land and
**walk** the Sintonizador to the Nodo first. Islands and meteors play an
embedded resource (see below). Activa tu idea adds the Células picked up
while walking; some comets also award an Open Badge. The HUD shows the
wallet and the current galaxy's *Índice de Equilibrio* (nodes restored).

## Activa tu idea · Distrito Cristalino

Content and art come from the team's prototype proposal (AI-generated
mockups, adapted). The planet has three islands — **Instituciones**
(Inicial), **Cómo montar un emprendimiento** (Intermedio) and **la
Estrategia** (Avanzado, with the *Tejedor de Alianzas* badge) — and on each
one the player walks and jumps across the district (← → / A D, ↑ / W to
jump, touch buttons on phones) and picks up six Células. Luma explains each
one as it's picked up: on Instituciones they are the entities the player
will sort next; on the others, the key terms of the topic. A force field
seals the corrupted Nodo until all of them are in, then E / Espacio
activates it. Luma frames the problem, the lesson follows, and the island's
phases run (Instituciones: Mapa de Actores and Directorio de Contactos;
Cómo montar…: Ruta de Convocatorias; Estrategia: Lienzo de Decisión):
**Mapa de Actores** (drag the
entities' cards onto a radar of three orbits drawn over the stage),
**Directorio de Contactos** (drag a contact card onto each need's socket;
wrong ones get a clue about the kind of entity, never the answer), **Ruta de Convocatorias** (drag six steps into a column; on
"Postular" the application walks down it, lighting each step green, and stops
in red at the first misplaced one with the proposal's feedback) and **Lienzo de
Decisión** (three strategies, only one clears the fog). Each phase blends the
Nodo's art from corrupted to purified.

The Sintonizador's poses are keyed out of a JPG sheet at load time
(`sprites.js`); with transparent PNGs that file can go. Open the game with
`?debug` in the URL to see the platforms' physics bodies.

## Migrated resources

Islands and meteors bring over the old VirtuXperience site
(uniminuto.edu/virtuxperience-home), which has one hub page per galaxy
(`uniminuto.edu/virtual-<hub>`) with articles that each wrap one Genially
or YouTube embed. The article pages can't be framed
(`X-Frame-Options: SAMEORIGIN`), so each node embeds the Genially/YouTube
URL directly, through the shared game in `src/shared/game/recurso.js`.
We can't see inside the embed, so the node is restored when the player
presses **Terminé**; the final card has no stars.

| Galaxy | Old hub | Planets (nodes) |
|---|---|---|
| Neuromath | logico-matematico | Cálculo (10), Fundamentos (9), Álgebra (11), Estadística (7), Desafíomente (9), IA y Matemáticas (5) |
| Activa tu idea | proyectos-e-investigacion | Distrito Cristalino (16), Investigación (8) |
| ComunicArte | habilidades-comunicativas | Escritura (15), Oralidad (12), Lectura (15), Multilingüismo (5) |
| LatidoSocial | misionales | Responsabilidad Social (13), FEBIPE (5), Liderazgo Social (5) |
| VoxCivitas | voxcivitas | Competencias Ciudadanas (10), Aprendizaje Autónomo (15), Proyecto de Vida (14) |
| Gerencia+ | habilidades-gerenciales | Liderazgo Gerencial (16), Metodologías Ágiles (8), Marketing (7), Talento Humano (7) |

Planets are the old hub's sections (plus Neuromath's original four). Each
planet lists its own nodes (`planet.islands` in `atlas/define.js`): the
resources in `content.js` (or `recursos.js` in Neuromath and Activa, where
an entry with only a key is one of our games, keeping its old
`<planet>-<level>` id). Node ids are `<planet>-<key>`, so a path can be
reordered without losing progress, but keys must never change. Nodes with a
lesson (so far only ComunicArte's *Acentuación de hiatos y diptongos*) show
it before the resource. To add a galaxy this way, copy `latidosocial/` and
fill its `content.js` from the old hub. Every hub is migrated; a few old
articles were left out because they only link a PDF or embed another
article's resource (see the top of each `content.js`/`recursos.js`).

## Accesibilidad

The **Aa** button (in the HUD and on the galaxy select screen) or **Alt + A**
opens a panel whose settings are remembered in the browser (`vx_a11y`) and
applied as classes on `<html>` (`styles/a11y.css`):

- **Tamaño del texto**: four steps, applied with CSS `zoom` to the DOM panels
  only (HUD, dialogue, game shell top and bottom, lesson, results). Never to
  a Phaser canvas or an embedded resource, so pointer input is unaffected.
- **Alto contraste**: black panels with white borders and brighter text.
- **Letra de lectura fácil**: Atkinson Hyperlegible, loaded only when turned on.
- **Más espacio entre líneas**: line, letter and word spacing.
- **Reducir movimiento**: follows the system setting until the player picks
  one. It drives `fx.reducedMotion()`: no warp, confetti, flying Células,
  typewriter, camera intros, dives or shake, and CSS animations are cut.
- **Luma lee en voz alta**: Web Speech API (a Spanish voice) reads dialogue
  lines, hints and results; hidden when the browser can't speak.

The map is a canvas, so its labels (planet names, node names, the sun's Hack)
read the same settings through `mapLabel()` in `atlas/scene-common.js`: up to
1.3× bigger, the easy font, more letter spacing, and a bright outlined colour
in high contrast. Node names wrap to stay on screen. Changing a setting
redraws the map, as a resize does. New readable text on the map should use
`mapLabel()`.

Keyboard focus is always visible. New overlays with readable text should be
added to the zoom list in `styles/a11y.css`.

## Modo desarrollador

Open the site with `?dev=<code>` to get a small bar of shortcuts (complete
the open island, skip the walk, win the current phase); `?dev=off` turns it
off. The code is in `.dev-code` (git-ignored, never published); the source
only has its SHA-256 (`src/shared/dev.js`). It keeps the shortcuts out of
students' way, but it is not security: the flag lives in localStorage. To
change the code, write a new one to `.dev-code` and put
`printf '%s' "$(cat .dev-code)" | shasum -a 256` into `CODE_SHA256`.

## Narrativa (BIOSA)

The player is the *Sintonizador*. On a planet, the **Neblina Gris** covers
every island past the first unfinished one; it drifts, its edge creeps
forward, and it rolls back when an island is restored. In the solar system
it drains the planets' colour, which comes back island by island. Inside a game the stage
starts grey and regains its colour exercise by exercise.
**Luma** (blue, drawn as the crystal fox) is the only guide: she tells the
story, gives the hints and the closing recap, and says why the island matters. The intro plays the first time the
player enters Neuromath (📜 Historia replays it), and each island has a
short briefing the first time it is opened.

At the centre of the galaxy select screen sits a **black hole of
Interferencia Estática**, the source of the Neblina Gris (our addition to the
team's deck). Its accretion disk pulls in the colour of the six galaxies
along their **Corredores Cuánticos**. A galaxy's colour shows in the disk
and its corridor as its nodes are restored; when the whole galaxy is
restored its **Hack de Sintonía** is stable: its ring lights up around the
hole, its corridor flows back out, and the hole shrinks and calms. Clicking
it opens Luma's explanation, the six Hacks with their progress and the
official VirtuXperience video. With all six Hacks the hole is meant to
collapse into the **Estación Micelio** (still to build).

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

Each island opens with a short lesson on its topic before the game starts
(📖 Tema reopens it). It's an infographic — a title with a big icon and a
few visual blocks with very little text — written as an object in
`lessons/<island-id>.js` (block types in `shared/infographic.js`) and
registered in the galaxy's lessons; formulas go between `$…$`.

A new mini-game goes in `galaxies/<galaxy>/games/<name>/`, builds its panel
with `createShell` (shared/game/shell.js), mixes `SceneKit` into its Phaser
scene, exposes `open(island, onFinish)` and is registered with a title in that
galaxy's `islands.js`.

## Deploying

VirtuXperience is the main site: a static build that owns the whole
viewport and opens on the home page. Every push to `main` deploys `dist/` to
GitHub Pages. Asset URLs are relative, so it can also be served from any
sub-path or a custom domain. Progress lives in the site's own
`localStorage`.

### Embedding (optional)

It can still be embedded with an `<iframe>`. Inside one, it reports progress
to the host page with `postMessage`; standalone, `shared/host.js` does
nothing. Every message has `source: 'virtuxperience'`:

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
