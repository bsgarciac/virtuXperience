import Phaser from 'phaser';
import { BRIDGE_LEVELS } from './levels.js';
import { OP_NAMES, fmtNum, evalTokens, solveSteps } from './math.js';
import { BridgeScene, bridgeCtl } from './scene.js';
import { shuffled } from '../../../../shared/random.js';
import { showToast } from '../../../../shared/toast.js';
import { isConfirmOpen } from '../../../../shared/confirm.js';
import { aiThinkingHtml, aiBubbleHtml } from '../../../../shared/ai.js';

// Fundamentos · Inicial. The player fills an arithmetic expression with the
// given tiles; the value of the expression is the length of the bridge that
// grows across the abyss. It only holds when it matches the gap exactly, so
// the player discovers operator precedence by seeing the bridge come out
// "wrong" and reading the step-by-step solution afterwards.

/* ---- controller (DOM: slots, tiles, drag & drop) ---- */
var elBO = document.getElementById('bridge-overlay');
var elBStage = document.getElementById('bridge-stage');
var elBPips = document.getElementById('bridge-pips');
var elBBanner = document.getElementById('bridge-banner');
var elBHintPanel = document.getElementById('bridge-hint-panel');
var elBPanel = document.getElementById('bridge-panel');
var elBGoal = document.getElementById('bridge-goal');
var elBExpr = document.getElementById('bridge-expr');
var elBTray = document.getElementById('bridge-tray');
var elBSteps = document.getElementById('bridge-steps');
var elBHint = document.getElementById('bridge-hint');
var elBClear = document.getElementById('bridge-clear');
var elBBuild = document.getElementById('bridge-build');
var elBFinal = document.getElementById('bridge-final');
var elBFinalCard = document.getElementById('bridge-final-card');

var bridge = null;          // controller state while the game is open
var bridgeGame = null;      // the Phaser.Game rendering the scene
var bridgeRO = null, bridgeDrag = null, bannerTimer = null;

// onFinish(score, close) runs when the player completes every abyss.
export function openBridge(node, onFinish){
  bridge = { node: node, onFinish: onFinish, level: 0, fails: 0, levelFails: 0,
             busy: false, won: false, result: null, stepsHtml: '', nope: -1, pop: '', tiles: [], slots: [] };
  elBFinal.classList.remove('show');
  hideBridgeBanner();
  elBO.classList.add('open');
  document.addEventListener('keydown', onBridgeKey);
  bridgeCtl.initialTarget = BRIDGE_LEVELS[0].target;
  setupBridgeLevel();
  try{
    createBridgeGame();
  }catch(err){
    if(window.console) console.error('Bridge game could not start', err);
    closeBridge();
    showToast('No se pudo iniciar el juego. Recarga la página e inténtalo de nuevo.');
    return;
  }
  showBridgeIntro();
}

function createBridgeGame(){
  bridgeGame = new Phaser.Game({
    type: Phaser.AUTO,
    parent: elBStage,
    backgroundColor: '#0b1226',
    scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
    scene: [BridgeScene],
    render: { antialias: true },
    audio: { noAudio: true }
  });
  // The stage changes height when the panel below wraps onto more lines.
  if(window.ResizeObserver){
    bridgeRO = new ResizeObserver(function(){
      var sm = bridgeGame && bridgeGame.scale;
      if(!sm) return;
      sm.getParentBounds(); // re-read the stage size first, or refresh() keeps the old one
      sm.refresh();
    });
    bridgeRO.observe(elBStage);
  }
}

function closeBridge(){
  document.removeEventListener('keydown', onBridgeKey);
  cancelBridgeDrag();
  clearTimeout(bannerTimer);
  if(bridgeRO){ bridgeRO.disconnect(); bridgeRO = null; }
  bridgeCtl.scene = null;
  if(bridgeGame){ try{ bridgeGame.destroy(true); }catch(e){ /* already gone */ } bridgeGame = null; }
  bridge = null;
  elBO.classList.remove('open');
  elBFinal.classList.remove('show');
  elBBanner.classList.remove('show');
  elBHintPanel.hidden = true;
}

function onBridgeKey(e){
  if(e.key === 'Escape' && bridge && !isConfirmOpen()) closeBridge();
}

