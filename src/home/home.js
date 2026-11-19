import { GALAXIES } from '../galaxies/catalog.js';
import { GALAXY_DEFS } from '../atlas/world.js';
import { galaxySvg } from '../galaxies/galaxy-art.js';
import { hackStates, openVortex } from '../galaxies/vortex.js';
import { openGalaxySelect, enterGalaxy } from '../galaxies/select.js';
import { guidePortraitHtml } from '../shared/guides.js';
import { reducedMotion, sfx, countUp } from '../shared/fx.js';
import { a11yPrefs, setA11y, canSpeak } from '../shared/a11y.js';
import { startHero } from './hero.js';

// The home page: what the player sees first, in front of the galaxy select
// screen. One scrolling page over an animated universe (hero.js): the hero,
// the story revealed word by word with the scroll, how a galaxy is restored,
// the six galaxies (each one a door straight into it), Luma, the
// accessibility settings working live, the black hole and its video, and a
// closing call. Scrolling restores the universe's colour; the closing call
// shows it whole. "Comenzar el viaje" fades into the galaxy select screen,
// whose "Inicio" button brings the home page back.

var home = document.getElementById('home');
var selectScreen = document.getElementById('galaxy-select');
var isTouch = window.matchMedia && window.matchMedia('(hover: none)').matches;

function counts(){
  var planets = 0, nodes = 0, comets = 0;
  GALAXY_DEFS.forEach(function(d){
    planets += d.planets.length;
    nodes += d.islands.length;
    comets += d.islands.filter(function(i){ return i.kind === 'cometa'; }).length;
  });
  return { galaxies: GALAXY_DEFS.length, planets: planets, nodes: nodes, comets: comets };
}

// "La <b>Neblina Gris</b> apagó…" → one span per word, keeping the marks.
// start: the first word's number (it sets the reveal delay).
function wordsHtml(html, start){
  var out = '', i = start || 0;
  html.split(/(<[^>]+>)/).forEach(function(part){
    if(!part) return;
    if(part.charAt(0) === '<'){ out += part; return; }
    out += part.split(/(\s+)/).map(function(w){
      return /^\s+$/.test(w) || !w ? w : '<span class="hw" style="--w:' + (i++) + '">' + w + '</span>';
    }).join('');
  });
  return out;
}

var LUMA_LINES = [
  '¡Hola, Sintonizador! Cada nodo que restaures hará retroceder la Neblina Gris.',
  'Si te equivocas, te muestro dónde está el error. La respuesta la encuentras tú.',
  'Lo que aprendes aquí le sirve a personas reales. Por eso vale la pena.'
];

var STEPS_ICON = { isla: '🏝️', meteoro: '☄️', cometa: '💫' };

