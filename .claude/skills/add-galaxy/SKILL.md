---
name: add-galaxy
description: Turn a "próximamente" galaxy on the VirtuXperience select screen into a built one (definition, planets, intro, first island). Use when asked to add or enable a galaxy such as ComunicArte, LatidoSocial or VoxCivitas.
---

# Add a galaxy

1. **Definition** — `src/galaxies/<galaxy>/index.js` with
   `export default defineGalaxy({...})` (shape documented at the top of
   `src/atlas/define.js`). Copy `activa-tu-idea/index.js`:
   - `id` must match the entry in `src/galaxies/catalog.js`.
   - `sun`: the galaxy's Hack de Sintonía (e.g. Matriz Lógica, Nanocatalizador
     Creativo). Ask the user if unknown — don't invent BIOSA lore.
   - `planets`: ids **unique across all galaxies** (island ids derive from
     them), each with `name`, `glyph`, `color`, `tag`.
   - `levels`: usually `inicial` / `intermedio` / `avanzado`.
   - `intro`: 2–6 lines, all `who: 'luma'`, Spanish, may use `<b>`.
2. **Register** — import it in `src/atlas/world.js` and add it to
   `GALAXY_DEFS`.
3. **Enable** — set `enabled: true` and a real `sub` in `catalog.js`.
4. **First island** — at least one game (skill `add-minigame`) and its lesson
   (skill `add-lesson`); a galaxy with no playable island is pointless.
5. `npm run build`, walk it in `npm run dev` from the select screen, update
   README.md ("Galaxias → planetas → islas" and the layout tree).