function setupBridgeLevel(){
  var b = bridge, lv = BRIDGE_LEVELS[b.level];
  b.won = false; b.busy = false; b.result = null; b.stepsHtml = ''; b.levelFails = 0; b.nope = -1; b.pop = '';
  b.slots = lv.tpl.split(' ').map(function(c){
    if(c === 'n') return { kind: 'num', tile: null };
    if(c === 'o') return { kind: 'op', tile: null };
    return { kind: c === '(' ? 'lp' : 'rp', tile: null };
  });
  var nums = lv.nums.map(function(v, i){ return { id: 'n' + i, kind: 'num', value: v, slot: null }; });
  var ops = lv.ops.map(function(v, i){ return { id: 'o' + i, kind: 'op', value: v, slot: null }; });
  b.tiles = shuffled(nums).concat(shuffled(ops));
  elBHintPanel.hidden = true; elBHintPanel.dataset.loaded = ''; elBHintPanel.classList.remove('ai-loading');
  elBHint.disabled = false; elBHint.classList.remove('pulse');
  elBFinal.classList.remove('show');
  renderBridgePips();
  elBTray.style.minHeight = '';
  renderBridgePanel();
  // With every tile still in the tray, its height is the tallest it will ever
  // be. Pinning it keeps the panel (and so the canvas above it) from resizing
  // each time a tile moves into the expression.
  elBTray.style.minHeight = elBTray.offsetHeight + 'px';
}

function renderBridgePips(){
  var html = '';
  for(var i = 0; i < BRIDGE_LEVELS.length; i++){
    var cls = 'bg-pip' + (i < bridge.level || (i === bridge.level && bridge.won) ? ' done' : (i === bridge.level ? ' active' : ''));
    html += '<span class="' + cls + '"></span>';
  }
  elBPips.innerHTML = html;
}

function tileHtml(t){
  var label = t.kind === 'num' ? 'Número ' + t.value : 'Operación: ' + OP_NAMES[t.value];
  return '<button type="button" class="tile ' + t.kind + (bridge.pop === t.id ? ' pop' : '') + '" data-id="' + t.id + '" aria-label="' + label + '">' + t.value + '</button>';
}

function allSlotsFilled(){
  return bridge.slots.every(function(s){ return (s.kind !== 'num' && s.kind !== 'op') || s.tile; });
}

function renderBridgePanel(){
  var b = bridge, lv = BRIDGE_LEVELS[b.level];
  elBGoal.innerHTML = '<i>Abismo ' + (b.level + 1) + ' de ' + BRIDGE_LEVELS.length + '</i>Necesitas un puente de exactamente <b>' + lv.target + ' m</b>';

  var exprHtml = b.slots.map(function(s, i){
    if(s.kind === 'lp') return '<span class="paren" aria-hidden="true">(</span>';
    if(s.kind === 'rp') return '<span class="paren" aria-hidden="true">)</span>';
    var cls = 'slot ' + s.kind + (s.tile ? ' filled' : '') + (b.nope === i ? ' nope' : '');
    return '<div class="' + cls + '" data-slot="' + i + '" data-hint="' + (s.kind === 'num' ? 'nº' : 'op') + '">' + (s.tile ? tileHtml(s.tile) : '') + '</div>';
  }).join('');
  exprHtml += '<span class="eq">=</span><div class="res' + (b.result ? ' ' + b.result.cls : '') + '">' + (b.result ? b.result.text : '? m') + '</div>';
  elBExpr.innerHTML = exprHtml;

  var loose = b.tiles.filter(function(t){ return t.slot === null; });
  elBTray.innerHTML = loose.length
    ? loose.map(tileHtml).join('')
    : '<span class="bg-tray-empty">' + (b.won ? '¡Puente completado!' : 'Todas las fichas están en el puente. Arrástralas para cambiarlas.') + '</span>';

  elBSteps.innerHTML = b.stepsHtml;
  var last = b.level === BRIDGE_LEVELS.length - 1;
  elBBuild.textContent = b.won ? (last ? '★ Ver resultado' : 'Siguiente abismo →') : '🌉 Construir puente';
  elBBuild.disabled = b.busy || (!b.won && !allSlotsFilled());
  elBClear.disabled = b.busy || b.won || !b.tiles.some(function(t){ return t.slot !== null; });
  elBPanel.classList.toggle('locked', b.busy || b.won);
  elBPanel.classList.toggle('busy', b.busy);
  b.nope = -1; b.pop = '';
}

function bridgeChanged(){ bridge.result = null; bridge.stepsHtml = ''; }

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

document.getElementById('bridge-close').addEventListener('click', function(){ if(bridge) closeBridge(); });

elBHint.addEventListener('click', function(){
  if(!bridge || bridge.busy) return;
  if(elBHintPanel.dataset.loaded === '1'){ elBHintPanel.hidden = !elBHintPanel.hidden; return; }
  var lvIdx = bridge.level;
  elBHintPanel.hidden = false;
  elBHintPanel.classList.add('ai-loading');
  elBHintPanel.innerHTML = aiThinkingHtml('Analizando tu puente');
  elBHint.disabled = true;
  setTimeout(function(){
    if(!bridge || bridge.level !== lvIdx) return;
    elBHintPanel.classList.remove('ai-loading');
    elBHintPanel.innerHTML = aiBubbleHtml(BRIDGE_LEVELS[lvIdx].hint);
    elBHintPanel.dataset.loaded = '1';
    elBHint.disabled = false;
    elBHint.classList.remove('pulse');
  }, 650 + Math.random() * 350);
});