function build(){
  var c = counts();
  var states = hackStates();
  home.innerHTML =
    '<canvas class="home-sky" aria-hidden="true"></canvas>' +
    '<header class="home-bar">' +
      '<span class="home-brand"><b>VirtuXperience</b><i>UNIMINUTO Virtual</i></span>' +
      '<button class="hud-btn hud-a11y" type="button" data-a11y aria-haspopup="dialog" aria-expanded="false" aria-label="Accesibilidad (Alt + A)" title="Accesibilidad (Alt + A)">Aa</button>' +
      '<button class="btn-secondary home-skip" type="button" data-start>Ir a las galaxias</button>' +
    '</header>' +
    '<nav class="home-route" aria-label="Secciones del inicio"><span class="home-route-fill"></span></nav>' +

    // 1. Hero
    '<section class="home-sec home-hero" data-route="Inicio">' +
      '<div class="home-hero-text">' +
        '<span class="home-eyebrow hr" style="--d:0">UNIMINUTO Virtual · VirtuXperience</span>' +
        '<h1 class="home-title">' +
          '<span class="ht-line">' + wordsHtml('Devuélvele el color') + '</span>' +
          '<span class="ht-line ht-glow">' + wordsHtml('al universo del saber', 3) + '</span>' +
        '</h1>' +
        '<p class="home-lead hr" style="--d:6">La Neblina Gris apagó seis galaxias. Como <b>Sintonizador</b>, recorre sus nodos, gana <b class="gold">Células Lógicas</b> y despierta los seis <b>Hacks de Sintonía</b>.</p>' +
        '<div class="home-ctas hr" style="--d:8">' +
          '<button class="btn-primary home-go" type="button" data-start><span data-go-label>Comenzar el viaje</span> <i aria-hidden="true">→</i></button>' +
          '<button class="btn-secondary" type="button" data-goto="1">Conoce la historia</button>' +
        '</div>' +
      '</div>' +
      '<p class="home-hint hr" style="--d:11"><span class="home-hint-dot" aria-hidden="true"></span>' +
        (isTouch ? 'Toca el cielo: tu luz despeja la neblina' : 'Mueve el cursor: tu luz despeja la neblina. Haz clic en una galaxia para viajar') + '</p>' +
      '<span class="home-scroll hr" style="--d:12" aria-hidden="true"><i></i></span>' +
    '</section>' +

    // 2. The story
    '<section class="home-sec home-story" data-route="Historia">' +
      '<h2 class="sr-only">La historia</h2>' +
      '<p class="home-manifesto">' + wordsHtml(
        'Hubo un tiempo en que cada idea tenía su propio color. Entonces despertó la <span class="m-static">Interferencia Estática</span> y, con ella, la <span class="m-grey">Neblina Gris</span>, que apagó los planetas y congeló los caminos del saber. Seis galaxias esperan a alguien capaz de volver a sintonizarlas. Ese alguien eres tú, <span class="m-you">Sintonizador.</span>'
      ) + '</p>' +
    '</section>' +

    // 3. How to play
    '<section class="home-sec home-how" data-route="Cómo se juega">' +
      '<div class="home-wrap">' +
        '<span class="home-eyebrow" data-reveal>Cómo se juega</span>' +
        '<h2 class="home-h2" data-reveal>Así se restaura una galaxia</h2>' +
        '<ol class="home-steps">' +
          '<li class="home-panel" data-reveal style="--d:1"><span class="hs-n">1</span><b>Elige una galaxia</b><p>Seis disciplinas, en el orden que tú quieras.</p></li>' +
          '<li class="home-panel" data-reveal style="--d:2"><span class="hs-n">2</span><b>Recorre sus nodos</b>' +
            '<span class="hs-kinds">' +
              '<span class="hs-kind"><i class="k-isla" aria-hidden="true">' + STEPS_ICON.isla + '</i><b>Isla</b> un video corto</span>' +
              '<span class="hs-kind"><i class="k-meteoro" aria-hidden="true">' + STEPS_ICON.meteoro + '</i><b>Meteoro</b> un recurso interactivo</span>' +
              '<span class="hs-kind"><i class="k-cometa" aria-hidden="true">' + STEPS_ICON.cometa + '</i><b>Cometa</b> un juego: el gran reto</span>' +
            '</span></li>' +
          '<li class="home-panel" data-reveal style="--d:3"><span class="hs-n">3</span><b>Despierta su Hack</b><p>Cada nodo devuelve color y <b class="gold">Células Lógicas</b>. Al completar la galaxia, su Hack de Sintonía se estabiliza.</p></li>' +
        '</ol>' +
        '<div class="home-stats" data-reveal>' +
          stat(c.galaxies, 'galaxias') + stat(c.planets, 'planetas') + stat(c.nodes, 'nodos') + stat(c.comets, 'cometas') +
        '</div>' +
      '</div>' +
    '</section>' +

    // 4. The six galaxies
    '<section class="home-sec home-galaxies" data-route="Galaxias">' +
      '<div class="home-wrap">' +
        '<span class="home-eyebrow" data-reveal>El universo</span>' +
        '<h2 class="home-h2" data-reveal>Seis galaxias, seis caminos</h2>' +
        '<p class="home-sub" data-reveal>Cada una afianza una disciplina distinta. Empieza por la que más te llame.</p>' +
        '<div class="home-cards">' + GALAXIES.map(function(g, i){ return cardHtml(g, i, states[i]); }).join('') + '</div>' +
      '</div>' +
    '</section>' +

    // 5. Luma
    '<section class="home-sec home-luma" data-route="Luma">' +
      '<div class="home-wrap home-luma-grid">' +
        '<div class="home-luma-art" data-reveal>' + guidePortraitHtml('luma') + '<span class="home-luma-ring" aria-hidden="true"></span></div>' +
        '<div>' +
          '<span class="home-eyebrow" data-reveal>Tu guía</span>' +
          '<h2 class="home-h2" data-reveal>Luma te acompaña</h2>' +
          '<p class="home-say home-panel" data-reveal><b>Luma:</b> <span class="home-say-text" aria-live="polite">' + LUMA_LINES[0] + '</span><span class="home-caret" aria-hidden="true"></span></p>' +
          '<ul class="home-list">' +
            '<li data-reveal style="--d:1"><i aria-hidden="true">💡</i>Te da pistas sin revelar la respuesta.</li>' +
            '<li data-reveal style="--d:2"><i aria-hidden="true">🤝</i>Te recuerda para quién lo haces.</li>' +
            '<li data-reveal style="--d:3"><i aria-hidden="true">🔊</i>Si lo necesitas, te lee en voz alta.</li>' +
          '</ul>' +
        '</div>' +
      '</div>' +
    '</section>' +

    // 6. Accessibility, live
    '<section class="home-sec home-dua" data-route="Accesibilidad">' +
      '<div class="home-wrap">' +
        '<span class="home-eyebrow" data-reveal>Accesibilidad</span>' +
        '<h2 class="home-h2" data-reveal>Hecho para que todos lleguen</h2>' +
        '<p class="home-sub" data-reveal>Ajusta la experiencia a tu manera. Los cambios se ven al instante y se guardan en este navegador.</p>' +
        '<div class="home-dua-grid">' +
          '<div class="home-panel home-dua-size" data-reveal style="--d:1"><b>Tamaño del texto</b>' +
            '<span class="home-dua-steps"><button type="button" class="a11y-step" data-size="-1" aria-label="Texto más pequeño">A−</button>' +
            '<span class="home-dua-sizename" aria-live="polite"></span>' +
            '<button type="button" class="a11y-step" data-size="1" aria-label="Texto más grande">A+</button></span></div>' +
          duaToggle('contrast', '◐', 'Alto contraste', 2) +
          duaToggle('font', 'Aa', 'Lectura fácil', 3) +
          duaToggle('spacing', '↕', 'Más espacio', 4) +
          duaToggle('calm', '◎', 'Reducir movimiento', 5) +
          duaToggle('voice', '🔊', 'Luma lee en voz alta', 6) +
        '</div>' +
        '<button class="btn-secondary home-dua-more" type="button" data-a11y aria-haspopup="dialog" aria-expanded="false" data-reveal>Todos los ajustes · Alt + A</button>' +
      '</div>' +
    '</section>' +

    // 7. The black hole
    '<section class="home-sec home-origin" data-route="Origen">' +
      '<div class="home-wrap">' +
        '<span class="home-eyebrow" data-reveal>Centro del universo</span>' +
        '<h2 class="home-h2" data-reveal>Interferencia Estática</h2>' +
        '<p class="home-sub" data-reveal>En el centro gira el agujero negro que esparce la Neblina Gris. Cada galaxia que restauras estabiliza su Hack de Sintonía y lo debilita un poco más.</p>' +
        '<div class="home-hacks" data-reveal></div>' +
        '<button class="btn-primary home-video" type="button" data-reveal><i aria-hidden="true">▶</i> Ver el video de VirtuXperience</button>' +
      '</div>' +
    '</section>' +

    // 8. Closing call: the universe in full colour
    '<section class="home-sec home-final" data-route="Comenzar">' +
      '<div class="home-final-text">' +
        '<h2 class="home-title home-final-title" data-reveal>¿Listo, <span class="ht-glow">Sintonizador?</span></h2>' +
        '<p class="home-sub" data-reveal>El universo recupera su color un nodo a la vez.</p>' +
        '<button class="btn-primary home-go" type="button" data-start data-reveal><span data-go-label>Comenzar el viaje</span> <i aria-hidden="true">→</i></button>' +
        '<p class="home-note" data-reveal>Tu progreso se guarda en este navegador.</p>' +
      '</div>' +
      '<footer class="home-foot">UNIMINUTO Virtual · VirtuXperience — Conecta, aprende y transforma</footer>' +
    '</section>';
}

