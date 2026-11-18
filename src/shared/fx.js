// Game feel shared by the whole app: short synthesized sounds (Web Audio,
// no audio files), a confetti burst, Células that fly to the HUD wallet,
// the hyperspace jump between galaxies, and a count-up for numbers.
// Everything degrades quietly: no Web Audio → no sound; reduced motion →
// no confetti, flight or warp (callbacks still run).

var SOUND_KEY = 'vx_sound_off';
var muted = false;
try{ muted = localStorage.getItem(SOUND_KEY) === '1'; }catch(e){ /* storage unavailable */ }

// The player's "Reducir movimiento" setting (shared/a11y.js, which follows
// the system setting until the player picks one) or the system setting.
export function reducedMotion(){
  if(document.documentElement.classList.contains('a11y-calm')) return true;
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

/* ---------------- Sound ---------------- */
var ac = null, master = null, noiseBuf = null;
function audio(){
  if(muted) return null;
  if(!ac){
    var C = window.AudioContext || window.webkitAudioContext;
    if(!C) return null;
    try{ ac = new C(); }catch(e){ return null; }
    master = ac.createGain();
    master.gain.value = 0.5;
    master.connect(ac.destination);
  }
  if(ac.state === 'suspended') ac.resume();
  return ac;
}

// One enveloped oscillator note. at: seconds from now.
function note(freq, at, dur, type, vol, slideTo){
  var a = audio(); if(!a) return;
  var t = a.currentTime + (at || 0);
  var o = a.createOscillator(), g = a.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(freq, t);
  if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.02);
}

