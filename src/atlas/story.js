import { showDialogue } from '../shared/dialogue.js';
import { MOVED_IDS } from './progress.js';

// Luma and Aura tell each galaxy's story (its def.intro and def.briefings):
// an intro the first time the player enters that galaxy, and a short
// briefing the first time each island is opened.

var STORAGE_KEY = 'atlas_story_v3';
var OLD_KEYS = ['neuromath_story_v2', 'neuromath_story_v1']; // Neuromath only, newest first
var seen = { intros: {}, briefings: {} };
(function load(){
  try{
    var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if(parsed){ seen.intros = parsed.intros || {}; seen.briefings = parsed.briefings || {}; return; }
    for(var k = 0; k < OLD_KEYS.length; k++){
      var old = JSON.parse(localStorage.getItem(OLD_KEYS[k]) || 'null');
      if(!old) continue;
      if(old.intro) seen.intros.neuromath = true;
      Object.keys(old.briefings || {}).forEach(function(id){ seen.briefings[MOVED_IDS[id] || id] = true; });
      save();
      return;
    }
  }catch(e){ /* storage unavailable — the story just shows again */ }
})();
function save(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(seen)); }catch(e){ /* ignore */ }
}

export function showIntro(galaxy, onDone){
  seen.intros[galaxy.id] = true;
  save();
  showDialogue(galaxy.intro, { eyebrow: 'Sector ' + galaxy.name + ' · Transmisión entrante', doneLabel: 'Comenzar misión', onDone: onDone });
}

export function showIntroOnce(galaxy, onDone){
  if(seen.intros[galaxy.id] || !galaxy.intro){ if(onDone) onDone(); return; }
  showIntro(galaxy, onDone);
}

// Runs onDone right away when the island has no briefing or it was already seen.
export function briefThenOpen(island, onDone){
  var lines = (island.galaxy.briefings || {})[island.id];
  if(!lines || seen.briefings[island.id]){ onDone(); return; }
  seen.briefings[island.id] = true;
  save();
  showDialogue(lines, { eyebrow: island.planet.name + ' · Isla ' + island.level.label, doneLabel: 'A la misión', onDone: onDone });
}

export function resetStory(){
  seen = { intros: {}, briefings: {} };
  save();
}