function stat(n, label){
  return '<span class="home-stat"><b data-count="' + n + '">' + n + '</b><i>' + label + '</i></span>';
}

function cardHtml(g, i, s){
  var def = GALAXY_DEFS.find(function(d){ return d.id === g.id; });
  return '<div class="hc-wrap" data-reveal style="--d:' + (i % 3 + 1) + '">' +
    '<button type="button" class="home-card" data-galaxy="' + g.id + '" style="--g1:' + g.colors.g1 + ';--g2:' + g.colors.g2 + ';--g3:' + (g.colors.g3 || '#fff') + '">' +
    '<span class="hc-shine" aria-hidden="true"></span>' +
    '<span class="hc-art">' + galaxySvg(g, true) + '</span>' +
    '<span class="hc-name">' + g.name + '</span>' +
    '<span class="hc-sub">' + g.sub + '</span>' +
    '<span class="hc-hack"><i aria-hidden="true">' + s.emblem + '</i>' + s.hack + '</span>' +
    '<span class="hc-meta">' + (def ? def.planets.length + ' planetas · ' + def.islands.length + ' nodos' : '') + '</span>' +
    '<span class="hc-bar" aria-hidden="true"><span></span></span>' +
    '<span class="hc-go">Viajar <i aria-hidden="true">→</i></span>' +
  '</button></div>';
}

