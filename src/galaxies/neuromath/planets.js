import { NODES } from './data.js';
import { isDone, isUnlocked, markDone, topicFullyDone, allDone } from './progress.js';
import { refreshHud } from './hud.js';
import { mapRef } from './map-ref.js';
import { openBridge } from './games/bridge/controller.js';
import { showToast } from '../../shared/toast.js';
import { showConfirm } from '../../shared/confirm.js';
import { notifyHost } from '../../shared/host.js';

// Only the planets listed here are built; every other planet stays locked.
// Each game exposes open(node, onFinish), and calls onFinish(score, close)
// when the player completes it.
var GAMES = { 'fund-inicial': { open: openBridge } };

export function isPlayable(index){ return !!GAMES[NODES[index].id]; }

function openNode(nodeIndex){
  var node = NODES[nodeIndex];
  GAMES[node.id].open(node, function(score, close){ finishNode(node, score, close); });
}

// Planets that aren't built yet only show a notice. Built ones follow the
// suggested route without forcing it: jumping ahead asks for confirmation first.
export function attemptOpenNode(nodeIndex){
  var node = NODES[nodeIndex];
  if(!isPlayable(nodeIndex)){
    showToast('🔒 Este planeta se abrirá pronto.');
    return;
  }
  if(isUnlocked(nodeIndex) || isDone(node.id)){
    openNode(nodeIndex);
    return;
  }
  showConfirm(
    '¿Saltar hacia adelante?',
    'Todavía no completaste los planetas anteriores de ' + node.topic.name + '. ¿Seguro quieres ir aquí sin pasar por los otros? Podrías perderte conceptos importantes.',
    function(){ openNode(nodeIndex); }
  );
}

// Record the planet as mastered, close the game, refresh the map and celebrate.
function finishNode(node, attempts, closeFn){
  var wasFirstTimeDone = !isDone(node.id);
  markDone(node.id, attempts);
  refreshHud();
  closeFn();
  if(mapRef.scene) mapRef.scene.rebuild();
  notifyHost('node-completed', { nodeId: node.id, score: attempts });
  if(wasFirstTimeDone && node.isLastOfTopic && topicFullyDone(node.topic.id)){
    showToast('💎 ¡Gema de maestría obtenida en ' + node.topic.name + '!');
  } else if(wasFirstTimeDone){
    showToast('✔ ' + node.topic.name + ' · ' + node.level.label + ' completado');
  }
  if(allDone()){
    setTimeout(function(){ showToast('👑 ¡Atlas Neuromath completado por entero!'); }, 900);
  }
}
