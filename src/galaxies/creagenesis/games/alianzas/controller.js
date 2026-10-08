import { ORBITS, ENTITIES, CONTACTS, NEEDS, STEPS, CARDS } from './content.js';
import { AlianzasScene, alianzasCtl, CELL_COUNT } from './scene.js';
import { shuffled } from '../../../../shared/random.js';
import { showToast } from '../../../../shared/toast.js';
import { showDialogue } from '../../../../shared/dialogue.js';
import { createShell } from '../../../../shared/game/shell.js';
import { setDevActions } from '../../../../shared/dev.js';

// El Vacío de Alianzas. The player first walks through the Distrito
// Cristalino to the corrupted Nodo (scene.js) and activates it; then the
// Nodo's challenge runs in four phases in the panel:
//   1. Mapa de Actores — sort entities into their orbit
//   2. Directorio de Contactos — match each need to its contact
//   3. Ruta de Convocatorias — put the steps of a call in order
//   4. Lienzo de Decisión — choose the strategy
// Every check with a mistake counts as a failed try (for the stars); the
// feedback says what each misplaced piece actually does, not where it goes.

var CELL_VALUE = 10; // Células Lógicas per crystal picked up in the room
var CELL_TOTAL = CELL_COUNT;

var shell = createShell({
  id: 'alianzas-game', emblem: '◇', title: 'El Vacío de Alianzas',
  pipsLabel: 'Fases del Nodo', hintThinking: 'Aura analiza tu red',
  panelHtml:
    '<div class="gm-goal"></div>' +
    '<div class="ag-work"></div>' +
    '<div class="gm-feedback" role="status" aria-live="polite"></div>' +
    '<div class="gm-actions">' +
      '<button type="button" class="ai-btn gm-hint-btn">◈ Pregúntale a Aura</button>' +
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

var HINTS = [
  'Por cada entidad, pregúntate qué hace por un emprendedor: ¿le <b>enseña y lo acompaña</b>, lo <b>formaliza y lo conecta</b>, o le <b>pone el dinero</b>?',
  'Busca el verbo de cada necesidad: <b>registrar</b>, <b>financiar</b>, <b>asesorar</b>, <b>proteger una marca</b>… Cada contacto hace una sola de esas cosas mejor que nadie.',
  'Piensa en qué necesitas tener listo antes de cada paso: no puedes cargar documentos que aún no redactaste, ni subsanar algo que no has radicado.',
  '¿Cuál de las tres opciones usa todo lo que construiste en las fases anteriores: actores, contactos y ruta?'
];
var PHASE_NAMES = ['Mapa de Actores', 'Directorio de Contactos', 'Ruta de Convocatorias', 'Lienzo de Decisión'];

var game = null;

shell.setHint(
  function(){ return HINTS[game.phase]; },
  function(){ return !game || game.phase < 0 || game.busy; }
);

// onFinish(score, close, extraCells) runs when the Nodo is purified.
// reward: { cells, badge, firstTime } from the atlas, shown on the final card.
export function openAlianzas(node, onFinish, reward){
  game = { node: node, onFinish: onFinish, reward: reward || {}, phase: -1, fails: 0, won: false, cells: 0 };
  shell.open(node.planet.name + ' · Isla ' + node.level.label, closeAlianzas);
  shell.setPanelHidden(true);
  shell.renderPips(PHASE_NAMES.length, 0, false);
  shell.setRestored(0);
  touch.hidden = false;
  roomHud.hidden = false;
  renderRoomHud(0, CELL_TOTAL);
  alianzasCtl.input = { left: false, right: false, jump: false, act: false };
  alianzasCtl.onCell = function(n, total){
    game.cells = n * CELL_VALUE;
    renderRoomHud(n, total);
    if(n >= total){
      shell.showBanner('win', '¡El Nodo responde!', 'Reuniste todas las Células y el escudo cayó. Sube hasta el Nodo y actívalo con E / Espacio.', 6000);
    } else {
      showToast('◆ +' + CELL_VALUE + ' Células Lógicas · ' + n + '/' + total);
    }
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
    'Un escudo sella el Nodo: recoge las ' + CELL_TOTAL + ' Células Lógicas para abrirlo. Camina con ← → (o A / D) y salta con ↑ (o W).', 8000);
}

function closeAlianzas(){
  setDevActions('game', []);
  alianzasCtl.scene = null;
  alianzasCtl.game = null;
  alianzasCtl.onInteract = null;
  alianzasCtl.onCell = null;
  shell.close();
  game = null;
}

// The Nodo is active: Luma and Aura frame the problem, the lesson follows,
// and the panel opens on the first phase.
function onNodeActivated(){
  var g = game;
  if(!g || g.walked) return;
  g.walked = true;
  touch.hidden = true;
  roomHud.hidden = true;
  if(alianzasCtl.scene) alianzasCtl.scene.showNode();
  showDialogue([
    { who: 'luma', text: 'Sintonizador, este nodo se apagó porque los emprendedores del distrito intentan avanzar solos, aislados. La Neblina Gris se alimenta de la falta de alianzas.' },
    { who: 'aura', text: 'Para restaurarlo hay que mapear a los aliados del ecosistema y tejer una red de apoyo. El reto: <b>¿cómo fortalecer este proyecto de economía circular para que tenga apoyo técnico, comercial y financiero?</b>' }
  ], {
    eyebrow: 'Nodo de Pregunta · El Vacío de Alianzas', doneLabel: 'Activar el Nanocatalizador',
    onDone: function(){
      if(game !== g) return;
      shell.setPanelHidden(false);
      shell.showLesson(g.node.lesson, function(){ if(game === g) startPhase(0); });
    }
  });
}

/* ---------- phases ---------- */

function startPhase(i){
  var g = game;
  g.phase = i; g.won = false; g.busy = false;
  shell.resetHint();
  shell.hideBanner();
  shell.renderPips(PHASE_NAMES.length, i, false);
  [setupActores, setupDirectorio, setupRuta, setupDecision][i]();
}

function setGoal(text){
  shell.el.goal.innerHTML = '<span class="ag-phase-tag">Fase ' + (game.phase + 1) + ' de 4 · ' + PHASE_NAMES[game.phase] + '</span> ' + text;
}

function setBuild(label, enabled){
  elBuild.textContent = label;
  elBuild.disabled = !enabled;
  elBuild.hidden = !label;
}

// A phase cleared: colour comes back, the pip turns green, and the button
// moves on.
function phaseWon(title, html){
  var g = game;
  g.won = true;
  shell.renderPips(PHASE_NAMES.length, g.phase, true);
  var restored = (g.phase + 1) / PHASE_NAMES.length;
  shell.setRestored(restored);
  if(alianzasCtl.scene){ alianzasCtl.scene.setRestored(restored); alianzasCtl.scene.burst(); }
  shell.renderFeedback({ kind: 'win', title: title, html: html });
  setBuild(g.phase === PHASE_NAMES.length - 1 ? '✦ Purificar el Nodo' : 'Siguiente fase →', true);
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
    if(g.phase < PHASE_NAMES.length - 1) startPhase(g.phase + 1);
    else showAlianzasFinal();
    return;
  }
  if(g.check) g.check();
});

