import { pickRound } from './levels.js';
import { OP_NAMES, fmtNum } from './math.js';
import { diagnose, feedbackCard } from './feedback.js';
import { BridgeScene, bridgeCtl } from './scene.js';
import { shuffled } from '../../../../shared/random.js';
import { showToast } from '../../../../shared/toast.js';
import { createShell } from '../../../../shared/game/shell.js';

// Puente de operaciones. The player fills an arithmetic expression with the
// given tiles; the value of the expression is the length of the bridge that
// grows across the abyss. It only holds when it matches the gap exactly, so
// the player discovers operator precedence by seeing the bridge come out
// "wrong" and reading the feedback card, which explains where the mistake is.

/* ---- controller (DOM: slots, tiles, drag & drop) ---- */
var shell = createShell({
  id: 'bridge-game', emblem: '±', title: 'Puente de operaciones',
  pipsLabel: 'Progreso de abismos', hintThinking: 'Analizando tu puente',
  panelHtml:
    '<div class="gm-goal"></div>' +
    '<div class="bg-expr"></div>' +
    '<div class="gm-feedback" role="status" aria-live="polite"></div>' +
    '<div class="bg-tray"></div>' +
    '<div class="gm-actions">' +
      '<button type="button" class="ai-btn gm-hint-btn">✨ Pista con IA</button>' +
      '<button type="button" class="btn-secondary bg-clear">Limpiar</button>' +
      '<button type="button" class="btn-primary gm-build" disabled>🌉 Construir puente</button>' +
    '</div>'
});
var elBPanel = shell.el.panel;
var elBGoal = shell.el.goal;
var elBExpr = elBPanel.querySelector('.bg-expr');
var elBTray = elBPanel.querySelector('.bg-tray');
var elBClear = elBPanel.querySelector('.bg-clear');
var elBBuild = shell.el.build;

var bridge = null;          // controller state while the game is open
var bridgeDrag = null;

shell.setHint(
  function(){ return bridge.round[bridge.level].hint; },
  function(){ return !bridge || bridge.busy; }
);

// onFinish(score, close) runs when the player completes every abyss.
export function openBridge(node, onFinish){
  bridge = { node: node, onFinish: onFinish, round: pickRound(), level: 0, fails: 0, levelFails: 0,
             busy: false, won: false, result: null, feedback: null, nope: -1, pop: '', tiles: [], slots: [] };
  shell.open(node.topic.name + ' · ' + node.level.label, closeBridge);
  bridgeCtl.initialTarget = bridge.round[0].target;
  setupBridgeLevel();
  try{
    shell.startScene(BridgeScene);
  }catch(err){
    if(window.console) console.error('Bridge game could not start', err);
    closeBridge();
    showToast('No se pudo iniciar el juego. Recarga la página e inténtalo de nuevo.');
    return;
  }
  showBridgeIntro();
}

function closeBridge(){
  cancelBridgeDrag();
  bridgeCtl.scene = null;
  shell.close();
  bridge = null;
}

function setupBridgeLevel(){
  var b = bridge, lv = b.round[b.level];
  b.won = false; b.busy = false; b.result = null; b.feedback = null; b.levelFails = 0; b.nope = -1; b.pop = '';
  b.slots = lv.tpl.split(' ').map(function(c){
    if(c === 'n') return { kind: 'num', tile: null, wrong: false };
    if(c === 'o') return { kind: 'op', tile: null, wrong: false };
    return { kind: c === '(' ? 'lp' : 'rp', tile: null, wrong: false };
  });
  var nums = lv.nums.map(function(v, i){ return { id: 'n' + i, kind: 'num', value: v, slot: null }; });
  var ops = lv.ops.map(function(v, i){ return { id: 'o' + i, kind: 'op', value: v, slot: null }; });
  b.tiles = shuffled(nums).concat(shuffled(ops));
  shell.resetHint();
  renderBridgePips();
  elBTray.style.minHeight = '';
  renderBridgePanel();
  // With every tile still in the tray, its height is the tallest it will ever
  // be. Pinning it keeps the panel (and so the canvas above it) from resizing
  // each time a tile moves into the expression.
  elBTray.style.minHeight = elBTray.offsetHeight + 'px';
}