function showBridgeBanner(kind, title, sub, ms){
  clearTimeout(bannerTimer);
  elBBanner.className = 'bg-banner ' + kind;
  elBBanner.innerHTML = '<b>' + title + '</b><span>' + sub + '</span>';
  void elBBanner.offsetWidth; // restart the transition
  elBBanner.classList.add('show');
  if(ms) bannerTimer = setTimeout(hideBridgeBanner, ms);
}
function hideBridgeBanner(){ clearTimeout(bannerTimer); elBBanner.classList.remove('show'); }

function showBridgeIntro(){
  var T = BRIDGE_LEVELS[bridge.level].target;
  showBridgeBanner('info', 'Abismo de ' + T + ' m', 'Usa todas las fichas para que tu puente mida exactamente ' + T + ' m. Arrástralas o tócalas.', 6000);
}

function kindOfBridge(val, T){
  return val === T ? 'win' : (val > T ? 'long' : (val > 0 ? 'short' : 'none'));
}

elBBuild.addEventListener('click', function(){
  var b = bridge;
  if(!b || b.busy) return;
  if(b.won){ nextBridgeLevel(); return; }
  if(!allSlotsFilled()) return;

  var T = BRIDGE_LEVELS[b.level].target;
  var tokens = b.slots.map(function(s){
    if(s.kind === 'lp') return '(';
    if(s.kind === 'rp') return ')';
    return s.tile.value;
  });
  var val = evalTokens(tokens), sol = solveSteps(tokens), kind = kindOfBridge(val, T);

  b.busy = true;
  hideBridgeBanner();
  elBHintPanel.hidden = true;
  renderBridgePanel();

  var onResult = function(){
    if(bridge !== b) return;
    b.result = { text: fmtNum(val) + ' m', cls: kind === 'win' ? 'ok' : 'bad' };
    b.stepsHtml = sol.steps.length
      ? '<em>Paso a paso:</em> ' + sol.steps.map(function(s){ return '<b>' + s + '</b>'; }).join(' <em>→</em> ')
      : '';
    if(kind === 'win'){
      b.won = true;
      renderBridgePips();
      showBridgeBanner('win', '¡Puente perfecto!', 'Mide exactamente ' + T + ' m y el rover cruzó con sus cristales.', 0);
    } else {
      b.fails++; b.levelFails++;
      if(b.levelFails >= 2) elBHint.classList.add('pulse');
      var title, sub;
      if(kind === 'short'){ title = '¡Se quedó corto!'; sub = 'Tu puente mide ' + val + ' m y el abismo ' + T + ' m. Faltan ' + (T - val) + ' m.'; }
      else if(kind === 'long'){ title = '¡Se pasó de largo!'; sub = 'Tu puente mide ' + val + ' m y el abismo solo ' + T + ' m. Sobran ' + (val - T) + ' m.'; }
      else { title = '¡No hay puente!'; sub = 'Tu expresión da ' + fmtNum(val) + ' m, y un puente necesita medir más de 0 m.'; }
      showBridgeBanner('fail', title, sub + ' Cambia las fichas y prueba de nuevo.', 0);
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
  if(b.level >= BRIDGE_LEVELS.length - 1){ showBridgeFinal(); return; }
  b.level++;
  hideBridgeBanner();
  setupBridgeLevel();
  if(bridgeCtl.scene) bridgeCtl.scene.changeLevel(BRIDGE_LEVELS[b.level].target);
  showBridgeIntro();
}

function showBridgeFinal(){
  var b = bridge, fails = b.fails;
  var stars = fails <= 2 ? 3 : (fails <= 5 ? 2 : 1);
  var starsHtml = '';
  for(var i = 0; i < 3; i++) starsHtml += i < stars ? '★' : '<span class="off">★</span>';
  var msg = fails === 0
    ? 'Cruzaste los ' + BRIDGE_LEVELS.length + ' abismos sin un solo intento fallido. ¡Impecable!'
    : 'Cruzaste los ' + BRIDGE_LEVELS.length + ' abismos tras ' + fails + ' ' + (fails === 1 ? 'intento fallido' : 'intentos fallidos') + '. ¡Sigues avanzando!';
  elBFinalCard.innerHTML =
    '<div class="result-icon">🌉</div>' +
    '<div class="result-title">¡Abismos superados!</div>' +
    '<div class="bg-stars" aria-label="' + stars + ' de 3 estrellas">' + starsHtml + '</div>' +
    '<div class="result-msg" style="margin-bottom:12px;">' + msg + '</div>' +
    '<div class="bg-recap"><b>Recuerda:</b> primero los paréntesis, luego la multiplicación, y al final las sumas y restas de izquierda a derecha.</div>' +
    '<div class="result-actions"><button type="button" class="btn-primary" id="bridge-finish">Continuar</button></div>';
  elBFinal.classList.add('show');
  document.getElementById('bridge-finish').addEventListener('click', function(){
    b.onFinish(fails, closeBridge);
  });
}
