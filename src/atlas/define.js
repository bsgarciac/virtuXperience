// Turns a galaxy's content into the shape the atlas works with: each planet
// (a subarea) gets one island per level, and each island knows its galaxy,
// planet, level, lesson and game. Island ids are '<planet>-<level>', so
// planet ids must be unique across galaxies.
//
// A planet can bring its own list of islands instead of the galaxy's levels
// (planet.islands: [{ id, label }], e.g. ComunicArte, one island per
// resource). Their ids name the island's content, not its position, so the
// list can be reordered without losing anyone's progress.
//
// def: { id, name, emblem, sun: { label, glyph }, planets: [{ id, name, glyph,
// color, tag, islands? }], levels: [{ id, label }], games: { islandId: { title, open,
// cells } }, lessons: { islandId: infographic (shared/infographic.js) }, intro: [dialogue lines],
// briefings: { islandId: [dialogue lines] } }
export function defineGalaxy(def){
  def.islands = [];
  def.planets.forEach(function(planet){
    planet.galaxy = def;
    var levels = planet.islands || def.levels;
    levels.forEach(function(level, li){
      var id = planet.id + '-' + level.id;
      def.islands.push({
        id: id, galaxy: def, planet: planet, level: level, levelIndex: li,
        lesson: (def.lessons || {})[id] || null, // shown when it opens
        isLastOfPlanet: li === levels.length - 1
      });
    });
  });
  return def;
}
