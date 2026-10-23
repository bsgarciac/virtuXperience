import { ORBITS, ENTITIES, CONTACTS, NEEDS, STEPS, CARDS, SUPPORTS, ISLANDS } from './content.js';
import { AlianzasScene, alianzasCtl, CELL_COUNT } from './scene.js';
import { shuffled } from '../../../../shared/random.js';
import { showToast } from '../../../../shared/toast.js';
import { showDialogue } from '../../../../shared/dialogue.js';
import { guidePortraitHtml } from '../../../../shared/guides.js';
import { createShell } from '../../../../shared/game/shell.js';
import { setDevActions } from '../../../../shared/dev.js';

// The Distrito Cristalino's three islands (see ISLANDS in content.js). On
// each one the player first walks to the corrupted Nodo (scene.js),
// picking up Células that Luma explains, and activates it; then the Nodo's
// challenge runs in the panel with that island's phases:
//   1. Mapa de Actores — sort entities into their orbit       (Instituciones)
//   2. Directorio de Contactos — match each need to its contact (Instituciones)
//   3. Ruta de Convocatorias — put the steps of a call in order (Cómo montar…)
//   4. Lienzo de Decisión — choose the strategy                 (Estrategia)
// Phases 1 and 2 are played on a board over the stage (a radar, then the
// contact sockets) with the entities' cards waiting in the panel below.
// Every check with a mistake counts as a failed try (for the stars); the
// feedback says what each misplaced piece actually does, not where it goes.

var CELL_VALUE = 10; // Células Lógicas per crystal picked up in the room
var CELL_TOTAL = CELL_COUNT;

var shell = createShell({
  id: 'alianzas-game', emblem: '◇', title: 'Distrito Cristalino',
  pipsLabel: 'Fases del Nodo', hintThinking: 'Luma analiza tu red',
  panelHtml:
    '<div class="gm-goal"></div>' +
    '<div class="ag-work"></div>' +
    '<div class="gm-feedback" role="status" aria-live="polite"></div>' +
    '<div class="gm-actions">' +
      '<button type="button" class="ai-btn gm-hint-btn">◈ Pregúntale a Luma</button>' +
      '<button type="button" class="btn-primary gm-build" disabled></button>' +
    '</div>'
});
var elWork = shell.el.panel.querySelector('.ag-work');
var elBuild = shell.el.build;

// Touch controls for the walk, over the stage.
var touch = document.createElement('div');
touch.className = 'ag-touch';
touch.innerHTML =
  '<button type="button" data-k="left" aria-label="Izquierda">◀</button>' +
  '<button type="button" data-k="right" aria-label="Derecha">▶</button>' +
  '<span></span>' +
  '<button type="button" data-k="jump" aria-label="Saltar">⤒</button>' +
  '<button type="button" data-k="act" aria-label="Activar">E</button>';
shell.el.stage.appendChild(touch);

// The Células counter during the walk: the Nodo only opens with all of them.
var roomHud = document.createElement('div');
roomHud.className = 'ag-room-hud';
shell.el.stage.appendChild(roomHud);
function renderRoomHud(n, total){
  roomHud.className = 'ag-room-hud' + (n >= total ? ' done' : '');
  roomHud.innerHTML = '<span class="ag-room-gem" aria-hidden="true">◆</span><b>' + n + '/' + total + '</b> Células' +
    '<i>' + (n >= total ? 'El Nodo ya responde: actívalo' : 'El Nodo se abre al recogerlas todas') + '</i>';
}
touch.querySelectorAll('button').forEach(function(btn){
  var k = btn.dataset.k;
  var hold = k === 'left' || k === 'right';
  btn.addEventListener('pointerdown', function(e){ e.preventDefault(); alianzasCtl.input[k] = true; });
  if(hold){
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function(ev){
      btn.addEventListener(ev, function(){ alianzasCtl.input[k] = false; });
    });
  }
});

// What Luma says about each Célula as it's picked up, told like the story
// dialogue (her portrait beside a speech bubble) along the bottom of the
// stage. It doesn't stop the walk: it goes away on its own, on a tap, or
// when the next one comes.
var gemCard = document.createElement('div');
gemCard.className = 'ag-gem-card';
gemCard.setAttribute('role', 'status');
gemCard.setAttribute('aria-live', 'polite');
gemCard.hidden = true;
shell.el.stage.appendChild(gemCard);
gemCard.addEventListener('click', function(){ hideGemCard(); });
var gemTimer = null;
function showGemCard(gem, n, total){
  clearTimeout(gemTimer);
  gemCard.innerHTML = guidePortraitHtml('luma') +
    '<div class="ag-gem-bubble"><div class="ag-gem-who"><b>Luma</b><i>◆ Gema ' + n + ' de ' + total + '</i></div>' +
    '<p>' + (gem.icon ? '<img class="ag-gem-logo" src="' + ENT_IMG + gem.icon + '.webp" alt="">' : '') +
    'Encontraste la gema de <b>' + gem.title + '</b>: ' + gem.text + '</p></div>';
  gemCard.hidden = false;
  gemCard.classList.remove('show'); void gemCard.offsetWidth; gemCard.classList.add('show');
  gemTimer = setTimeout(hideGemCard, 10000);
}
function hideGemCard(){ clearTimeout(gemTimer); gemCard.classList.remove('show'); gemCard.hidden = true; }

