import Phaser from 'phaser';
import { isConfirmOpen } from '../confirm.js';
import { aiThinkingHtml, aiBubbleHtml } from '../ai.js';
import { guideAvatarHtml } from '../guides.js';

// The frame every mini-game shares: a full-screen overlay with a top bar
// (emblem, title, progress pips, close), a stage where the Phaser scene lives
// (with a banner and an AI hint panel over it), a panel below for the game's
// own controls, and a final "stars" card. The stage starts grey under the
// Neblina Gris and gets its colour back as the player clears each exercise. Games pass their panel markup and
// then drive the shell through the returned object.
//
// The panel markup can use these shared pieces, found by class:
//   .gm-goal      the one-line goal ("Abismo 1 de 5 · …")
//   .gm-feedback  the feedback card (see renderFeedback)
//   .gm-hint-btn  the "Pista con IA" button
//   .gm-build     the primary action button
export function createShell(opts){
  var root = document.createElement('div');
  root.className = 'gm-overlay';
  root.id = opts.id;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', opts.title);
  root.innerHTML =
    '<div class="gm-shell">' +
      '<div class="gm-top">' +
        '<div class="gm-emblem">' + opts.emblem + '</div>' +
        '<div class="gm-titles"><span class="hud-eyebrow"></span><span class="gm-title">' + opts.title + '</span></div>' +
        '<div class="gm-pips" aria-label="' + opts.pipsLabel + '"></div>' +
        '<button class="hud-btn" type="button" aria-label="Cerrar juego">✕ Cerrar</button>' +
      '</div>' +
      '<div class="gm-stage">' +
        '<div class="gm-fog" aria-hidden="true"><i></i><i></i><i></i></div>' +
        '<div class="gm-banner" role="status" aria-live="polite"></div>' +
        '<div class="ai-panel gm-hint" hidden></div>' +
      '</div>' +
      '<div class="gm-panel">' + opts.panelHtml + '</div>' +
      '<div class="gm-final"><div class="gm-final-card"></div></div>' +
    '</div>';
  document.body.appendChild(root);

  function q(sel){ return root.querySelector(sel); }
  var el = {
    root: root, eyebrow: q('.gm-titles .hud-eyebrow'), pips: q('.gm-pips'), close: q('.gm-top .hud-btn'),
    stage: q('.gm-stage'), banner: q('.gm-banner'), hintPanel: q('.gm-hint'), panel: q('.gm-panel'),
    goal: q('.gm-goal'), feedback: q('.gm-feedback'), hintBtn: q('.gm-hint-btn'), build: q('.gm-build'),
    final: q('.gm-final'), finalCard: q('.gm-final-card')
  };

  var game = null, ro = null, bannerTimer = null, onClose = null, isOpen = false;
  var hintSource = null, hintBusy = null;

  function onKey(e){
    if(e.key === 'Escape' && isOpen && !isConfirmOpen() && onClose) onClose();
  }
  el.close.addEventListener('click', function(){ if(isOpen && onClose) onClose(); });

  // Hint: canned text after a short "thinking" delay (see shared/ai.js).
  el.hintBtn.addEventListener('click', function(){
    if(!isOpen || !hintSource || (hintBusy && hintBusy())) return;
    if(el.hintPanel.dataset.loaded === '1'){ el.hintPanel.hidden = !el.hintPanel.hidden; return; }
    var token = el.hintPanel.dataset.token;
    el.hintPanel.hidden = false;
    el.hintPanel.classList.add('ai-loading');
    el.hintPanel.innerHTML = aiThinkingHtml(opts.hintThinking);
    el.hintBtn.disabled = true;
    setTimeout(function(){
      if(!isOpen || el.hintPanel.dataset.token !== token) return;
      el.hintPanel.classList.remove('ai-loading');
      el.hintPanel.innerHTML = aiBubbleHtml(hintSource());
      el.hintPanel.dataset.loaded = '1';
      el.hintBtn.disabled = false;
      el.hintBtn.classList.remove('pulse');
    }, 650 + Math.random() * 350);
  });

  var shell = {
    el: el,

    // eyebrow: e.g. "Fundamentos · Inicial". closeFn runs on ✕ / Escape.
    open: function(eyebrow, closeFn){
      el.eyebrow.textContent = eyebrow;
      onClose = closeFn;
      isOpen = true;
      el.final.classList.remove('show');
      shell.hideBanner();
      root.classList.add('open');
      document.addEventListener('keydown', onKey);
    },

    close: function(){
      isOpen = false;
      onClose = null;
      document.removeEventListener('keydown', onKey);
      shell.stopScene();
      clearTimeout(bannerTimer);
      root.classList.remove('open');
      el.final.classList.remove('show');
      el.banner.classList.remove('show');
      el.hintPanel.hidden = true;
    },

    // Starts the Phaser scene in the stage; throws if Phaser can't start.
    startScene: function(SceneCtor){
      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: el.stage,
        backgroundColor: '#0b1226',
        scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
        scene: [SceneCtor],
        render: { antialias: true },
        audio: { noAudio: true }
      });
      // The stage changes height when the panel below wraps onto more lines.
      if(window.ResizeObserver){
        ro = new ResizeObserver(function(){
          var sm = game && game.scale;
          if(!sm) return;
          sm.getParentBounds(); // re-read the stage size first, or refresh() keeps the old one
          sm.refresh();
        });
        ro.observe(el.stage);
      }
    },

    stopScene: function(){
      if(ro){ ro.disconnect(); ro = null; }
      if(game){ try{ game.destroy(true); }catch(e){ /* already gone */ } game = null; }
    },

    // One pip per exercise in the round: done, active or pending.
    renderPips: function(total, current, currentDone){
      var html = '';
      for(var i = 0; i < total; i++){
        var cls = 'gm-pip' + (i < current || (i === current && currentDone) ? ' done' : (i === current ? ' active' : ''));
        html += '<span class="' + cls + '"></span>';
      }
      el.pips.innerHTML = html;
      shell.setRestored((current + (currentDone ? 1 : 0)) / total);
    },

    // 0 = the stage is under the fog, 1 = fully restored.
    setRestored: function(f){ el.stage.style.setProperty('--restored', f.toFixed(3)); },

    showBanner: function(kind, title, sub, ms){
      clearTimeout(bannerTimer);
      el.banner.className = 'gm-banner ' + kind;
      el.banner.innerHTML = '<b>' + title + '</b><span>' + sub + '</span>';
      void el.banner.offsetWidth; // restart the transition
      el.banner.classList.add('show');
      if(ms) bannerTimer = setTimeout(shell.hideBanner, ms);
    },
    hideBanner: function(){ clearTimeout(bannerTimer); el.banner.classList.remove('show'); },

    // source() returns the hint html for the current exercise; busy() blocks it.
    setHint: function(source, busy){ hintSource = source; hintBusy = busy; },
    resetHint: function(){
      el.hintPanel.hidden = true; el.hintPanel.dataset.loaded = ''; el.hintPanel.classList.remove('ai-loading');
      el.hintPanel.dataset.token = String(Math.random());
      el.hintBtn.disabled = false; el.hintBtn.classList.remove('pulse');
    },
    hideHint: function(){ el.hintPanel.hidden = true; },
    pulseHint: function(){ el.hintBtn.classList.add('pulse'); },

    // fb: null (show idleHtml) or { kind: 'win'|'fail', title, html, stale }.
    renderFeedback: function(fb, idleHtml){
      el.feedback.className = 'gm-feedback' + (fb ? ' ' + fb.kind + (fb.stale ? ' stale' : '') : '');
      el.feedback.innerHTML = fb ? '<div class="fb-title">' + fb.title + '</div>' + fb.html : idleHtml;
    },

    // o: { icon, title, total, unit ('abismos'), fails, luma, recap, onContinue }
    showFinal: function(o){
      var stars = starsFor(o.fails);
      var starsHtml = '';
      for(var i = 0; i < 3; i++) starsHtml += i < stars ? '★' : '<span class="off">★</span>';
      var msg = o.fails === 0
        ? 'Superaste los ' + o.total + ' ' + o.unit + ' sin un solo intento fallido. ¡Impecable!'
        : 'Superaste los ' + o.total + ' ' + o.unit + ' tras ' + o.fails + ' ' + (o.fails === 1 ? 'intento fallido' : 'intentos fallidos') + '. ¡Sigues avanzando!';
      el.finalCard.innerHTML =
        '<div class="result-icon">' + o.icon + '</div>' +
        '<div class="result-title">' + o.title + '</div>' +
        '<div class="gm-stars" aria-label="' + stars + ' de 3 estrellas">' + starsHtml + '</div>' +
        '<div class="result-msg" style="margin-bottom:12px;">' + msg + '</div>' +
        (o.luma ? '<div class="gm-say luma">' + guideAvatarHtml('luma') + '<span><b>Luma</b> ' + o.luma + '</span></div>' : '') +
        '<div class="gm-say aura">' + guideAvatarHtml('aura') + '<span><b>Aura</b> Recuerda: ' + o.recap + '</span></div>' +
        '<div class="result-actions"><button type="button" class="btn-primary">Continuar</button></div>';
      el.final.classList.add('show');
      el.finalCard.querySelector('.btn-primary').addEventListener('click', o.onContinue);
    }
  };
  return shell;
}

// Stars for a 5-exercise round, by failed attempts.
export function starsFor(fails){ return fails <= 2 ? 3 : (fails <= 6 ? 2 : 1); }
