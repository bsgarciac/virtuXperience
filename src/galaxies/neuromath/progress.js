import { NODES, LEVELS } from './data.js';

/* ================= STATE ================= */
var STORAGE_KEY = 'neuromath_atlas_progress_v1';
var state = { completed: {} };
(function loadState(){
  try{
    var raw = localStorage.getItem(STORAGE_KEY);
    if(raw){ var parsed = JSON.parse(raw); if(parsed && parsed.completed) state.completed = parsed.completed; }
  }catch(e){ /* storage unavailable — proceed with in-memory defaults */ }
})();
function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){ /* ignore */ }
}
export function isDone(nodeId){ return !!state.completed[nodeId]; }
export function isUnlocked(index){ return index === 0 || isDone(NODES[index-1].id); }
export function markDone(nodeId, score){
  state.completed[nodeId] = { score: score, at: Date.now() };
  saveState();
}
export function resetState(){
  state.completed = {};
  saveState();
}
export function topicFullyDone(topicId){
  return LEVELS.every(function(lv){ return isDone(topicId + '-' + lv.id); });
}
export function allDone(){ return NODES.every(function(n){ return isDone(n.id); }); }