var HINTS = [
  'Por cada entidad, pregúntate qué hace por un emprendedor: ¿le <b>enseña y lo acompaña</b>, lo <b>formaliza y lo conecta</b>, o le <b>pone el dinero</b>?',
  'Busca el verbo de cada necesidad: <b>registrar</b>, <b>financiar</b>, <b>asesorar</b>, <b>proteger una marca</b>… Cada contacto hace una sola de esas cosas mejor que nadie.',
  'Piensa en qué necesitas tener listo antes de cada paso: no puedes cargar documentos que aún no redactaste, ni subsanar algo que no has radicado.',
  '¿Cuál de las tres opciones usa todo lo que construiste en las islas anteriores: actores, contactos y ruta?'
];
var PHASE_NAMES = ['Mapa de Actores', 'Directorio de Contactos', 'Ruta de Convocatorias', 'Lienzo de Decisión'];

var game = null;

shell.setHint(
  function(){ return HINTS[game.phase]; },
  function(){ return !game || game.phase < 0 || game.busy; }
);

// Two entities per orbit for the Mapa de Actores, so every orbit gets used.
function pickEntities(){
  var picked = [];
  ORBITS.forEach(function(o){ picked = picked.concat(shuffled(ENTITIES.filter(function(e){ return e.orbit === o.id; })).slice(0, 2)); });
  return shuffled(picked);
}

// On Instituciones the gems are the Mapa de Actores' entities: what each
// one does and which orbit it belongs to.
function entityGems(list){
  return list.map(function(e){
    var orbit = ORBITS.find(function(o){ return o.id === e.orbit; });
    return { title: e.name, icon: e.icon, text: e.does + '. Es un actor de <b>' + orbit.name.toLowerCase() + '</b>.' };
  });
}

// onFinish(score, close, extraCells) runs when the Nodo is purified.
// reward: { cells, badge, firstTime, wallet } from the atlas, shown on the
// final card and in the Células counter.
export function openAlianzas(node, onFinish, reward){
  var cfg = ISLANDS[node.level.id];
  var entities = cfg.phases.indexOf(0) !== -1 ? pickEntities() : null;
  game = {
    node: node, onFinish: onFinish, reward: reward || {}, cfg: cfg, entities: entities,
    gems: shuffled(entities ? entityGems(entities) : cfg.gems).slice(0, CELL_TOTAL),
    step: -1, phase: -1, fails: 0, won: false, cells: 0
  };
  shell.open(node.planet.name + ' · Isla ' + node.level.label, closeAlianzas, game.reward.wallet);
  shell.setTitle((node.galaxy.games[node.id] || {}).title || node.planet.name);
  shell.setPanelHidden(true);
  shell.renderPips(cfg.phases.length, 0, false);
  shell.setRestored(0);
  touch.hidden = false;
  roomHud.hidden = false;
  hideGemCard();
  renderRoomHud(0, CELL_TOTAL);
  alianzasCtl.input = { left: false, right: false, jump: false, act: false };
  alianzasCtl.onCell = function(n, total){
    game.cells = n * CELL_VALUE;
    renderRoomHud(n, total);
    shell.setWallet((game.reward.wallet || 0) + game.cells, CELL_VALUE);
    shell.hideBanner();
    if(game.gems[n - 1]) showGemCard(game.gems[n - 1], n, total);
  };
  alianzasCtl.onInteract = onNodeActivated;
  setDevActions('game', [
    { label: '🚶 Saltar caminata', run: function(){ if(game && game.phase < 0 && !game.walked) onNodeActivated(); } },
    { label: '⏩ Ganar fase', run: function(){
      if(!game || game.phase < 0 || game.won || game.busy) return;
      phaseWon('Fase superada (modo desarrollador)', '<p>Saltaste esta fase.</p>');
    } }
  ]);
  try{
    alianzasCtl.game = shell.startScene(AlianzasScene);
  }catch(err){
    if(window.console) console.error('Alianzas game could not start', err);
    closeAlianzas();
    showToast('No se pudo iniciar el juego. Recarga la página e inténtalo de nuevo.');
    return;
  }
  shell.showBanner('info', 'Distrito Cristalino',
    'Un escudo sella el Nodo: recoge las ' + CELL_TOTAL + ' Células Lógicas para abrirlo, y escucha lo que Luma te cuenta de cada una. Camina con ← → (o A / D) y salta con ↑ (o W).', 8000);
}

function closeAlianzas(){
  setDevActions('game', []);
  hideBoard();
  hideGemCard();
  alianzasCtl.scene = null;
  alianzasCtl.game = null;
  alianzasCtl.onInteract = null;
  alianzasCtl.onCell = null;
  shell.close();
  game = null;
}