function duaToggle(key, icon, label, d){
  return '<label class="home-panel home-dua-toggle a11y-toggle" data-reveal style="--d:' + d + '">' +
    '<i class="home-dua-icon" aria-hidden="true">' + icon + '</i><b>' + label + '</b>' +
    '<input type="checkbox" role="switch" data-dua="' + key + '"><span class="a11y-switch" aria-hidden="true"></span>' +
  '</label>';
}

build();

var sky = startHero(home.querySelector('.home-sky'), home, hackStates());
var sections = Array.prototype.slice.call(home.querySelectorAll('.home-sec'));
var route = home.querySelector('.home-route');
var routeFill = home.querySelector('.home-route-fill');
var words = Array.prototype.slice.call(home.querySelectorAll('.home-manifesto .hw'));
var storySec = home.querySelector('.home-story');
var finalSec = home.querySelector('.home-final');

/* ---------------- Progress shown on the page ---------------- */
function refresh(){
  var states = hackStates();
  var any = states.some(function(s){ return s.done > 0; });
  home.querySelectorAll('[data-go-label]').forEach(function(el){ el.textContent = any ? 'Continuar el viaje' : 'Comenzar el viaje'; });
  states.forEach(function(s){
    var card = home.querySelector('.home-card[data-galaxy="' + s.id + '"]');
    if(!card) return;
    card.querySelector('.hc-bar span').style.width = Math.round(s.frac * 100) + '%';
    card.classList.toggle('stable', s.stable);
    card.setAttribute('aria-label', 'Viajar a ' + s.name + '. ' + (s.stable ? 'Hack estable.' : s.done + ' de ' + s.total + ' nodos restaurados.'));
  });
  var k = states.filter(function(s){ return s.stable; }).length;
  home.querySelector('.home-hacks').innerHTML =
    states.map(function(s){
      return '<span class="home-hack' + (s.stable ? ' stable' : '') + '" style="--g1:' + s.colors.g1 + ';--g2:' + s.colors.g2 + '">' +
        '<i aria-hidden="true">' + s.emblem + '</i>' + s.hack + '</span>';
    }).join('') +
    '<span class="home-hacks-count">' + k + '/' + states.length + ' Hacks estables</span>';
  sky.setProgress(states);
}

