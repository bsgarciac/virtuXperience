import { islandsOf } from './data.js';
import { isDone, markDone, planetFullyDone, allDone } from './progress.js';
import { refreshHud } from './hud.js';
import { mapRef } from './map-ref.js';
import { openBridge } from './games/bridge/controller.js';
import { openCannon } from './games/cannon/controller.js';
import { showToast } from '../../shared/toast.js';
import { showConfirm } from '../../shared/confirm.js';
import { notifyHost } from '../../shared/host.js';
import { briefThenOpen } from './story.js';

// Only the islands listed here are built; every other island stays locked.
// Each game exposes open(island, onFinish), and calls onFinish(score, close)
// when the player completes it. title is shown on the map.
var GAMES = {
  'fund-inicial':   { title: 'Puente de operaciones', open: openBridge },
  'alg-intermedio': { title: 'Cañón parabólico', open: openCannon }
};

export function isPlayable(island){ return !!GAMES[island.id]; }

export function gameTitle(island){ var g = GAMES[island.id]; return g ? g.title : ''; }

// Planets can be explored in any order, but inside a planet the islands
// follow a suggested route: an island is open once every built island
// before it on the same planet is restored.
export function isUnlocked(island){
  return islandsOf(island.planet.id).every(function(other){
    return other.levelIndex >= island.levelIndex || !isPlayable(other) || isDone(other.id);
  });
}

export function playableCount(planetId){ return islandsOf(planetId).filter(isPlayable).length; }

function openIsland(island){
  briefThenOpen(island, function(){
    GAMES[island.id].open(island, function(score, close){ finishIsland(island, score, close); });
  });
}

// Islands that aren't built yet only show a notice. Built ones follow the
// suggested route without forcing it: jumping ahead asks for confirmation first.
export function attemptOpenIsland(island){
  if(!isPlayable(island)){
    showToast('🔒 Esta isla se abrirá pronto.');
    return;
  }
  if(isUnlocked(island) || isDone(island.id)){
    openIsland(island);
    return;
  }
  showConfirm(
    '¿Saltar hacia adelante?',
    'Todavía no completaste las islas anteriores de ' + island.planet.name + '. ¿Seguro quieres ir aquí sin pasar por las otras? Podrías perderte conceptos importantes.',
    function(){ openIsland(island); }
  );
}

// Record the island as mastered, close the game, refresh the map and celebrate.
function finishIsland(island, attempts, closeFn){
  var wasFirstTimeDone = !isDone(island.id);
  markDone(island.id, attempts);
  refreshHud();
  closeFn();
  if(mapRef.scene) mapRef.scene.rebuild(island.id);
  notifyHost('node-completed', { nodeId: island.id, score: attempts });
  if(wasFirstTimeDone && planetFullyDone(island.planet.id)){
    showToast('💎 ¡Gema de maestría obtenida en ' + island.planet.name + '!');
  } else if(wasFirstTimeDone){
    showToast('✦ La neblina retrocede: isla ' + island.level.label + ' de ' + island.planet.name + ' restaurada');
  }
  if(allDone()){
    setTimeout(function(){ showToast('👑 ¡El sector Neuromath recuperó todo su color!'); }, 900);
  }
}
