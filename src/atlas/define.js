// Turns a galaxy's content into the shape the atlas works with: each planet
// (a subarea) gets one island per level, and each island knows its galaxy,
// planet, level, lesson and game. Island ids are '<planet>-<level>', so
// planet ids must be unique across galaxies.
//
// def: { id, name, emblem, sun: { label, glyph }, planets: [{ id, name, glyph,
// color, tag }], levels: [{ id, label }], games: { islandId: { title, open,
// cells } }, lessons: { islandId: markdown }, intro: [dialogue lines],
// briefings: { islandId: [dialogue lines] } }
export function defineGalaxy(def){
  def.islands = [];
  def.planets.forEach(function(planet){
    planet.galaxy = def;
    def.levels.forEach(function(level, li){
      var id = planet.id + '-' + level.id;
      def.islands.push({
        id: id, galaxy: def, planet: planet, level: level, levelIndex: li,
        lesson: (def.lessons || {})[id] || null, // Markdown, shown when it opens
        isLastOfPlanet: li === def.levels.length - 1
      });
    });
  });
  return def;
}
