import { LESSONS } from './lessons/index.js';

// The Neuromath galaxy: a solar system of planets (the subareas), each one
// with its own chain of islands (the challenges), one per difficulty level.
export var PLANETS = [
  {id:'calc', name:'Cálculo',                    glyph:'∫', color:'#9b8cf2', tag:'El estudio del cambio y la acumulación'},
  {id:'fund', name:'Fundamentos de matemáticas', glyph:'±', color:'#e8b84b', tag:'Las bases de toda operación matemática'},
  {id:'alg',  name:'Álgebra',                    glyph:'x²',color:'#e2708f', tag:'El lenguaje de las incógnitas'},
  {id:'est',  name:'Estadística',                glyph:'μ', color:'#4fbf8b', tag:'El arte de leer los datos'}
];
export var LEVELS = [
  {id:'inicial',    label:'Inicial'},
  {id:'intermedio', label:'Intermedio'},
  {id:'avanzado',   label:'Avanzado'}
];

export var ISLANDS = [];
PLANETS.forEach(function(planet){
  LEVELS.forEach(function(level, li){
    ISLANDS.push({
      id: planet.id + '-' + level.id,
      planet: planet, level: level, levelIndex: li,
      lesson: LESSONS[planet.id + '-' + level.id] || null, // Markdown, shown when it opens
      isLastOfPlanet: li === LEVELS.length - 1
    });
  });
});

export function getPlanet(id){ return PLANETS.find(function(p){ return p.id === id; }); }
export function islandsOf(planetId){ return ISLANDS.filter(function(i){ return i.planet.id === planetId; }); }
