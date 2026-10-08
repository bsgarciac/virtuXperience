import { showDialogue } from '../../shared/dialogue.js';
import { MOVED_IDS } from './progress.js';

// The BIOSA story as told in the Neuromath sector: the Neblina Gris spreads
// from planet to planet, and each island the player solves pushes it back.
// Luma and Aura tell it: an intro the first time the player enters, and a
// short briefing the first time each island is opened.

var INTRO = [
  { who: 'aura', text: 'Sintonizador, aquí Aura. Te hablo desde la <b>Matriz Lógica</b> del sector Neuromath. Tenemos un problema.' },
  { who: 'luma', text: 'Y yo soy Luma. Estos planetas brillaban: sus colonias se hacían preguntas y los números fluían entre ellas como luz.' },
  { who: 'aura', text: 'Pero empezaron a automatizarlo todo sin entenderlo. La Matriz se descalibró y apareció la <b>Neblina Gris</b>.' },
  { who: 'luma', text: 'La neblina se propaga de planeta en planeta y congela las ideas. Todo lo que toca pierde su color.' },
  { who: 'aura', text: 'Cada planeta tiene sus <b>islas</b>, y cada isla guarda un <b>Nodo de Pregunta</b>. Resuélvelo y la neblina retrocede. Explora los planetas en el orden que quieras. Si te trabas, pídeme una pista y te explico la lógica.' },
  { who: 'luma', text: 'Yo te recordaré para quién lo haces. No vinimos a destruir la máquina: vinimos a <b>restaurar el flujo</b>.' }
];

// First-visit briefings, keyed by island id.
var BRIEFINGS = {
  'fund-inicial': [
    { who: 'luma', text: 'En esta isla los rovers llevan cristales de energía entre colonias. La neblina derrumbó los puentes y las dejó aisladas.' },
    { who: 'aura', text: 'Cada puente se arma con una expresión y su largo es el resultado. El <b>orden de las operaciones</b> decide si llega al otro lado.' }
  ],
  'alg-intermedio': [
    { who: 'luma', text: 'Aquí la neblina se endureció en muros de cristal opaco que bloquean el paso de los rovers.' },
    { who: 'aura', text: 'El cañón dispara siguiendo la parábola <b>f(x) = a·x² + b·x + c</b>. Ajusta sus parámetros para dar en la grieta y el muro caerá.' }
  ]
};

var STORAGE_KEY = 'neuromath_story_v2';
var OLD_STORAGE_KEY = 'neuromath_story_v1'; // briefings keyed by the old planet ids
var seen = { intro: false, briefings: {} };
(function load(){
  try{
    var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if(parsed){ seen.intro = !!parsed.intro; seen.briefings = parsed.briefings || {}; return; }
    var old = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY) || 'null');
    if(old){
      seen.intro = !!old.intro;
      Object.keys(old.briefings || {}).forEach(function(id){ seen.briefings[MOVED_IDS[id] || id] = true; });
      save();
    }
  }catch(e){ /* storage unavailable — the story just shows again */ }
})();
function save(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(seen)); }catch(e){ /* ignore */ }
}

export function showIntro(onDone){
  seen.intro = true;
  save();
  showDialogue(INTRO, { eyebrow: 'Sector Neuromath · Transmisión entrante', doneLabel: 'Comenzar misión', onDone: onDone });
}

export function showIntroOnce(onDone){
  if(seen.intro){ if(onDone) onDone(); return; }
  showIntro(onDone);
}

// Runs onDone right away when the island has no briefing or it was already seen.
export function briefThenOpen(island, onDone){
  var lines = BRIEFINGS[island.id];
  if(!lines || seen.briefings[island.id]){ onDone(); return; }
  seen.briefings[island.id] = true;
  save();
  showDialogue(lines, { eyebrow: island.planet.name + ' · Isla ' + island.level.label, doneLabel: 'A la misión', onDone: onDone });
}

export function resetStory(){
  seen = { intro: false, briefings: {} };
  save();
}