/* ---- shared: cards you place into slots (phases 1 and 2) ---- */
// items: [{ id, label }], slots: [{ id, label, color }], single: one item
// per slot. Tap a card, then a slot (or drag it there); tap a placed card
// to send it back.
function makeBoard(items, slots, single, onChange){
  var b = { items: items.map(function(it){ return Object.assign({ slot: null, locked: false, wrong: false }, it); }), slots: slots, selected: null };
  function itemById(id){ return b.items.find(function(it){ return it.id === id; }); }
  function place(id, slotId){
    var it = itemById(id);
    if(!it || it.locked) return;
    if(single){
      b.items.forEach(function(o){ if(o.slot === slotId && !o.locked && o !== it) o.slot = null; });
      if(b.items.some(function(o){ return o.slot === slotId && o.locked; })) return;
    }
    it.slot = slotId; it.wrong = false; b.selected = null;
    render();
  }
  function chipHtml(it){
    return '<button type="button" class="ag-chip' + (it.locked ? ' locked' : '') + (it.wrong ? ' wrong' : '') + (b.selected === it.id ? ' selected' : '') +
      '" data-id="' + it.id + '" draggable="' + (!it.locked) + '">' + it.label + '</button>';
  }
  function render(){
    var tray = b.items.filter(function(it){ return !it.slot; });
    var html = '<div class="ag-slots' + (single ? ' single' : '') + '">';
    b.slots.forEach(function(sl){
      html += '<div class="ag-slot" data-slot="' + sl.id + '" style="--slot:' + (sl.color || 'var(--cyan)') + '">' +
        '<div class="ag-slot-label">' + sl.label + '</div><div class="ag-slot-items">' +
        b.items.filter(function(it){ return it.slot === sl.id; }).map(chipHtml).join('') +
        (single && !b.items.some(function(it){ return it.slot === sl.id; }) ? '<span class="ag-drop">Toca o arrastra aquí</span>' : '') +
        '</div></div>';
    });
    html += '</div><div class="ag-tray">' + (tray.length ? tray.map(chipHtml).join('') : '<span class="ag-tray-empty">Todo ubicado. Verifica tu red.</span>') + '</div>';
    elWork.innerHTML = html;
    elWork.querySelectorAll('.ag-chip').forEach(function(ch){
      ch.addEventListener('click', function(e){
        e.stopPropagation();
        var it = itemById(ch.dataset.id);
        if(it.locked) return;
        if(it.slot){ it.slot = null; it.wrong = false; b.selected = null; }
        else b.selected = b.selected === it.id ? null : it.id;
        render();
      });
      ch.addEventListener('dragstart', function(e){ e.dataTransfer.setData('text/plain', ch.dataset.id); });
    });
    elWork.querySelectorAll('.ag-slot').forEach(function(sl){
      sl.addEventListener('click', function(){ if(b.selected) place(b.selected, sl.dataset.slot); });
      sl.addEventListener('dragover', function(e){ e.preventDefault(); sl.classList.add('over'); });
      sl.addEventListener('dragleave', function(){ sl.classList.remove('over'); });
      sl.addEventListener('drop', function(e){ e.preventDefault(); sl.classList.remove('over'); place(e.dataTransfer.getData('text/plain'), sl.dataset.slot); });
    });
    onChange(b);
  }
  b.render = render;
  render();
  return b;
}