// The Nodo is active: Luma frames the problem, the lesson follows,
// and the panel opens on the island's first phase.
function onNodeActivated(){
  var g = game;
  if(!g || g.walked) return;
  g.walked = true;
  touch.hidden = true;
  roomHud.hidden = true;
  hideGemCard();
  if(alianzasCtl.scene) alianzasCtl.scene.showNode();
  showDialogue(g.cfg.nodeLines.map(function(t){ return { who: 'luma', text: t }; }), {
    eyebrow: 'Nodo de Pregunta · ' + (g.node.galaxy.games[g.node.id] || {}).title, doneLabel: 'Activar el Nanocatalizador',
    onDone: function(){
      if(game !== g) return;
      shell.setPanelHidden(false);
      shell.showLesson(g.node.lesson, function(){ if(game === g) startPhase(0); });
    }
  });
}

/* ---------- phases ---------- */

// step: position in the island's phases; phase: which of the four it is.
function startPhase(step){
  var g = game, n = g.cfg.phases.length;
  g.step = step; g.phase = g.cfg.phases[step]; g.won = false; g.busy = false;
  hideBoard();
  shell.el.panel.scrollTop = 0;
  shell.resetHint();
  shell.hideBanner();
  shell.renderPips(n, step, false);
  [setupActores, setupDirectorio, setupRuta, setupDecision][g.phase]();
}

function setGoal(text){
  var n = game.cfg.phases.length;
  shell.el.goal.innerHTML = '<span class="ag-phase-tag">' + (n > 1 ? 'Fase ' + (game.step + 1) + ' de ' + n + ' · ' : '') + PHASE_NAMES[game.phase] + '</span> ' + text;
}

function setBuild(label, enabled){
  elBuild.textContent = label;
  elBuild.disabled = !enabled;
  elBuild.hidden = !label;
}

function isLastStep(){ return game.step === game.cfg.phases.length - 1; }

// A phase cleared: colour comes back, the pip turns green, and the button
// moves on.
function phaseWon(title, html){
  var g = game, n = g.cfg.phases.length;
  g.won = true;
  shell.renderPips(n, g.step, true);
  var restored = (g.step + 1) / n;
  shell.setRestored(restored);
  if(alianzasCtl.scene){ alianzasCtl.scene.setRestored(restored); alianzasCtl.scene.burst(); }
  // the board fades so the restored Nodo (and its new satellites) shows
  boardEl.classList.add('cleared');
  shell.renderFeedback({ kind: 'win', title: title, html: html });
  setBuild(isLastStep() ? '✦ Purificar el Nodo' : 'Siguiente fase →', true);
}

function phaseFailed(title, html){
  game.fails++;
  shell.renderFeedback({ kind: 'fail', title: title, html: html });
  shell.pulseHint();
}

elBuild.addEventListener('click', function(){
  var g = game;
  if(!g || g.phase < 0 || g.busy) return;
  if(g.won){
    if(!isLastStep()) startPhase(g.step + 1);
    else showAlianzasFinal();
    return;
  }
  if(g.check) g.check();
});

/* ---- shared: entity cards you drag onto a board (phases 1 and 2) ---- */
// The board (the radar, or the contact sockets) covers the stage; the cards
// wait on pedestals in the panel's tray. Drag a card to its place — or tap
// it, then tap the place —; tap a placed card to send it back to the tray.
// A hand shows the gesture at the start of the phase and carries the card
// while it's dragged.
var ENT_IMG = 'assets/activa/entities/';
// "touch_app" from Material Icons (Apache 2.0)
var HAND_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"/></svg>';

var boardEl = document.createElement('div');
boardEl.className = 'ag-board';
boardEl.hidden = true;
shell.el.stage.appendChild(boardEl);

var handEl = document.createElement('div');
handEl.className = 'ag-hand';
handEl.innerHTML = HAND_SVG;
handEl.hidden = true;
document.body.appendChild(handEl);
var handAnim = null;

function showBoard(kind){
  boardEl.className = 'ag-board ' + kind;
  boardEl.hidden = false;
  shell.el.root.classList.add('ag-board-mode');
}

function hideBoard(){
  boardEl.hidden = true;
  boardEl.innerHTML = '';
  boardEl.onclick = null;
  shell.el.root.classList.remove('ag-board-mode');
  stopHandHint();
  var ghost = document.querySelector('.ag-ghost');
  if(ghost) ghost.remove();
  document.body.classList.remove('ag-grabbing');
}