/* ---------------- Scroll: the sky, the story, the route ---------------- */
function clamp(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }
function smooth(v){ v = clamp(v); return v * v * (3 - 2 * v); }

var routeDots = [];
sections.forEach(function(sec, i){
  var b = document.createElement('button');
  b.type = 'button';
  b.className = 'home-route-dot';
  b.innerHTML = '<span>' + sec.dataset.route + '</span>';
  b.setAttribute('aria-label', sec.dataset.route);
  b.addEventListener('click', function(){ goTo(i); });
  route.appendChild(b);
  routeDots.push(b);
});

function goTo(i){
  var sec = sections[i];
  if(sec) home.scrollTo({ top: sec.offsetTop, behavior: reducedMotion() ? 'auto' : 'smooth' });
}

var ticking = false, lastLit = -1, current = -1;
function onScroll(){
  ticking = false;
  var top = home.scrollTop, vh = home.clientHeight, max = Math.max(1, home.scrollHeight - vh);
  var heroK = smooth(top / (vh * 0.9));
  var finalK = smooth((vh - finalSec.getBoundingClientRect().top) / (vh * 0.8));
  var wide = home.clientWidth > 900;
  var away = heroK * (1 - finalK);
  sky.setView({
    restore: Math.pow(clamp(top / max), 1.3),
    dim: 1 - 0.68 * away,
    zoom: 1 + 0.45 * away,
    fx: (wide ? 0.64 : 0.5) * (1 - Math.max(heroK, finalK)) + 0.5 * Math.max(heroK, finalK),
    fy: (wide ? 0.52 : 0.66) * (1 - finalK) + (wide ? 0.42 : 0.4) * finalK,
    scroll: top
  });
  routeFill.style.transform = 'scaleY(' + clamp(top / max).toFixed(3) + ')';

  // the story lights up word by word as it crosses the screen
  var r = storySec.getBoundingClientRect();
  var k = reducedMotion() ? 1 : clamp((vh * 0.82 - r.top) / (r.height * 0.75));
  var n = Math.round(k * words.length);
  if(n !== lastLit){
    words.forEach(function(w, i){ w.classList.toggle('on', i < n); });
    lastLit = n;
  }

  var now = 0;
  sections.forEach(function(sec, i){ if(sec.getBoundingClientRect().top < vh * 0.5) now = i; });
  if(now !== current){
    routeDots.forEach(function(d, i){ d.classList.toggle('on', i === now); d.toggleAttribute('aria-current', i === now); });
    current = now;
  }
}
home.addEventListener('scroll', function(){
  if(!ticking){ ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
window.addEventListener('resize', onScroll);

/* ---------------- Reveal on scroll ---------------- */
var counted = false;
var io = 'IntersectionObserver' in window ? new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
    if(e.target.classList.contains('home-stats') && !counted){
      counted = true;
      e.target.querySelectorAll('[data-count]').forEach(function(b, i){ countUp(b, 0, +b.dataset.count, 1400, i * 120); });
    }
    if(e.target.classList.contains('home-say')) typeLuma();
  });
}, { root: home, threshold: 0.18 }) : null;
home.querySelectorAll('[data-reveal]').forEach(function(el){ if(io) io.observe(el); else el.classList.add('in'); });

