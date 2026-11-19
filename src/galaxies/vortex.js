import { GALAXY_DEFS } from '../atlas/world.js';
import { isDone } from '../atlas/progress.js';
import { GALAXIES } from './catalog.js';
import { guidePortraitHtml } from '../shared/guides.js';
import { reducedMotion, sfx } from '../shared/fx.js';
import { speak, stopSpeaking } from '../shared/a11y.js';

// The black hole of Interferencia Estática at the centre of the galaxy
// select screen: the source of the Neblina Gris. Its accretion disk pulls
// in the colour of the six galaxies along their Corredores Cuánticos; each
// galaxy the player restores sends its Hack de Sintonía, which lights a ring
// around the hole in the galaxy's colours. The more restored, the smaller
// and calmer the hole, and the more colour in its disk. Clicking it opens
// Luma's explanation, the Hacks and the VirtuXperience video.

var VIDEO = 'https://www.youtube-nocookie.com/embed/2Zf7c7ChW78?rel=0';
var GREY = [138, 144, 166];

function hexToRgb(hex){
  var n = parseInt(hex.slice(1), 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function rgba(c, a){ return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a.toFixed(3) + ')'; }

// "BRÚJULA DE GESTIÓN ÁGIL" → "Brújula de Gestión Ágil"
function hackName(label){
  return label.toLowerCase().split(' ').map(function(w, i){
    return i > 0 && /^(de|del|la|el|y)$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
}

// Each galaxy: its share of nodes restored and whether its Hack arrived.
export function hackStates(){
  return GALAXIES.map(function(c){
    var def = GALAXY_DEFS.find(function(g){ return g.id === c.id; });
    var total = def ? def.islands.length : 0;
    var done = def ? def.islands.filter(function(i){ return isDone(i.id); }).length : 0;
    return {
      id: c.id, name: c.name, emblem: def ? def.emblem : '✦',
      hack: def ? hackName(def.sun.label) : '',
      colors: c.colors, rgb: hexToRgb(c.colors.g1),
      frac: total ? done / total : 0, done: done, total: total,
      stable: total > 0 && done === total
    };
  });
}

/* ---------------- The animated hole ---------------- */
export function startVortex(canvas, host){
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1, raf = 0, last = 0;
  var states = hackStates(), calm = 0; // calm: 0 (pulling hard) … 1 (all six Hacks)
  var motes = [];

  function size(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    if(!W || !H) return;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function horizon(){ return Math.min(W, H * 1.9) * (0.12 - 0.035 * calm); }

  // A mote of the disk: grey, or a galaxy's colour if that galaxy is
  // restored enough. It circles and slowly falls in.
  function mote(m, anywhere){
    var R = horizon();
    var g = states[(Math.random() * states.length) | 0];
    m.col = Math.random() < g.frac ? g.rgb : GREY;
    m.r = R * (anywhere ? 1.25 + Math.random() * 2.1 : 3 + Math.random() * 0.4);
    m.a = Math.random() * Math.PI * 2;
    m.s = 0.6 + Math.random() * 1.4;
    return m;
  }
  function seed(){
    motes = [];
    for(var i = 0; i < 700; i++) motes.push(mote({}, true));
  }

  function drawMotes(R, front, dt){
    var pull = 0.12 - 0.09 * calm; // inward drift, per second, in horizons
    for(var i = 0; i < motes.length; i++){
      var m = motes[i];
      if(dt){
        m.a += dt * m.s * 1.8 * Math.pow(R / m.r, 1.5);
        m.r -= dt * pull * R * m.s;
        if(m.r < R * 1.05) mote(m, false);
      }
      var sy = Math.sin(m.a);
      if((sy > 0) !== front) continue;
      var x = W / 2 + Math.cos(m.a) * m.r, y = H / 2 + sy * m.r * 0.3;
      var near = 1 - Math.min(1, (m.r - R) / (R * 2.4)); // brighter close in
      ctx.fillStyle = rgba(m.col, 0.35 + 0.65 * near);
      var s = 1 + near * 1.8;
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
  }

  function draw(t, dt){
    if(!W || !H) return;
    ctx.clearRect(0, 0, W, H);
    var R = horizon(), cx = W / 2, cy = H / 2;
    // a flat glow along the disk (an ellipse that fades out inside the canvas)
    ctx.save();
    ctx.translate(cx, cy); ctx.scale(1, 0.32);
    var reach = Math.min(R * 3.6, W / 2);
    var halo = ctx.createRadialGradient(0, 0, R * 0.8, 0, 0, reach);
    halo.addColorStop(0, 'rgba(255,200,150,' + (0.22 + 0.1 * calm).toFixed(3) + ')');
    halo.addColorStop(0.5, 'rgba(160,140,220,.08)');
    halo.addColorStop(1, 'rgba(160,140,220,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(0, 0, reach, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    drawRings(R, t, false);
    drawMotes(R, false, dt);
    // the event horizon and its photon ring
    var ring = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.35);
    ring.addColorStop(0, 'rgba(255,236,200,.85)');
    ring.addColorStop(0.25, 'rgba(255,190,140,.35)');
    ring.addColorStop(1, 'rgba(255,190,140,0)');
    ctx.fillStyle = ring;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.35, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    // light from the back of the disk, bent over the top of the hole
    var lens = ctx.createLinearGradient(cx, cy - R * 1.3, cx, cy);
    lens.addColorStop(0, 'rgba(255,226,180,.75)');
    lens.addColorStop(1, 'rgba(255,226,180,0)');
    ctx.strokeStyle = lens; ctx.lineWidth = R * 0.12;
    ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.12, R * 1.08, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    drawRings(R, t, true);
    drawMotes(R, true, dt);
  }

  // The Hacks: one ring per galaxy, lit as far as it is restored. The far
  // half is drawn behind the hole, the near half in front of it.
  function drawRings(R, t, front){
    var cx = W / 2, cy = H / 2;
    ctx.save();
    ctx.beginPath();
    if(front) ctx.rect(0, cy, W, H - cy); else ctx.rect(0, 0, W, cy);
    ctx.clip();
    states.forEach(function(g, i){
      var rr = R * (1.5 + i * 0.13);
      var spin = (t || 0) / 1000 * (0.25 + i * 0.05) * (i % 2 ? -1 : 1);
      ctx.lineCap = 'round';
      ctx.lineWidth = g.stable ? 2.4 : 1.2;
      ctx.strokeStyle = rgba(GREY, 0.12);
      ctx.beginPath(); ctx.ellipse(cx, cy, rr, rr * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
      if(g.frac > 0){
        ctx.strokeStyle = rgba(g.rgb, g.stable ? 0.95 : 0.7);
        if(g.stable){ ctx.shadowColor = g.colors.g1; ctx.shadowBlur = 10; }
        ctx.beginPath(); ctx.ellipse(cx, cy, rr, rr * 0.3, 0, spin, spin + Math.PI * 2 * g.frac); ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });
    ctx.restore();
  }

  function frame(t){
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    draw(t, dt);
    raf = requestAnimationFrame(frame);
  }
  function running(){ return !host.classList.contains('hidden') && !document.hidden && !reducedMotion(); }
  function sync(){
    if(!W && !host.classList.contains('hidden')){ size(); seed(); } // it started hidden
    if(running() && !raf){ last = 0; raf = requestAnimationFrame(frame); }
    else if(!running() && raf){ cancelAnimationFrame(raf); raf = 0; }
    if(!raf) draw(0, 0);
  }

  window.addEventListener('resize', function(){ size(); seed(); sync(); });
  window.addEventListener('vx-a11y', sync);
  document.addEventListener('visibilitychange', sync);
  new MutationObserver(sync).observe(host, { attributes: true, attributeFilter: ['class'] });

  size(); seed(); sync();

  return {
    // re-read progress (the select screen calls it every time it opens)
    refresh: function(){
      states = hackStates();
      calm = states.filter(function(g){ return g.stable; }).length / states.length;
      size(); seed(); sync();
    }
  };
}

/* ---------------- Luma's panel ---------------- */
var pop = document.createElement('div');
pop.id = 'vortex-pop';
pop.setAttribute('role', 'dialog');
pop.setAttribute('aria-modal', 'true');
pop.setAttribute('aria-label', 'Interferencia Estática');
pop.innerHTML =
  '<div class="vx-card">' +
    '<button type="button" class="hud-btn vx-close" aria-label="Cerrar">✕</button>' +
    '<span class="hud-eyebrow">Centro del universo</span>' +
    '<h2 class="vx-title">Interferencia Estática</h2>' +
    '<div class="vx-luma"><div class="vx-portrait">' + guidePortraitHtml('luma') + '</div>' +
      '<p class="vx-say"></p></div>' +
    '<div class="vx-hacks"></div>' +
    '<div class="vx-video-wrap">' +
      '<span class="hud-eyebrow">Mira de qué se trata VirtuXperience</span>' +
      '<div class="vx-video"></div>' +
    '</div>' +
  '</div>';
document.body.appendChild(pop);

var el = { say: pop.querySelector('.vx-say'), hacks: pop.querySelector('.vx-hacks'), video: pop.querySelector('.vx-video'), close: pop.querySelector('.vx-close') };
var opener = null;

function lumaLine(states){
  var k = states.filter(function(g){ return g.stable; }).length;
  var any = states.some(function(g){ return g.done > 0; });
  if(k === states.length){
    return '¡Lo lograste, Sintonizador! Los <b>seis Hacks de Sintonía</b> rodean el agujero negro y ya no puede sostenerse. Su fuerza se apaga: la Neblina Gris no tiene de dónde salir.';
  }
  if(k > 0){
    return 'Ya estabilizaste <b>' + k + ' de ' + states.length + '</b> Hacks de Sintonía. ¿Ves cómo el agujero se encoge y su disco recupera color? Cada galaxia que restauras le quita fuerza. Cuando estén los seis, la Interferencia Estática colapsará.';
  }
  if(any){
    return 'Vas bien: cada nodo que completas le devuelve un poco de color al disco. Cuando restaures <b>toda una galaxia</b>, su Hack de Sintonía llegará hasta aquí y frenará al agujero.';
  }
  return 'Ese es el agujero negro de la <b>Interferencia Estática</b>. De ahí sale la <b>Neblina Gris</b>: se está tragando el color de las seis galaxias. Cada galaxia que restauras envía su <b>Hack de Sintonía</b> hasta aquí y le quita fuerza. Elige una galaxia y empieza.';
}

function hacksHtml(states){
  return states.map(function(g){
    var pct = Math.round(g.frac * 100);
    return '<div class="vx-hack' + (g.stable ? ' stable' : '') + '" style="--g1:' + g.colors.g1 + ';--g2:' + g.colors.g2 + '">' +
      '<span class="vx-hack-emblem" aria-hidden="true">' + g.emblem + '</span>' +
      '<span class="vx-hack-text"><b>' + g.hack + '</b><i>' + g.name + ' · ' + g.done + '/' + g.total + ' nodos</i></span>' +
      '<span class="vx-hack-state">' + (g.stable ? '✓ Estable' : pct + '%') + '</span>' +
      '<span class="vx-hack-bar"><span style="width:' + pct + '%"></span></span>' +
    '</div>';
  }).join('');
}

export function openVortex(){
  var states = hackStates();
  opener = document.activeElement;
  el.say.innerHTML = '<b class="vx-who">Luma</b> ' + lumaLine(states);
  el.hacks.innerHTML = hacksHtml(states);
  // the video loads only while the panel is open, so closing it stops it
  el.video.innerHTML = '<iframe src="' + VIDEO + '" title="VirtuXperience: conecta, aprende y transforma" ' +
    'allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" loading="lazy"></iframe>';
  pop.classList.add('open');
  sfx('open');
  speak(lumaLine(states));
  el.close.focus();
  document.addEventListener('keydown', onKey);
}

function closeVortex(){
  pop.classList.remove('open');
  el.video.innerHTML = '';
  stopSpeaking();
  sfx('close');
  document.removeEventListener('keydown', onKey);
  if(opener && opener.focus) opener.focus();
}
function onKey(e){ if(e.key === 'Escape'){ e.preventDefault(); closeVortex(); } }

el.close.addEventListener('click', closeVortex);
pop.addEventListener('click', function(e){ if(e.target === pop) closeVortex(); });