// The hand drags the first card of the tray to the board, twice, then
// leaves. Any touch on a card stops it.
function playHandHint(){
  stopHandHint();
  if(!window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var card = elWork.querySelector('.ag-tray .ag-ent');
  var to = boardEl.querySelector('.ag-hand-target') || boardEl;
  if(!card || !handEl.animate) return;
  var a = card.getBoundingClientRect(), b = to.getBoundingClientRect();
  if(!a.width || !b.width) return;
  var x0 = a.left + a.width * .55, y0 = a.top + a.height * .55;
  var x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
  handEl.hidden = false;
  handAnim = handEl.animate([
    { transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(1)', opacity: 0 },
    { transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(1)', opacity: 1, offset: .15 },
    { transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(.85)', opacity: 1, offset: .25 },
    { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(.85)', opacity: 1, offset: .75 },
    { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(1)', opacity: 0 }
  ], { duration: 2200, iterations: 2, delay: 600, easing: 'ease-in-out', fill: 'both' });
  handAnim.onfinish = stopHandHint;
}

function stopHandHint(){
  if(handAnim){ handAnim.onfinish = null; handAnim.cancel(); handAnim = null; }
  handEl.hidden = true;
}

// One card: the logo cut from the designer's mockups, or the name when
// there's no logo yet.
function entCardHtml(it, selected){
  var art = it.icon
    ? '<img src="' + ENT_IMG + it.icon + '.webp" alt="" draggable="false">'
    : '<b' + ((it.short || it.name).length > 12 ? ' class="long"' : '') + '>' + (it.short || it.name) + '</b>';
  return '<button type="button" class="ag-ent' + (it.icon ? '' : ' no-logo') + (it.locked ? ' locked' : '') + (it.wrong ? ' wrong' : '') + (selected ? ' selected' : '') +
    '" data-id="' + it.id + '" aria-label="' + it.name + (it.locked ? ' (ubicada)' : '') + '" title="' + it.name + '">' +
    '<span class="ag-ent-tag" aria-hidden="true">' + (it.locked ? '✓ Activa' : 'Entidad') + '</span>' +
    '<span class="ag-ent-art" aria-hidden="true">' + art + '</span>' +
    (it.icon && !it.logoText ? '<span class="ag-ent-name" aria-hidden="true">' + (it.short || it.name) + '</span>' : '') +
    '</button>';
}

// o: { items: [{ id, name, icon, short, logoText }], single (one card per
// target), boardHtml(b, cardHtml), targetAt(x, y) → target id or null,
// onChange(b) }
function makeBoard(o){
  var b = { items: o.items.map(function(it){ return Object.assign({ slot: null, locked: false, wrong: false }, it); }), selected: null };
  var hinted = false;
  function itemById(id){ return b.items.find(function(it){ return it.id === id; }); }
  function cardHtml(it){ return entCardHtml(it, b.selected === it.id); }

  function place(it, target){
    if(!it || it.locked) return;
    if(o.single){
      if(b.items.some(function(x){ return x.slot === target && x.locked; })) return;
      b.items.forEach(function(x){ if(x.slot === target && x !== it) x.slot = null; });
    }
    it.slot = target; it.wrong = false; b.selected = null;
    render();
  }

  function tap(it){
    if(!it || it.locked) return;
    if(it.slot){ it.slot = null; it.wrong = false; b.selected = null; }
    else b.selected = b.selected === it.id ? null : it.id;
    render();
  }

  function highlight(target){
    boardEl.querySelectorAll('[data-zone]').forEach(function(z){ z.classList.toggle('over', z.dataset.zone === target); });
  }

  function startDrag(e, ent, it){
    e.preventDefault();
    stopHandHint();
    shell.hideHint(); // it covers the bottom of the board
    var sx = e.clientX, sy = e.clientY, ghost = null, over = null;
    var w = ent.offsetWidth, h = ent.offsetHeight;
    function onMove(ev){
      if(!ghost){
        if(Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 6) return;
        ghost = ent.cloneNode(true);
        ghost.classList.add('ag-ghost');
        ghost.classList.remove('selected', 'wrong');
        ghost.style.width = w + 'px';
        ghost.style.height = h + 'px';
        ghost.insertAdjacentHTML('beforeend', '<span class="ag-ghost-hand">' + HAND_SVG + '</span>');
        document.body.appendChild(ghost);
        ent.classList.add('lifted');
        document.body.classList.add('ag-grabbing');
      }
      ghost.style.transform = 'translate(' + (ev.clientX - w / 2) + 'px,' + (ev.clientY - h / 2) + 'px) rotate(-4deg)';
      var t = o.targetAt(ev.clientX, ev.clientY);
      if(t !== over){ over = t; highlight(t); }
    }
    function onUp(ev){
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      document.body.classList.remove('ag-grabbing');
      if(!ghost){ if(ev.type === 'pointerup') tap(it); return; }
      ghost.remove();
      var t = ev.type === 'pointerup' ? o.targetAt(ev.clientX, ev.clientY) : null;
      if(t){ place(it, t); return; }
      // dropped anywhere else: a placed card goes back to the tray
      if(it.slot && ev.type === 'pointerup'){ it.slot = null; it.wrong = false; }
      render();
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }

  function render(){
    boardEl.innerHTML = o.boardHtml(b, cardHtml);
    var tray = b.items.filter(function(it){ return !it.slot; });
    elWork.innerHTML = '<div class="ag-tray-head">Entidades por clasificar</div><div class="ag-tray">' + (tray.length
      ? tray.map(function(it){ return '<div class="ag-ped">' + cardHtml(it) + '</div>'; }).join('')
      : '<span class="ag-tray-empty">Todo ubicado. Verifica tu red.</span>') + '</div>';
    [boardEl, elWork].forEach(function(root){
      root.querySelectorAll('.ag-ent').forEach(function(ent){
        var it = itemById(ent.dataset.id);
        ent.addEventListener('pointerdown', function(e){
          if(e.button > 0 || game.busy || game.won || it.locked) return;
          startDrag(e, ent, it);
        });
        // keyboard (Enter / Space): select, then choose the place
        ent.addEventListener('click', function(e){ if(e.detail === 0 && !game.won) tap(it); });
      });
    });
    // once the phase is won the button reads "Siguiente fase"; leave it be
    if(!game.won) o.onChange(b);
  }

  // tap (or Enter on) a place with a card selected
  boardEl.onclick = function(e){
    if(!b.selected || game.won || e.target.closest('.ag-ent')) return;
    var zone = e.target.closest('[data-target]');
    var t = e.detail === 0 ? (zone && zone.dataset.target) : o.targetAt(e.clientX, e.clientY);
    if(t) place(itemById(b.selected), t);
  };

  b.render = function(){
    render();
    if(!hinted){ hinted = true; requestAnimationFrame(playHandHint); }
  };
  return b;
}

// The zone under a point: an element marked data-target on the board.
function zoneAt(x, y){
  var el = document.elementFromPoint(x, y);
  var z = el && el.closest('[data-target]');
  return z && boardEl.contains(z) ? z.dataset.target : null;
}

/* ---- phase 1: Mapa de Actores ---- */
// The radar: three nested orbits drawn as ellipses (viewBox 1000×540,
// centred), Formación inside, Financiación outside. A card dropped on the
// radar goes to the band under it; placed cards sit along their band.
var RADAR = { w: 1000, h: 540, cx: 500, cy: 284 };
var RINGS = { form: { rx: 175, ry: 92, at: .55 }, legal: { rx: 330, ry: 172, at: .77 }, fin: { rx: 480, ry: 252, at: .845 } };

function radarHtml(b, cardHtml){
  var C = RADAR;
  var svg = '<svg class="ag-radar-svg" viewBox="0 0 ' + C.w + ' ' + C.h + '" preserveAspectRatio="none" aria-hidden="true">';
  ['fin', 'legal', 'form'].forEach(function(id){
    var o = ORBITS.find(function(x){ return x.id === id; }), R = RINGS[id];
    svg += '<ellipse class="ag-ring" data-zone="' + id + '" cx="' + C.cx + '" cy="' + C.cy + '" rx="' + R.rx + '" ry="' + R.ry + '" style="--ring:' + o.color + '"/>';
  });
  // the radar grid and sweep, inside Formación
  var F = RINGS.form;
  svg += '<g class="ag-radar-grid" transform="translate(' + C.cx + ' ' + C.cy + ') scale(1 ' + (F.ry / F.rx) + ')">' +
    '<circle r="' + (F.rx * .33) + '"/><circle r="' + (F.rx * .66) + '"/>' +
    '<line x1="' + -F.rx + '" x2="' + F.rx + '"/><line y1="' + -F.rx + '" y2="' + F.rx + '"/>' +
    '<line x1="' + -F.rx * .7 + '" y1="' + -F.rx * .7 + '" x2="' + F.rx * .7 + '" y2="' + F.rx * .7 + '"/><line x1="' + F.rx * .7 + '" y1="' + -F.rx * .7 + '" x2="' + -F.rx * .7 + '" y2="' + F.rx * .7 + '"/>' +
    '<g class="ag-sweep"><path d="M0 0 L' + F.rx + ' 0 A' + F.rx + ' ' + F.rx + ' 0 0 0 ' + (F.rx * Math.cos(-0.7)) + ' ' + (F.rx * Math.sin(-0.7)) + ' Z"/></g>' +
    '</g></svg>';

  var labels = ORBITS.map(function(o){
    var R = RINGS[o.id];
    return '<button type="button" class="ag-orbit-label" data-target="' + o.id + '" data-zone="' + o.id + '" style="--ring:' + o.color + ';top:' + ((C.cy - R.ry) / C.h * 100) + '%">' + o.name + '</button>';
  }).join('');

  // placed cards spread along their band, skipping the top (the labels)
  var cards = '';
  ORBITS.forEach(function(o){
    var R = RINGS[o.id], here = b.items.filter(function(it){ return it.slot === o.id; });
    here.forEach(function(it, i){
      // a lone card sits in the centre (Formación) or to one side, so it
      // never stacks under the one in the middle
      var deg = here.length === 1 ? { form: 90, legal: 180, fin: 0 }[o.id] : 300 + (i + .5) * 300 / here.length;
      var s = here.length === 1 && o.id === 'form' ? 0 : R.at;
      var x = C.cx + R.rx * s * Math.cos(deg * Math.PI / 180), y = C.cy + R.ry * s * Math.sin(deg * Math.PI / 180);
      cards += '<div class="ag-placed" style="left:' + (x / C.w * 100) + '%;top:' + (y / C.h * 100) + '%">' + cardHtml(it) + '</div>';
    });
  });

  return '<div class="ag-radar">' + svg + labels + '<span class="ag-hand-target" style="left:50%;top:' + (C.cy / C.h * 100) + '%"></span>' + cards + '</div>';
}

function radarTargetAt(x, y){
  var z = zoneAt(x, y);
  if(z) return z;
  var radar = boardEl.querySelector('.ag-radar');
  if(!radar) return null;
  var r = radar.getBoundingClientRect();
  var px = (x - r.left) / r.width * RADAR.w - RADAR.cx, py = (y - r.top) / r.height * RADAR.h - RADAR.cy;
  var hit = ['form', 'legal', 'fin'].find(function(id){
    var R = RINGS[id];
    return (px * px) / (R.rx * R.rx) + (py * py) / (R.ry * R.ry) <= 1;
  });
  return hit || null;
}

function setupActores(){
  var g = game;
  var picked = g.entities; // the ones met as gems on the walk
  setGoal('Analiza la naturaleza de cada entidad y arrástrala a su órbita correspondiente para calibrar la red de apoyo del ecosistema.');
  shell.renderFeedback(null, '<p class="fb-idle"><span><b>Las tres órbitas del conocimiento:</b> quienes <strong>forman</strong> y potencian el talento, quienes <strong>formalizan</strong> y estructuran el tejido legal, y quienes <strong>financian</strong> la materialización de las ideas.</span></p>');
  showBoard('radar');
  var board = makeBoard({
    items: picked,
    single: false,
    boardHtml: radarHtml,
    targetAt: radarTargetAt,
    onChange: function(b){ setBuild('Verificar mapa', b.items.every(function(it){ return it.slot; })); }
  });
  board.render();
  g.check = function(){
    var wrong = [];
    board.items.forEach(function(it){
      if(it.locked) return;
      var ent = ENTITIES.find(function(e){ return e.id === it.id; });
      if(it.slot === ent.orbit){
        it.locked = true;
        var oi = ORBITS.findIndex(function(o){ return o.id === ent.orbit; });
        if(alianzasCtl.scene) alianzasCtl.scene.addSatellite(oi, ORBITS[oi].color);
      } else {
        it.wrong = true;
        wrong.push({ ent: ent, chosen: ORBITS.find(function(o){ return o.id === it.slot; }) });
        it.slot = null;
      }
    });
    board.render();
    if(!wrong.length){
      phaseWon('¡Mapa de actores estabilizado!', '<p>Conexión establecida con éxito. Las órbitas fluyen en armonía: has comprendido el rol exacto de quienes <strong>forman, formalizan y financian</strong> en el territorio. ¡Un paso más hacia la purificación del nodo!</p>');
      return;
    }
    phaseFailed(wrong.length === 1 ? 'Una entidad quedó en otra órbita' : wrong.length + ' entidades quedaron en otra órbita',
      '<ul class="ag-why">' + wrong.map(function(w){
        return '<li><b>' + w.ent.name + '</b> no va en <i>' + w.chosen.short + '</i>: ' + w.ent.does + '.</li>';
      }).join('') + '</ul><p class="ag-tip">Las que acertaste quedaron fijas. Vuelve a ubicar las que regresaron a la bandeja.</p>');
  };
}

/* ---- phase 2: Directorio de Contactos ---- */
// Four needs, each a terminal with a socket for one contact card.
function socketsHtml(needs){
  return function(b, cardHtml){
    return '<div class="ag-needs">' + needs.map(function(n, i){
      var it = b.items.find(function(x){ return x.slot === 'n' + i; });
      return '<div class="ag-need' + (it && it.locked ? ' linked' : '') + '" data-target="n' + i + '" data-zone="n' + i + '">' +
        '<p>' + n.text + '</p>' +
        '<div class="ag-socket">' + (it ? cardHtml(it) : '<span>Arrastra aquí</span>') + (i === 0 ? '<i class="ag-hand-target"></i>' : '') + '</div>' +
        '</div>';
    }).join('') + '</div>';
  };
}

function setupDirectorio(){
  var g = game;
  var needs = shuffled(NEEDS).slice(0, 4);
  var used = needs.map(function(n){ return n.contact; });
  var decoys = shuffled(CONTACTS.filter(function(c){ return used.indexOf(c.id) === -1; })).slice(0, 2);
  var contacts = shuffled(CONTACTS.filter(function(c){ return used.indexOf(c.id) !== -1; }).concat(decoys));
  setGoal('Arrastra hasta cada necesidad del proyecto el contacto del ecosistema que la resuelve. Sobran dos contactos.');
  shell.renderFeedback(null, '<p class="fb-idle"><span>Cada acierto tiende un <strong>hilo de luz</strong> entre el Nodo y ese aliado.</span></p>');
  showBoard('sockets');
  var board = makeBoard({
    items: contacts,
    single: true,
    boardHtml: socketsHtml(needs),
    targetAt: zoneAt,
    onChange: function(b){ setBuild('Verificar contactos', needs.every(function(n, i){ return b.items.some(function(it){ return it.slot === 'n' + i; }); })); }
  });
  board.render();
  g.check = function(){
    var wrong = [];
    needs.forEach(function(n, i){
      var it = board.items.find(function(x){ return x.slot === 'n' + i; });
      if(!it || it.locked) return;
      if(it.id === n.contact){
        it.locked = true;
        if(alianzasCtl.scene) alianzasCtl.scene.addThread();
      } else {
        wrong.push(n);
        it.wrong = true; it.slot = null;
      }
    });
    board.render();
    if(!wrong.length){
      phaseWon('¡Conexiones establecidas!', '<p>El mapa de contactos fluye sin interferencias. Has comprendido la regla de oro del ecosistema: el éxito de un emprendimiento radica en <strong>conectar cada desafío con el aliado correcto</strong>.</p>');
      return;
    }
    // Point at the kind of entity each need calls for, never at the card.
    phaseFailed(wrong.length === 1 ? 'Una conexión fuera de frecuencia' : wrong.length + ' conexiones fuera de frecuencia',
      '<ul class="ag-why">' + wrong.map(function(n, k){
        return '<li>Para «' + n.text.replace(/\.$/, '') + '», ' +
          (k % 2 ? 'el contacto elegido opera en una frecuencia distinta' : 'el contacto asignado cumple otro rol estratégico en el distrito') +
          '; ' + n.clue + '.</li>';
      }).join('') + '</ul>');
  };
}

/* ---- phase 3: Ruta de Convocatorias ---- */
// The steps form a column, first at the top. Drag a step (or focus it and
// use ↑ ↓) to move it. "Postular" walks the application down the column:
// each step in its place lights up green, and the walk stops on the first
// one out of place, which turns red — like the bridge growing until it
// falls short.
var STEP_MS = 650;

function setupRuta(){
  var g = game;
  var order = STEPS.map(function(s, i){ return i; });
  do { order = shuffled(order); } while(order.every(function(v, i){ return v === i; }));
  var marks = []; // per position: '', 'ok', 'bad'
  setGoal('Secuencia la ruta de convocatorias organizando los pasos del primero al último. Una vez alineados, procede a postular el proyecto.');
  shell.renderFeedback(null, '<p class="fb-idle">Al simular la postulación, el protocolo evaluará la secuencia de arriba a abajo. Si un paso no corresponde a su momento, el flujo se interrumpirá.</p>');

  function move(from, to){
    if(to < 0 || to >= order.length || from === to) return;
    var it = order.splice(from, 1)[0];
    order.splice(to, 0, it);
    marks = [];
    render();
  }

  function render(focusPos){
    elWork.innerHTML = '<ol class="ag-route" aria-label="Ruta de postulación, del primer al último paso">' + order.map(function(si, pos){
      return '<li class="ag-step' + (marks[pos] ? ' ' + marks[pos] : '') + '" data-pos="' + pos + '" tabindex="0" ' +
        'aria-label="Paso ' + (pos + 1) + ': ' + STEPS[si].title + '. Usa flecha arriba o abajo para moverlo.">' +
        '<span class="ag-grip" aria-hidden="true">⋮⋮</span>' +
        '<span class="ag-step-n">' + (pos + 1) + '</span>' +
        '<span class="ag-step-t"><b>' + STEPS[si].title + '</b><i>' + STEPS[si].desc + '</i></span>' +
        '<span class="ag-step-mark" aria-hidden="true">' + (marks[pos] === 'ok' ? '✓' : (marks[pos] === 'bad' ? '✕' : '')) + '</span></li>';
    }).join('') + '</ol>';
    var rows = [].slice.call(elWork.querySelectorAll('.ag-step'));
    rows.forEach(function(row){
      var pos = +row.dataset.pos;
      row.addEventListener('keydown', function(e){
        if(g.busy) return;
        if(e.key === 'ArrowUp' && pos > 0){ e.preventDefault(); move(pos, pos - 1); render(pos - 1); }
        if(e.key === 'ArrowDown' && pos < order.length - 1){ e.preventDefault(); move(pos, pos + 1); render(pos + 1); }
      });
      row.addEventListener('pointerdown', function(e){ if(!g.busy) startDrag(e, row, rows); });
    });
    if(focusPos != null) rows[focusPos].focus();
  }

  // Pointer drag: the row follows the pointer, the others slide out of its
  // way, and on release the order is updated. On short screens the panel
  // scrolls, so holding the row near its top or bottom edge scrolls it too.
  function startDrag(e, row, rows){
    e.preventDefault();
    var from = +row.dataset.pos, startY = e.clientY, lastY = e.clientY;
    var panel = shell.el.panel, startScroll = panel.scrollTop;
    var pitch = rows.length > 1 ? rows[1].getBoundingClientRect().top - rows[0].getBoundingClientRect().top : row.offsetHeight;
    var to = from;
    row.classList.add('dragging');
    try{ row.setPointerCapture(e.pointerId); }catch(err){ /* pointer already gone */ }
    var edgeTimer = setInterval(function(){
      var r = panel.getBoundingClientRect(), edge = 48;
      var step = lastY < r.top + edge ? -8 : (lastY > r.bottom - edge - 60 ? 8 : 0);
      if(!step) return;
      var before = panel.scrollTop;
      panel.scrollTop += step;
      if(panel.scrollTop !== before) onMove({ clientY: lastY });
    }, 16);
    function onMove(ev){
      lastY = ev.clientY;
      var dy = ev.clientY - startY + (panel.scrollTop - startScroll);
      row.style.transform = 'translateY(' + dy + 'px)';
      to = Math.max(0, Math.min(rows.length - 1, Math.round(from + dy / pitch)));
      rows.forEach(function(r, i){
        if(r === row) return;
        var shift = (i > from && i <= to) ? -pitch : ((i < from && i >= to) ? pitch : 0);
        r.style.transform = shift ? 'translateY(' + shift + 'px)' : '';
      });
    }
    function onUp(){
      clearInterval(edgeTimer);
      row.removeEventListener('pointermove', onMove);
      row.removeEventListener('pointerup', onUp);
      row.removeEventListener('pointercancel', onUp);
      if(to !== from) move(from, to);
      else { row.classList.remove('dragging'); row.style.transform = ''; }
    }
    row.addEventListener('pointermove', onMove);
    row.addEventListener('pointerup', onUp);
    row.addEventListener('pointercancel', onUp);
  }

  render();
  setBuild('🚀 Postular', true);
  g.check = function(){
    g.busy = true;
    elBuild.disabled = true;
    marks = [];
    render();
    shell.renderFeedback({ kind: 'info', title: 'Postulando…', html: '<p>La propuesta avanza por la ruta.</p>' }, '');
    var pos = 0;
    (function nextStep(){
      if(game !== g || g.phase !== 2) return;
      var ok = order[pos] === pos;
      marks[pos] = ok ? 'ok' : 'bad';
      render();
      if(ok && pos < order.length - 1){ pos++; setTimeout(nextStep, STEP_MS); return; }
      setTimeout(function(){
        if(game !== g || g.phase !== 2) return;
        g.busy = false;
        elBuild.disabled = false;
        if(ok){
          phaseWon('¡Convocatoria ganada!', '<p>' + STEPS[STEPS.length - 1].ok + '</p>');
          return;
        }
        var reached = pos ? '<p class="ag-tip">✓ La propuesta superó ' + (pos === 1 ? 'el primer paso' : 'los primeros ' + pos + ' pasos') + '.</p>' : '';
        phaseFailed('La postulación se detuvo en el paso ' + (pos + 1), '<p>' + STEPS[pos].bad + '</p>' + reached);
      }, STEP_MS * 0.6);
    })();
  };
}

/* ---- phase 4: Lienzo de Decisión ---- */
function setupDecision(){
  var g = game;
  var cards = shuffled(CARDS);
  var tried = {}, chosen = null;
  setGoal('Elige la estrategia con la que el proyecto saldrá adelante.');
  shell.renderFeedback(null, '<p class="fb-idle">Las tres son posibles, pero solo una disipa la neblina por completo.</p>');
  setBuild('', false);
  // A chosen card turns over its result: a stamp and the supports it brings.
  function cardHtml(c, i){
    var state = chosen === c.id ? ' chosen' : (tried[c.id] ? ' tried' : '');
    var open = chosen === c.id || tried[c.id];
    return '<button type="button" class="ag-card' + state + '" data-i="' + i + '"' + (open || g.won ? ' disabled' : '') + '>' +
      '<span class="ag-card-top"><span class="ag-card-letter">' + 'ABC'[i] + '</span>' +
        (open ? '<span class="ag-card-stamp">' + (chosen === c.id ? '✓ Estrategia elegida' : '✗ Se queda corta') + '</span>' : '') +
        '<span class="ag-card-icon" aria-hidden="true">' + c.icon + '</span></span>' +
      '<b class="ag-card-title">' + c.title + '</b>' +
      '<span class="ag-card-text">' + c.text + '</span>' +
      (open
        ? '<span class="ag-card-covers">' + SUPPORTS.map(function(sp){
            var has = c.covers.indexOf(sp.id) !== -1;
            return '<span class="' + (has ? 'yes' : 'no') + '">' + (has ? '✓ ' : '✗ ') + sp.name + '</span>';
          }).join('') + '</span>'
        : '<span class="ag-card-pick">Elegir esta estrategia</span>') +
      '</button>';
  }
  function render(){
    elWork.innerHTML = '<div class="ag-cards' + (g.won ? ' won' : '') + '">' + cards.map(cardHtml).join('') + '</div>';
    elWork.querySelectorAll('.ag-card').forEach(function(btn){
      btn.addEventListener('click', function(){
        var c = cards[+btn.dataset.i];
        if(c.win){
          chosen = c.id;
          phaseWon('¡La neblina se disipa!', '<p>' + c.result + '</p>');
          render(); // g.won now locks every card
          return;
        }
        tried[c.id] = true;
        render();
        phaseFailed('Esa estrategia se queda corta', '<p>' + c.result + '</p>');
      });
    });
  }
  render();
}

/* ---------- final ---------- */
function showAlianzasFinal(){
  var g = game, r = g.reward, n = g.cfg.phases.length;
  if(alianzasCtl.scene){ alianzasCtl.scene.setRestored(1); alianzasCtl.scene.burst(); }
  shell.setWallet((r.wallet || 0) + (r.cells || 0) + g.cells, r.cells || 0);
  shell.showFinal({
    icon: '✦', title: '¡Nodo purificado!', total: n, unit: n === 1 ? 'fase' : 'fases', article: 'las', fails: g.fails,
    luma: g.cfg.luma, recap: g.cfg.recap,
    rewardsHtml: shell.rewardsHtml(r, g.cells),
    onContinue: function(){ g.onFinish(g.fails, closeAlianzas, g.cells); }
  });
}
