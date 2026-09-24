import { pickRound } from './levels.js';
import { PARAMS, fmt, pt, simulate, rangeValues, allParams } from './math.js';
import { feedbackCard } from './feedback.js';
import { CannonScene, cannonCtl } from './scene.js';
import { pickOne } from '../../../../shared/random.js';
import { showToast } from '../../../../shared/toast.js';
import { createShell } from '../../../../shared/game/shell.js';

// Cañón parabólico. A wall with a crack blocks the rover's way. The shot
// follows f(x) = a·x² + b·x + c, and the player dials in the parameters the
// wall allows (the rest are fixed) until the shot hits the crack: then the
// wall crumbles and the rover drives on. The feedback card names the
// parameter that is off, which way to move it, and why.

/* ---- controller (DOM: formula, steppers, fire) ---- */
var shell = createShell({
  id: 'cannon-game', emblem: 'x²', title: 'Cañón parabólico',
  pipsLabel: 'Progreso de muros', hintThinking: 'Analizando tu disparo',
  panelHtml:
    '<div class="gm-goal"></div>' +
    '<div class="cn-formula" aria-live="polite"></div>' +
    '<div class="cn-params"></div>' +
    '<div class="gm-feedback" role="status" aria-live="polite"></div>' +
    '<div class="gm-actions">' +
      '<button type="button" class="ai-btn gm-hint-btn">✨ Pista con IA</button>' +
      '<button type="button" class="btn-primary gm-build">🎯 Disparar</button>' +
    '</div>'
});
var elPanel = shell.el.panel;
var elFormula = elPanel.querySelector('.cn-formula');
var elParams = elPanel.querySelector('.cn-params');
var elFire = shell.el.build;

var game = null;   // controller state while the game is open

shell.setHint(
  function(){ return game.round[game.level].hint; },
  function(){ return !game || game.busy; }
);

var FEEDBACK_IDLE = '<p class="fb-idle"><b>Recuerda:</b> f(0) = c es la altura de salida, f\'(0) = b la pendiente de salida, y el vértice está en x = −b / 2a.</p>';

// onFinish(score, close) runs when the player breaks every wall.
export function openCannon(node, onFinish){
  game = { node: node, onFinish: onFinish, round: pickRound(), level: 0, fails: 0, levelFails: 0,
           busy: false, won: false, feedback: null, params: null };
  shell.open(node.topic.name + ' · ' + node.level.label, closeCannon);
  setupLevel();
  try{
    shell.startScene(CannonScene);
  }catch(err){
    if(window.console) console.error('Cannon game could not start', err);
    closeCannon();
    showToast('No se pudo iniciar el juego. Recarga la página e inténtalo de nuevo.');
    return;
  }
  showIntro();
}

function closeCannon(){
  cannonCtl.scene = null;
  shell.close();
  game = null;
}

function setupLevel(){
  var g = game, lv = g.round[g.level];
  g.won = false; g.busy = false; g.feedback = null; g.levelFails = 0;
  // Start from a random setting that misses, so every wall needs thought.
  var misses = allParams(lv).filter(function(p){ return simulate(lv, p).kind !== 'crack'; });
  g.params = Object.assign({}, pickOne(misses));
  cannonCtl.level = lv;
  cannonCtl.params = g.params;
  shell.resetHint();
  shell.renderPips(g.round.length, g.level, false);
  renderPanel();
}

function termHtml(key, value, power){
  var adj = !!game.round[game.level].adjust[key];
  var v = '<span class="cn-coef' + (adj ? ' adj' : '') + '" title="' + (adj ? 'Ajustable' : 'Fijo') + '">' + fmt(value) + '</span>';
  return v + (power === 2 ? 'x²' : (power === 1 ? 'x' : ''));
}

