import neuromath from '../galaxies/neuromath/index.js';
import activa from '../galaxies/activa-tu-idea/index.js';
import comunicarte from '../galaxies/comunicarte/index.js';
import voxcivitas from '../galaxies/voxcivitas/index.js';
import latidosocial from '../galaxies/latidosocial/index.js';
import gerencia from '../galaxies/gerencia/index.js';

// Every galaxy with a built path, and the one the player is exploring.
export var GALAXY_DEFS = [neuromath, activa, comunicarte, latidosocial, voxcivitas, gerencia];
var current = neuromath;

export function galaxy(){ return current; }
export function setGalaxy(id){ current = getGalaxy(id) || current; }
export function getGalaxy(id){ return GALAXY_DEFS.find(function(g){ return g.id === id; }); }

var ALL_ISLANDS = [];
GALAXY_DEFS.forEach(function(g){ ALL_ISLANDS = ALL_ISLANDS.concat(g.islands); });
export function allIslands(){ return ALL_ISLANDS; }

export function getPlanet(id){
  for(var i = 0; i < GALAXY_DEFS.length; i++){
    var p = GALAXY_DEFS[i].planets.find(function(pl){ return pl.id === id; });
    if(p) return p;
  }
  return null;
}
export function islandsOf(planetId){ return ALL_ISLANDS.filter(function(i){ return i.planet.id === planetId; }); }
