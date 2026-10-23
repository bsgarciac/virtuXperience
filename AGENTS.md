# AGENTS.md

Guidance for coding agents (Claude Code, Codex, Cursor…) working on
VirtuXperience. README.md is the full reference; this file is the short
version plus the rules that aren't obvious from the code.

## What this is

Learning galaxies as mini-games for university students. Plain JavaScript
(ES modules) + Phaser 3 for canvas scenes, bundled with Vite. **No framework,
no TypeScript, no test runner.** Deployed to GitHub Pages on every push to
`main` (`.github/workflows/deploy.yml`) and embedded by a host site in an
`<iframe>`.

Hierarchy: **galaxy** (area) → **planet** (subarea) → **island**
(`<planet>-<level>`, one challenge each). Built galaxies: `neuromath`
(src/galaxies/neuromath) and `activa` — "Activa tu idea"
(src/galaxies/activa-tu-idea).

## Commands

```bash
npm run dev           # http://localhost:5173
npm run build         # must pass before you call a change done
npm run check:levels  # validates the bridge and cannon exercise banks
```

There are no unit tests. Verify by building, running `check:levels` when you
touch a level bank or its math, and playing the change in the browser.
`?dev=<code>` (code in the git-ignored `.dev-code`) shows shortcuts to finish
islands/phases; `?debug` shows Phaser physics bodies in Activa tu idea.

## Where things go

- `src/atlas/` — the map engine, shared by every galaxy. Galaxy-specific
  logic does not belong here.
- `src/galaxies/<galaxy>/index.js` — the galaxy's `defineGalaxy({...})`:
  planets, levels, `games`, `lessons`, `intro`, `briefings`.
- `src/galaxies/<galaxy>/games/<game>/` — one mini-game. Usual split:
  `levels.js`/`content.js` (data), `math.js` (pure logic), `feedback.js`,
  `controller.js` (DOM + flow, exports `open<Game>(island, onFinish)`),
  `scene.js` (Phaser scene that mixes in `SceneKit`).
- `src/galaxies/<galaxy>/lessons/<island-id>.js` — the lesson shown when
  the island opens: an infographic object (big icons, cards, steps, very
  little text) rendered by `shared/infographic.js`.
- `src/shared/` — cross-game UI: `game/shell.js` (`createShell`),
  `game/scene-kit.js`, `dialogue.js`, `guides.js`, `infographic.js`,
  `toast.js`, `confirm.js`…
- `src/styles/` — one CSS file per area; design tokens live in `base.css`.
- `public/assets/` — images served as-is; reference them with relative paths
  (`assets/...`), never `/assets/...` (the build runs from a sub-path).

## Code style

Match the existing code, which is deliberately old-school:

- `var` and `function(){}` callbacks, not `const`/arrow functions.
- Named exports; a galaxy's `index.js` default-exports its definition.
- Short comment at the top of each file saying what it is and why; comments
  explain intent, not syntax.
- DOM built with HTML strings and `querySelector`, no templating library.
- Keep pure logic (math, validation, feedback) out of the Phaser scene so
  `scripts/check-*.js` can import it under Node.

## Language and narrative

- **Everything the player sees is in Spanish** (neutral Latin American,
  `tú`). Code, comments, commit messages and README are in English.
- The story is **BIOSA**: the player is the *Sintonizador*; the **Neblina
  Gris** greys things out and solving islands restores colour. One guide:
  **Luma** (blue, the crystal fox) — explains mechanics, gives hints and says
  why it matters to people. There is no second guide (the gold one and the
  name "Aura" were dropped). Currency: **Células
  Lógicas**. Challenges: **Nodos de Pregunta**. Use these terms; don't invent
  new ones.
- Feedback cards point at the mistake and the rule behind it but **never give
  the answer** outright.
- `shared/ai.js` is a simulated assistant: canned hints, no live model calls.

## Rules

- Never commit `.dev-code` or print its contents; only its SHA-256 lives in
  `src/shared/dev.js`.
- Progress lives in the iframe's `localStorage` (`atlas/progress.js`). Don't
  rename keys without a migration — students would lose progress.
- Host messages (`shared/host.js`) always carry `source: 'virtuxperience'`;
  the `ready` / `node-completed` / `progress-reset` contract is public, so
  don't change it silently.
- Planet ids must be unique across galaxies (island ids derive from them).
- Pushing to `main` deploys to production. Don't push unless asked.
- Commits: imperative, sentence-case subject describing the player-visible
  change (see `git log`). No AI attribution lines.
- Update README.md when you add a galaxy, game, or change how one plays.
