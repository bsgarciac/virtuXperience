import { ISLANDS, islandsOf } from './data.js';

/* ================= STATE ================= */
// v1 stored one record per planet; in v2 those planets became islands and
// the cannon moved from Fundamentos to Álgebra, so its record moves with it.
export var MOVED_IDS = { 'fund-intermedio': 'alg-intermedio' };
var STORAGE_KEY = 'neuromath_atlas_progress_v2';
var OLD_STORAGE_KEY = 'neuromath_atlas_progress_v1';
var state = { completed: {} };
(function loadState(){
  try{
    var raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      var parsed = JSON.parse(raw);
      if(parsed && parsed.completed) state.completed = parsed.completed;
      return;
    }
    var old = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY) || 'null');
    if(old && old.completed){
      Object.keys(old.completed).forEach(function(id){ state.completed[MOVED_IDS[id] || id] = old.completed[id]; });
      saveState();
    }
  }catch(e){ /* storage unavailable — proceed with in-memory defaults */ }
})();
function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){ /* ignore */ }
}
export function isDone(islandId){ return !!state.completed[islandId]; }
export function markDone(islandId, score){
  state.completed[islandId] = { score: score, at: Date.now() };
  saveState();
}
export function resetState(){
  state.completed = {};
  saveState();
}
export function doneCount(planetId){
  return islandsOf(planetId).filter(function(i){ return isDone(i.id); }).length;
}
export function planetFullyDone(planetId){
  return islandsOf(planetId).every(function(i){ return isDone(i.id); });
}
export function allDone(){ return ISLANDS.every(function(i){ return isDone(i.id); }); }