function renderBridgePips(){ shell.renderPips(bridge.round.length, bridge.level, bridge.won); }

function tileHtml(t){
  var label = t.kind === 'num' ? 'Número ' + t.value : 'Operación: ' + OP_NAMES[t.value];
  return '<button type="button" class="tile ' + t.kind + (bridge.pop === t.id ? ' pop' : '') + '" data-id="' + t.id + '" aria-label="' + label + '">' + t.value + '</button>';
}

function allSlotsFilled(){
  return bridge.slots.every(function(s){ return (s.kind !== 'num' && s.kind !== 'op') || s.tile; });
}

function renderBridgePanel(){
  var b = bridge, lv = b.round[b.level];
  elBGoal.innerHTML = '<i>Abismo ' + (b.level + 1) + ' de ' + b.round.length + '</i>Necesitas un puente de exactamente <b>' + lv.target + ' m</b>';

  var exprHtml = b.slots.map(function(s, i){
    if(s.kind === 'lp') return '<span class="paren" aria-hidden="true">(</span>';
    if(s.kind === 'rp') return '<span class="paren" aria-hidden="true">)</span>';
    var cls = 'slot ' + s.kind + (s.tile ? ' filled' : '') + (s.wrong ? ' wrong' : '') + (b.nope === i ? ' nope' : '');
    return '<div class="' + cls + '" data-slot="' + i + '" data-hint="' + (s.kind === 'num' ? 'nº' : 'op') + '">' + (s.tile ? tileHtml(s.tile) : '') + '</div>';
  }).join('');
  exprHtml += '<span class="eq">=</span><div class="res' + (b.result ? ' ' + b.result.cls : '') + '">' + (b.result ? b.result.text : '? m') + '</div>';
  elBExpr.innerHTML = exprHtml;

  var loose = b.tiles.filter(function(t){ return t.slot === null; });
  elBTray.innerHTML = loose.length
    ? loose.map(tileHtml).join('')
    : '<span class="bg-tray-empty">' + (b.won ? '¡Puente completado!' : 'Todas las fichas están en el puente. Arrástralas para cambiarlas.') + '</span>';

  shell.renderFeedback(b.feedback, FEEDBACK_IDLE);
  var last = b.level === b.round.length - 1;
  elBBuild.textContent = b.won ? (last ? '★ Ver resultado' : 'Siguiente abismo →') : '🌉 Construir puente';
  elBBuild.disabled = b.busy || (!b.won && !allSlotsFilled());
  elBClear.disabled = b.busy || b.won || !b.tiles.some(function(t){ return t.slot !== null; });
  elBPanel.classList.toggle('locked', b.busy || b.won);
  elBPanel.classList.toggle('busy', b.busy);
  b.nope = -1; b.pop = '';
}

// Moving a tile invalidates the last result and the slots marked as wrong;
// the explanation stays (dimmed) so the player can keep reading it.
function bridgeChanged(){
  bridge.result = null;
  bridge.slots.forEach(function(s){ s.wrong = false; });
  if(bridge.feedback) bridge.feedback.stale = true;
}

var FEEDBACK_IDLE = '<p class="fb-idle"><b>Recuerda:</b> primero los paréntesis, luego la multiplicación, y al final las sumas y restas de izquierda a derecha.</p>';

function placeTile(tile, si){
  var b = bridge, slot = b.slots[si];
  if(!slot || slot.kind !== tile.kind){ b.nope = si; return false; }
  if(slot.tile === tile) return true;
  var from = tile.slot, other = slot.tile;
  if(from !== null) b.slots[from].tile = null;
  if(other){
    other.slot = null;
    // dragging from one slot onto another swaps the two tiles
    if(from !== null && b.slots[from].kind === other.kind){ b.slots[from].tile = other; other.slot = from; }
  }
  slot.tile = tile; tile.slot = si; b.pop = tile.id;
  bridgeChanged();
  return true;
}

function unplaceTile(tile){
  if(tile.slot === null) return;
  bridge.slots[tile.slot].tile = null; tile.slot = null;
  bridgeChanged();
}

function clickTile(tile){
  if(tile.slot !== null){ unplaceTile(tile); return; }
  for(var i = 0; i < bridge.slots.length; i++){
    var s = bridge.slots[i];
    if(s.kind === tile.kind && !s.tile){ placeTile(tile, i); return; }
  }
}