// Filtered noise swept from f0 to f1: wind, warp, fog.
function sweep(dur, f0, f1, vol){
  var a = audio(); if(!a) return;
  if(!noiseBuf){
    noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for(var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  var t = a.currentTime, src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  src.buffer = noiseBuf; src.loop = true;
  f.type = 'bandpass'; f.Q.value = 1.4;
  f.frequency.setValueAtTime(f0, t);
  f.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.6);
  f.frequency.exponentialRampToValueAtTime(f0 * 0.6, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(master);
  src.start(t); src.stop(t + dur + 0.05);
}

var SOUNDS = {
  click:  function(){ note(720, 0, 0.06, 'triangle', 0.07, 520); },
  hover:  function(){ note(1400, 0, 0.04, 'sine', 0.025); },
  open:   function(){ note(440, 0, 0.12, 'triangle', 0.08); note(660, 0.07, 0.16, 'triangle', 0.08); },
  close:  function(){ note(520, 0, 0.1, 'triangle', 0.06, 330); },
  whoosh: function(){ sweep(1.1, 260, 2600, 0.22); note(110, 0, 0.9, 'sine', 0.06, 55); },
  dive:   function(){ sweep(0.6, 400, 1800, 0.14); },
  coin:   function(){ var f = 1180 + Math.random() * 240; note(f, 0, 0.09, 'square', 0.025); note(f * 1.5, 0.05, 0.12, 'square', 0.02); },
  reward: function(){ [523, 659, 784, 1047].forEach(function(f, i){ note(f, i * 0.08, 0.32, 'triangle', 0.08); }); },
  restore: function(){ sweep(0.9, 900, 300, 0.08); [392, 523, 659].forEach(function(f, i){ note(f, 0.1 + i * 0.07, 0.4, 'sine', 0.07); }); },
  fanfare: function(){
    [523, 659, 784].forEach(function(f, i){ note(f, i * 0.11, 0.25, 'triangle', 0.08); });
    [523, 659, 784, 1047].forEach(function(f){ note(f, 0.38, 0.9, 'triangle', 0.06); });
  },
  blip:   function(){ note(880 + Math.random() * 160, 0, 0.03, 'sine', 0.018); }
};

export function sfx(name){
  if(muted || !SOUNDS[name]) return;
  try{ SOUNDS[name](); }catch(e){ /* audio is a nicety */ }
}
export function isMuted(){ return muted; }
export function setMuted(m){
  muted = !!m;
  try{ localStorage.setItem(SOUND_KEY, muted ? '1' : '0'); }catch(e){ /* ignore */ }
}

/* ---------------- Count-up ---------------- */
// Animates el's text from `from` to `to` (integers).
export function countUp(el, from, to, ms, delay){
  if(reducedMotion() || from === to){ el.textContent = to; return; }
  var start = null;
  el.textContent = from;
  function step(ts){
    if(start === null) start = ts + (delay || 0);
    var k = Math.min(1, Math.max(0, (ts - start) / (ms || 800)));
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
    if(k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---------------- Confetti ---------------- */
var CONFETTI = ['#e8b84b', '#6cc4ff', '#57d9c9', '#9b8cf2', '#ff6fae', '#ffffff'];

// A burst from the centre of `host` (a positioned element), in front of it.
export function confetti(host, colors, count){
  if(reducedMotion() || !host || !host.animate) return;
  colors = colors || CONFETTI;
  var layer = document.createElement('div');
  layer.className = 'fx-confetti';
  host.appendChild(layer);
  for(var i = 0; i < (count || 46); i++){
    var p = document.createElement('i');
    var w = 5 + Math.random() * 6;
    p.style.width = w + 'px';
    p.style.height = (Math.random() < 0.5 ? w : w * 0.45) + 'px';
    p.style.background = colors[i % colors.length];
    if(Math.random() < 0.3) p.style.borderRadius = '50%';
    layer.appendChild(p);
    var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, v = 140 + Math.random() * 220;
    var dx = Math.cos(a) * v, dy = Math.sin(a) * v, rot = (Math.random() - 0.5) * 900;
    p.animate([
      { transform: 'translate(-50%,-50%) translate(0,0) rotate(0deg)', opacity: 1 },
      { transform: 'translate(-50%,-50%) translate(' + dx * 0.75 + 'px,' + dy * 0.75 + 'px) rotate(' + rot * 0.5 + 'deg)', opacity: 1, offset: 0.35 },
      { transform: 'translate(-50%,-50%) translate(' + dx + 'px,' + (dy + 260) + 'px) rotate(' + rot + 'deg)', opacity: 0 }
    ], { duration: 1300 + Math.random() * 700, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' });
  }
  setTimeout(function(){ layer.remove(); }, 2200);
}

/* ---------------- Células flying to the wallet ---------------- */
// n gems fly from the screen point (x, y) to `target` (the HUD counter);
// onArrive runs as the first one lands.
export function flyCells(x, y, amount, target, onArrive){
  var r = target && target.getBoundingClientRect();
  if(!r || reducedMotion() || !document.body.animate){ if(onArrive) onArrive(); return; }
  var tx = r.left + r.width / 2, ty = r.top + r.height / 2;
  var n = Math.max(4, Math.min(12, Math.round(amount / 8)));
  var arrived = false;
  for(var i = 0; i < n; i++){
    (function(i){
      var gem = document.createElement('span');
      gem.className = 'fx-cell';
      gem.textContent = '◆';
      gem.style.left = x + 'px'; gem.style.top = y + 'px';
      document.body.appendChild(gem);
      var sx = (Math.random() - 0.5) * 120, sy = -40 - Math.random() * 80;
      var anim = gem.animate([
        { transform: 'translate(-50%,-50%) scale(.3)', opacity: 0 },
        { transform: 'translate(-50%,-50%) translate(' + sx + 'px,' + sy + 'px) scale(1.2)', opacity: 1, offset: 0.3 },
        { transform: 'translate(-50%,-50%) translate(' + (tx - x) + 'px,' + (ty - y) + 'px) scale(.6)', opacity: 0.9 }
      ], { duration: 950, delay: i * 70, easing: 'cubic-bezier(.5,0,.6,1)', fill: 'forwards' });
      anim.onfinish = function(){
        gem.remove();
        sfx('coin');
        if(!arrived){ arrived = true; if(onArrive) onArrive(); }
      };
    })(i);
  }
}

/* ---------------- Hyperspace jump ---------------- */
// Star streaks rush out of the centre; midway (screen fully covered)
// onMid swaps what's underneath, then the streaks fade out.
export function warp(colors, onMid){
  if(reducedMotion()){ onMid(); return; }
  var c = document.createElement('canvas');
  c.className = 'fx-warp';
  document.body.appendChild(c);
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  var W = c.width = innerWidth * dpr, H = c.height = innerHeight * dpr;
  var ctx = c.getContext('2d');
  var stars = [];
  for(var i = 0; i < 260; i++){
    stars.push({ a: Math.random() * Math.PI * 2, d: Math.random() * 0.2, s: 0.4 + Math.random() * 1.2, col: Math.random() < 0.55 ? '#ffffff' : colors[i % colors.length] });
  }
  var t0 = performance.now(), DUR = 1250, mid = false;
  function frame(now){
    var t = (now - t0) / DUR;
    if(t >= 1){ c.remove(); return; }
    if(!mid && t > 0.42){ mid = true; onMid(); }
    var speed = t < 0.5 ? t * 2 : 1;
    var cover = t < 0.4 ? t / 0.4 : (t < 0.55 ? 1 : 1 - (t - 0.55) / 0.45);
    ctx.fillStyle = 'rgba(6,10,24,' + (0.35 + 0.65 * cover) + ')';
    ctx.fillRect(0, 0, W, H);
    var R = Math.hypot(W, H) / 2;
    ctx.lineCap = 'round';
    stars.forEach(function(s){
      var d0 = s.d;
      s.d += (0.004 + s.d * 0.09) * s.s * (0.4 + speed * 2.2);
      if(s.d > 1.2){ s.d = Math.random() * 0.05; d0 = s.d; }
      var x0 = W / 2 + Math.cos(s.a) * d0 * R, y0 = H / 2 + Math.sin(s.a) * d0 * R;
      var x1 = W / 2 + Math.cos(s.a) * s.d * R, y1 = H / 2 + Math.sin(s.a) * s.d * R;
      ctx.strokeStyle = s.col;
      ctx.globalAlpha = Math.min(1, s.d * 3) * (0.3 + 0.7 * cover);
      ctx.lineWidth = (1 + s.d * 3) * dpr;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    // a white flash at the peak of the jump
    if(t > 0.36 && t < 0.6){
      ctx.fillStyle = 'rgba(255,255,255,' + (0.5 * (1 - Math.abs(t - 0.45) / 0.12)).toFixed(3) + ')';
      if(Math.abs(t - 0.45) < 0.12) ctx.fillRect(0, 0, W, H);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