/* ---------------- Luma's lines, typed ---------------- */
var sayText = home.querySelector('.home-say-text');
var lumaTimer = 0, lumaLine = 0, typing = false;
function typeLuma(){
  if(typing) return;
  typing = true;
  (function next(){
    var text = LUMA_LINES[lumaLine % LUMA_LINES.length];
    lumaLine++;
    if(reducedMotion()){ sayText.textContent = text; lumaTimer = setTimeout(next, 7000); return; }
    var i = 0;
    (function type(){
      sayText.textContent = text.slice(0, ++i);
      if(i < text.length) lumaTimer = setTimeout(type, 26);
      else lumaTimer = setTimeout(next, 4200);
    })();
  })();
}

/* ---------------- Cards: tilt and shine follow the pointer ---------------- */
home.querySelectorAll('.home-card').forEach(function(card){
  card.addEventListener('pointermove', function(e){
    if(reducedMotion()) return;
    var b = card.getBoundingClientRect();
    var x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
    card.style.setProperty('--rx', ((0.5 - y) * 10).toFixed(2) + 'deg');
    card.style.setProperty('--ry', ((x - 0.5) * 12).toFixed(2) + 'deg');
    card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
    card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
  });
  card.addEventListener('pointerleave', function(){
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  });
  card.addEventListener('mouseenter', function(){ sfx('hover'); });
  card.addEventListener('click', function(){ travel(card.dataset.galaxy); });
});

/* ---------------- Accessibility, live ---------------- */
var SIZE_NAMES = ['Normal', 'Grande', 'Muy grande', 'Máximo'];
var duaBoxes = home.querySelectorAll('[data-dua]');
var duaSteps = home.querySelectorAll('.home-dua-size .a11y-step');
function paintDua(){
  var p = a11yPrefs();
  duaBoxes.forEach(function(b){ b.checked = !!p[b.dataset.dua]; });
  home.querySelector('.home-dua-sizename').textContent = SIZE_NAMES[p.size];
  duaSteps[0].disabled = p.size === 0;
  duaSteps[1].disabled = p.size === SIZE_NAMES.length - 1;
  var voice = home.querySelector('[data-dua="voice"]');
  voice.disabled = !canSpeak();
}
duaBoxes.forEach(function(b){
  b.addEventListener('change', function(){ setA11y(b.dataset.dua, b.checked); sfx('click'); });
});
duaSteps.forEach(function(s){
  s.addEventListener('click', function(){ setA11y('size', a11yPrefs().size + (+s.dataset.size)); });
});
window.addEventListener('vx-a11y', function(){ paintDua(); onScroll(); });

/* ---------------- Leaving and coming back ---------------- */
function closeHome(){
  if(home.classList.contains('hidden')) return;
  clearTimeout(lumaTimer); typing = false;
  home.classList.add('hidden');
}

// Into the galaxy select screen, cross-fading.
function start(){
  sfx('whoosh');
  openGalaxySelect();
  if(reducedMotion()){ closeHome(); return; }
  home.classList.add('leaving');
  setTimeout(function(){ home.classList.remove('leaving'); closeHome(); }, 700);
}

// Straight into a galaxy, through the hyperspace jump.
function travel(id){
  enterGalaxy(id, closeHome);
}

export function openHome(){
  refresh();
  home.classList.remove('hidden', 'leaving');
  home.scrollTop = 0;
  onScroll();
  sky.setView({ restore: 0, dim: 1, zoom: 1 }, true);
  home.focus({ preventScroll: true });
  // the select screen underneath can rest
  setTimeout(function(){ if(!home.classList.contains('hidden')) selectScreen.classList.add('hidden'); }, 400);
}

home.addEventListener('click', function(e){
  var t = e.target.closest('[data-start], [data-goto], .home-video');
  if(!t) return;
  if(t.hasAttribute('data-start')) start();
  else if(t.hasAttribute('data-goto')) goTo(+t.dataset.goto);
  else openVortex();
});
sky.onPick(function(id){ sfx('click'); travel(id); });

var backBtn = document.getElementById('btn-home');
if(backBtn) backBtn.addEventListener('click', openHome);

refresh();
paintDua();
onScroll();
home.focus({ preventScroll: true });