/* ---- phase 1: Mapa de Actores ---- */
function setupActores(){
  var g = game;
  // two entities per orbit, so every orbit gets used
  var picked = [];
  ORBITS.forEach(function(o){ picked = picked.concat(shuffled(ENTITIES.filter(function(e){ return e.orbit === o.id; })).slice(0, 2)); });
  picked = shuffled(picked);
  setGoal('Ubica cada entidad en la órbita que le corresponde según su rol en el ecosistema.');
  shell.renderFeedback(null, '<p class="fb-idle"><b>Las tres órbitas:</b> quienes <b>forman</b> y acompañan, quienes <b>formalizan</b> y conectan, y quienes <b>financian</b>.</p>');
  var board = makeBoard(
    picked.map(function(e){ return { id: e.id, label: e.name }; }),
    ORBITS.map(function(o){ return { id: o.id, label: o.name, color: o.color }; }),
    false,
    function(b){ setBuild('Verificar mapa', b.items.every(function(it){ return it.slot; })); }
  );
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
      phaseWon('¡Mapa de actores completo!', '<p>Cada entidad quedó en su órbita. Ya sabes <b>quién forma, quién formaliza y quién financia</b> en este distrito.</p>');
      return;
    }
    phaseFailed(wrong.length === 1 ? 'Una entidad quedó en otra órbita' : wrong.length + ' entidades quedaron en otra órbita',
      '<ul class="ag-why">' + wrong.map(function(w){
        return '<li><b>' + w.ent.name + '</b> no va en <i>' + w.chosen.short + '</i>: ' + w.ent.does + '.</li>';
      }).join('') + '</ul><p class="ag-tip">Las que acertaste quedaron fijas. Vuelve a ubicar las que regresaron a la bandeja.</p>');
  };
}

