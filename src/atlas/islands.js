import { islandsOf } from './world.js';
import { isDone, markDone, planetFullyDone, galaxyDone, addCells, awardBadge } from './progress.js';
import { refreshHud } from './hud.js';
import { mapRef } from './map-ref.js';
import { showToast } from '../shared/toast.js';
import { showConfirm } from '../shared/confirm.js';
import { notifyHost } from '../shared/host.js';
import { briefThenOpen } from './story.js';
import { setDevActions } from '../shared/dev.js';

// Opening and finishing islands, for any galaxy. Which islands are built
// comes from each galaxy's def.games (see atlas/define.js).

function gameOf(island){ return (island.galaxy.games || {})[island.id] || null; }

export function isPlayable(island){ return !!gameOf(island); }

export function gameTitle(island){ var g = gameOf(island); return g ? g.title : ''; }

// Planets can be explored in any order, but inside a planet the islands
// follow a suggested route: an island is open once every built island
// before it on the same planet is restored.
export function isUnlocked(island){
  return islandsOf(island.planet.id).every(function(other){
    return other.levelIndex >= island.levelIndex || !isPlayable(other) || isDone(other.id);
  });
}

export function playableCount(planetId){ return islandsOf(planetId).filter(isPlayable).length; }

// What the island pays out the first time it's restored, so the game can
// show it on its final card: { cells, badge: { id, name } | null, firstTime }.
function rewardOf(island){
  var g = gameOf(island), first = !isDone(island.id);
  return { cells: first ? (g.cells || 0) : 0, badge: first ? (g.badge || null) : null, firstTime: first };
}

function openIsland(island){
  // Dev mode: finish the island right away, as a flawless win.
  setDevActions('island', [{ label: '⏭ Completar isla', run: function(){
    var close = document.querySelector('.gm-overlay.open .gm-close-btn');
    if(!close){ setDevActions('island', []); return; } // the game was already closed
    close.click();
    finishIsland(island, 0, function(){}, 0);
  } }]);
  briefThenOpen(island, function(){
    gameOf(island).open(island, function(score, close, extraCells){ finishIsland(island, score, close, extraCells || 0); }, rewardOf(island));
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

// Record the island as mastered, pay its reward, close the game, refresh the
// map and celebrate. extraCells: Células the player picked up while playing.
function finishIsland(island, attempts, closeFn, extraCells){
  setDevActions('island', []);
  var reward = rewardOf(island);
  markDone(island.id, attempts);
  if(reward.cells + extraCells) addCells(reward.cells + extraCells);
  if(reward.badge) awardBadge(reward.badge.id);
  refreshHud();
  closeFn();
  if(mapRef.scene) mapRef.scene.rebuild(island.id);
  notifyHost('node-completed', { nodeId: island.id, score: attempts });
  if(reward.firstTime && planetFullyDone(island.planet.id)){
    showToast('💎 ¡Gema de maestría obtenida en ' + island.planet.name + '!');
  } else if(reward.firstTime){
    showToast('✦ La neblina retrocede: isla ' + island.level.label + ' de ' + island.planet.name + ' restaurada');
  }
  if(reward.firstTime && galaxyDone(island.galaxy)){
    setTimeout(function(){ showToast('👑 ¡El sector ' + island.galaxy.name + ' recuperó todo su color!'); }, 900);
  }
}