function renderPanel(){
  var g = game, lv = g.round[g.level], p = g.params;
  var goal = 'Rompe la grieta en <b>' + pt(lv.wall.x, lv.crack) + '</b>';
  if(lv.horizontal) goal += ' con un impacto horizontal';
  if(lv.rock) goal += ' sin tocar la roca';
  shell.el.goal.innerHTML = '<i>Muro ' + (g.level + 1) + ' de ' + g.round.length + ' · ' + lv.tierName + '</i>' + goal;

  elFormula.innerHTML = '<span class="cn-fx">f(x) =</span> ' + termHtml('a', p.a, 2) + ' <span class="cn-op">+</span> ' +
    termHtml('b', p.b, 1) + ' <span class="cn-op">+</span> ' + termHtml('c', p.c, 0);

  elParams.innerHTML = PARAMS.filter(function(k){ return lv.adjust[k]; }).map(function(k){
    var vals = rangeValues(lv.adjust[k]), i = vals.indexOf(p[k]);
    var dis = g.busy || g.won;
    return '<div class="cn-param" data-key="' + k + '">' +
      '<span class="cn-pname">' + k + '</span>' +
      '<button type="button" class="cn-step" data-dir="-1" aria-label="Bajar ' + k + '"' + (dis || i <= 0 ? ' disabled' : '') + '>−</button>' +
      '<output class="cn-val" aria-label="' + k + '">' + fmt(p[k]) + '</output>' +
      '<button type="button" class="cn-step" data-dir="1" aria-label="Subir ' + k + '"' + (dis || i >= vals.length - 1 ? ' disabled' : '') + '>+</button>' +
    '</div>';
  }).join('');

  shell.renderFeedback(g.feedback, FEEDBACK_IDLE);
  var last = g.level === g.round.length - 1;
  elFire.textContent = g.won ? (last ? '★ Ver resultado' : 'Siguiente muro →') : '🎯 Disparar';
  elFire.disabled = g.busy;
  elPanel.classList.toggle('busy', g.busy);
}

elParams.addEventListener('click', function(e){
  var btn = e.target.closest ? e.target.closest('.cn-step') : null;
  if(!btn || btn.disabled || !game || game.busy || game.won) return;
  var key = btn.parentNode.getAttribute('data-key'), lv = game.round[game.level];
  var vals = rangeValues(lv.adjust[key]);
  var i = vals.indexOf(game.params[key]) + parseInt(btn.getAttribute('data-dir'), 10);
  if(i < 0 || i >= vals.length) return;
  game.params[key] = vals[i];
  // the explanation stays (dimmed) so the player can keep reading it
  if(game.feedback) game.feedback.stale = true;
  if(cannonCtl.scene) cannonCtl.scene.onParams(game.params);
  renderPanel();
  var again = elParams.querySelector('.cn-param[data-key="' + key + '"] .cn-step[data-dir="' + btn.getAttribute('data-dir') + '"]');
  if(again && !again.disabled) again.focus();
});

function showIntro(){
  var lv = game.round[game.level];
  shell.showBanner('info', 'Muro ' + (game.level + 1) + ' · ' + lv.tierName, lv.intro, 6000);
}

var BANNER = {
  ground: ['¡Se quedó corto!', 'La bala cayó antes del muro.'],
  over: ['¡Se pasó!', 'La bala voló por encima del muro.'],
  wall: ['¡Fuera de la grieta!', 'El muro resistió el impacto.'],
  glancing: ['¡De lado!', 'Diste en la grieta, pero el golpe no fue horizontal.'],
  rock: ['¡Chocó con la roca!', 'La curva no alcanzó a pasarla.']
};

elFire.addEventListener('click', function(){
  var g = game;
  if(!g || g.busy) return;
  if(g.won){ nextLevel(); return; }
  var lv = g.round[g.level], p = Object.assign({}, g.params);
  var out = simulate(lv, p);

  g.busy = true;
  shell.hideBanner();
  shell.hideHint();
  renderPanel();

  var onResult = function(){
    if(game !== g) return;
    var card = feedbackCard(lv, p, out);
    g.feedback = { kind: card.kind, title: card.title, html: card.html, stale: false };
    if(out.kind === 'crack'){
      g.won = true;
      shell.renderPips(g.round.length, g.level, true);
      shell.showBanner('win', '¡Muro derribado!', 'La bala dio justo en la grieta y el rover sigue su camino.', 0);
    } else {
      g.fails++; g.levelFails++;
      if(g.levelFails >= 2) shell.pulseHint();
      shell.showBanner('fail', BANNER[out.kind][0], BANNER[out.kind][1] + ' Mira abajo dónde está el error.', 5000);
    }
    renderPanel();
  };
  var onReady = function(){
    if(game !== g) return;
    g.busy = false;
    renderPanel();
  };

  if(cannonCtl.scene){ cannonCtl.scene.runShot(p, out, onResult, onReady); }
  else { setTimeout(function(){ onResult(); onReady(); }, 400); } // no canvas: still playable
});

function nextLevel(){
  var g = game;
  if(g.level >= g.round.length - 1){ showFinal(); return; }
  g.level++;
  shell.hideBanner();
  setupLevel();
  if(cannonCtl.scene) cannonCtl.scene.changeLevel();
  showIntro();
}

function showFinal(){
  var g = game;
  shell.showFinal({
    icon: '🎯', title: '¡Muros derribados!', total: g.round.length, unit: 'muros', fails: g.fails,
    recap: 'f(0) = c es la altura de salida, f\'(0) = b la pendiente, las raíces dicen dónde cae la bala y el vértice está en x = −b / 2a.',
    onContinue: function(){ g.onFinish(g.fails, closeCannon); }
  });
}