function findTile(id){
  for(var i = 0; i < bridge.tiles.length; i++){ if(bridge.tiles[i].id === id) return bridge.tiles[i]; }
  return null;
}

// The slot closest to the pointer, with a little slack so touch drops are forgiving.
function slotNear(x, y){
  var best = null, bestD = Infinity, slack = 14;
  var els = elBExpr.querySelectorAll('.slot');
  for(var i = 0; i < els.length; i++){
    var r = els[i].getBoundingClientRect();
    if(x < r.left - slack || x > r.right + slack || y < r.top - slack || y > r.bottom + slack) continue;
    var d = Math.hypot(x - (r.left + r.right) / 2, y - (r.top + r.bottom) / 2);
    if(d < bestD){ bestD = d; best = els[i]; }
  }
  return best;
}

function onBridgeDown(e){
  if(!bridge || bridge.busy || bridge.won) return;
  if(e.button !== undefined && e.button !== 0) return;
  var el = e.target.closest ? e.target.closest('.tile') : null;
  if(!el) return;
  var tile = findTile(el.getAttribute('data-id'));
  if(!tile) return;
  e.preventDefault();
  bridgeDrag = { tile: tile, el: el, x0: e.clientX, y0: e.clientY, moved: false, ghost: null, pid: e.pointerId, over: null };
  window.addEventListener('pointermove', onBridgeMove);
  window.addEventListener('pointerup', onBridgeUp);
  window.addEventListener('pointercancel', onBridgeUp);
}

function onBridgeMove(e){
  var d = bridgeDrag;
  if(!d || e.pointerId !== d.pid) return;
  if(!d.moved){
    if(Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 6) return;
    d.moved = true;
    d.ghost = d.el.cloneNode(true);
    d.ghost.removeAttribute('data-id');
    d.ghost.classList.add('tile-ghost');
    d.ghost.classList.remove('pop');
    // The ghost lives on <body>, outside the shell that defines --tile, so
    // it needs the source tile's real size copied over.
    var box = d.el.getBoundingClientRect();
    d.ghost.style.width = box.width + 'px';
    d.ghost.style.height = box.height + 'px';
    d.ghost.style.fontSize = getComputedStyle(d.el).fontSize;
    document.body.appendChild(d.ghost);
    d.el.classList.add('dragging');
  }
  d.ghost.style.left = e.clientX + 'px';
  d.ghost.style.top = e.clientY + 'px';
  var over = slotNear(e.clientX, e.clientY);
  if(over !== d.over){
    if(d.over) d.over.classList.remove('over');
    if(over) over.classList.add('over');
    d.over = over;
  }
}

function onBridgeUp(e){
  var d = bridgeDrag;
  if(!d || e.pointerId !== d.pid) return;
  cancelBridgeDrag();
  if(!bridge) return;
  if(e.type === 'pointercancel'){ renderBridgePanel(); return; }
  if(!d.moved){ clickTile(d.tile); }
  else {
    var slotEl = slotNear(e.clientX, e.clientY);
    if(slotEl){ placeTile(d.tile, parseInt(slotEl.getAttribute('data-slot'), 10)); }
    else if(d.tile.slot !== null){ unplaceTile(d.tile); } // dropped outside: back to the tray
  }
  renderBridgePanel();
}

function cancelBridgeDrag(){
  window.removeEventListener('pointermove', onBridgeMove);
  window.removeEventListener('pointerup', onBridgeUp);
  window.removeEventListener('pointercancel', onBridgeUp);
  if(bridgeDrag){
    if(bridgeDrag.ghost) bridgeDrag.ghost.remove();
    if(bridgeDrag.over) bridgeDrag.over.classList.remove('over');
    bridgeDrag.el.classList.remove('dragging');
  }
  bridgeDrag = null;
}

elBPanel.addEventListener('pointerdown', onBridgeDown);
// Keyboard activation (Enter/Space on a focused tile) arrives as a click with detail 0.
elBPanel.addEventListener('click', function(e){
  if(e.detail !== 0 || !bridge || bridge.busy || bridge.won) return;
  var el = e.target.closest ? e.target.closest('.tile') : null;
  if(!el) return;
  var tile = findTile(el.getAttribute('data-id'));
  if(!tile) return;
  clickTile(tile);
  renderBridgePanel();
  var again = elBPanel.querySelector('.tile[data-id="' + tile.id + '"]');
  if(again) again.focus();
});