/* ---- phase 2: Directorio de Contactos ---- */
function setupDirectorio(){
  var g = game;
  var needs = shuffled(NEEDS).slice(0, 4);
  var used = needs.map(function(n){ return n.contact; });
  var decoys = shuffled(CONTACTS.filter(function(c){ return used.indexOf(c.id) === -1; })).slice(0, 2);
  var contacts = shuffled(CONTACTS.filter(function(c){ return used.indexOf(c.id) !== -1; }).concat(decoys));
  setGoal('Conecta cada necesidad del proyecto con el contacto del ecosistema que la resuelve. Sobran dos contactos.');
  shell.renderFeedback(null, '<p class="fb-idle">Cada acierto tiende un <b>hilo de luz</b> entre el Nodo y ese aliado.</p>');
  var board = makeBoard(
    contacts.map(function(c){ return { id: c.id, label: c.name }; }),
    needs.map(function(n, i){ return { id: 'n' + i, label: n.text, color: '#e8b84b' }; }),
    true,
    function(b){ setBuild('Verificar contactos', b.slots.every(function(sl){ return b.items.some(function(it){ return it.slot === sl.id; }); })); }
  );
  g.check = function(){
    var wrong = [];
    needs.forEach(function(n, i){
      var it = board.items.find(function(x){ return x.slot === 'n' + i; });
      if(!it || it.locked) return;
      if(it.id === n.contact){
        it.locked = true;
        if(alianzasCtl.scene) alianzasCtl.scene.addThread();
      } else {
        var c = CONTACTS.find(function(x){ return x.id === it.id; });
        wrong.push({ need: n, contact: c });
        it.wrong = true; it.slot = null;
      }
    });
    board.render();
    if(!wrong.length){
      phaseWon('¡Directorio conectado!', '<p>Cada necesidad tiene ahora a quién acudir. Una red de apoyo es eso: <b>saber a qué puerta tocar</b>.</p>');
      return;
    }
    phaseFailed(wrong.length === 1 ? 'Un contacto no resuelve esa necesidad' : wrong.length + ' contactos no resuelven esas necesidades',
      '<ul class="ag-why">' + wrong.map(function(w){
        return '<li>Para «' + w.need.text.replace(/\.$/, '') + '», <b>' + w.contact.name + '</b> no es la puerta: ' + w.contact.does + '.</li>';
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
  setGoal('Arrastra los pasos para ordenarlos: el <b>primero arriba</b>, el último abajo. Luego postula el proyecto.');
  shell.renderFeedback(null, '<p class="fb-idle">Al postular, la propuesta recorre la ruta de arriba abajo. Si un paso está fuera de lugar, se detiene ahí.</p>');

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
  // way, and on release the order is updated.
  function startDrag(e, row, rows){
    e.preventDefault();
    var from = +row.dataset.pos, startY = e.clientY;
    var pitch = rows.length > 1 ? rows[1].getBoundingClientRect().top - rows[0].getBoundingClientRect().top : row.offsetHeight;
    var to = from;
    row.classList.add('dragging');
    try{ row.setPointerCapture(e.pointerId); }catch(err){ /* pointer already gone */ }
    function onMove(ev){
      var dy = ev.clientY - startY;
      row.style.transform = 'translateY(' + dy + 'px)';
      to = Math.max(0, Math.min(rows.length - 1, Math.round(from + dy / pitch)));
      rows.forEach(function(r, i){
        if(r === row) return;
        var shift = (i > from && i <= to) ? -pitch : ((i < from && i >= to) ? pitch : 0);
        r.style.transform = shift ? 'translateY(' + shift + 'px)' : '';
      });
    }
    function onUp(){
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
  var tried = {};
  setGoal('Elige la estrategia con la que el proyecto saldrá adelante.');
  shell.renderFeedback(null, '<p class="fb-idle">Las tres son posibles, pero solo una disipa la neblina por completo.</p>');
  setBuild('', false);
  function render(){
    elWork.innerHTML = '<div class="ag-cards">' + cards.map(function(c, i){
      return '<button type="button" class="ag-card tone-' + c.tone + (tried[c.id] ? ' tried' : '') + '" data-i="' + i + '"' + (tried[c.id] || g.won ? ' disabled' : '') + '>' +
        '<span class="ag-card-tag">Tarjeta ' + 'ABC'[i] + '</span><span class="ag-card-text">' + c.text + '</span></button>';
    }).join('') + '</div>';
    elWork.querySelectorAll('.ag-card').forEach(function(btn){
      btn.addEventListener('click', function(){
        var c = cards[+btn.dataset.i];
        if(c.win){
          phaseWon('¡La neblina se disipa!', '<p>' + c.result + '</p>');
          render(); // g.won now locks every card
          elWork.querySelectorAll('.ag-card')[+btn.dataset.i].classList.add('chosen');
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
  var g = game, r = g.reward;
  var rewards = '';
  if(r.cells || g.cells) rewards += '<span class="gm-reward"><b>◆ +' + ((r.cells || 0) + g.cells) + '</b> Células Lógicas</span>';
  if(r.badge) rewards += '<span class="gm-reward badge">🏅 Insignia <b>' + r.badge.name + '</b></span>';
  if(alianzasCtl.scene){ alianzasCtl.scene.setRestored(1); alianzasCtl.scene.burst(); }
  shell.showFinal({
    icon: '✦', title: '¡Nodo purificado!', total: PHASE_NAMES.length, unit: 'fases', article: 'las', fails: g.fails,
    luma: 'Ningún emprendimiento crece solo. Hoy le diste al distrito una red que lo sostiene.',
    recap: 'el ecosistema tiene quienes forman, quienes formalizan y quienes financian; y una convocatoria se gana en orden: requisitos, propuesta, alianzas, carga, subsanación y sustentación.',
    rewardsHtml: rewards,
    onContinue: function(){ g.onFinish(g.fails, closeAlianzas, g.cells); }
  });
}