elBClear.addEventListener('click', function(){
  if(!bridge || bridge.busy || bridge.won) return;
  bridge.tiles.forEach(function(t){ if(t.slot !== null){ bridge.slots[t.slot].tile = null; t.slot = null; } });
  bridgeChanged();
  renderBridgePanel();
});

function showBridgeIntro(){
  var T = bridge.round[bridge.level].target;
  shell.showBanner('info', 'Abismo de ' + T + ' m', 'Usa todas las fichas para que tu puente mida exactamente ' + T + ' m. Arrástralas o tócalas.', 6000);
}

function kindOfBridge(val, T){
  return val === T ? 'win' : (val > T ? 'long' : (val > 0 ? 'short' : 'none'));
}

elBBuild.addEventListener('click', function(){
  var b = bridge;
  if(!b || b.busy) return;
  if(b.won){ nextBridgeLevel(); return; }
  if(!allSlotsFilled()) return;

  var lv = b.round[b.level], T = lv.target;
  var tokens = b.slots.map(function(s){
    if(s.kind === 'lp') return '(';
    if(s.kind === 'rp') return ')';
    return s.tile.value;
  });
  var d = diagnose(lv, tokens), val = d.value, kind = kindOfBridge(val, T);

  b.busy = true;
  shell.hideBanner();
  shell.hideHint();
  renderBridgePanel();

  var onResult = function(){
    if(bridge !== b) return;
    b.result = { text: fmtNum(val) + ' m', cls: kind === 'win' ? 'ok' : 'bad' };
    var card = feedbackCard(d, T);
    b.feedback = { kind: kind === 'win' ? 'win' : 'fail', title: card.title, html: card.html, stale: false };
    if(kind === 'win'){
      b.won = true;
      renderBridgePips();
      shell.showBanner('win', '¡Puente perfecto!', 'Mide exactamente ' + T + ' m y el rover cruzó con sus cristales.', 0);
    } else {
      b.fails++; b.levelFails++;
      if(b.levelFails >= 2) shell.pulseHint();
      d.wrongSlots.forEach(function(i){ b.slots[i].wrong = true; });
      var title, sub;
      if(kind === 'short'){ title = '¡Se quedó corto!'; sub = 'Tu puente mide ' + val + ' m y el abismo ' + T + ' m. Faltan ' + (T - val) + ' m.'; }
      else if(kind === 'long'){ title = '¡Se pasó de largo!'; sub = 'Tu puente mide ' + val + ' m y el abismo solo ' + T + ' m. Sobran ' + (val - T) + ' m.'; }
      else { title = '¡No hay puente!'; sub = 'Tu expresión da ' + fmtNum(val) + ' m, y un puente necesita medir más de 0 m.'; }
      shell.showBanner('fail', title, sub + ' Mira abajo dónde está el error.', 5000);
    }
    renderBridgePanel();
  };
  var onReady = function(){
    if(bridge !== b) return;
    b.busy = false;
    renderBridgePanel();
  };

  if(bridgeCtl.scene){ bridgeCtl.scene.runBridge(val, kind, onResult, onReady); }
  else { setTimeout(function(){ onResult(); onReady(); }, 400); } // no canvas: still playable
});

function nextBridgeLevel(){
  var b = bridge;
  if(b.level >= b.round.length - 1){ showBridgeFinal(); return; }
  b.level++;
  shell.hideBanner();
  setupBridgeLevel();
  if(bridgeCtl.scene) bridgeCtl.scene.changeLevel(b.round[b.level].target);
  showBridgeIntro();
}

function showBridgeFinal(){
  var b = bridge;
  shell.showFinal({
    icon: '🌉', title: '¡Abismos superados!', total: b.round.length, unit: 'abismos', fails: b.fails,
    recap: 'primero los paréntesis, luego la multiplicación, y al final las sumas y restas de izquierda a derecha.',
    onContinue: function(){ b.onFinish(b.fails, closeBridge); }
  });
}
