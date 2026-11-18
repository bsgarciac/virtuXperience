import { sfx } from './fx.js';

// Accessibility panel (HUD "Aa" button or Alt+A): text size, high contrast,
// an easy-reading font, more spacing, calmer motion and Luma reading aloud.
// Preferences live in this browser (localStorage) and apply as classes on
// <html>, so every stylesheet can react (styles/a11y.css). Calm motion also
// drives fx.reducedMotion(), which the scenes, the warp and the confetti
// already check. A change fires a 'vx-a11y' event on window.

var KEY = 'vx_a11y';
var SIZES = [1, 1.15, 1.3, 1.5];
var SIZE_NAMES = ['Normal', 'Grande', 'Muy grande', 'Máximo'];
var FONT_URL = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap';

function osReduce(){
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

var prefs = { size: 0, contrast: false, font: false, spacing: false, calm: null, voice: false };
try{
  var saved = JSON.parse(localStorage.getItem(KEY) || '{}');
  Object.keys(prefs).forEach(function(k){ if(k in saved) prefs[k] = saved[k]; });
}catch(e){ /* storage unavailable or corrupt: defaults */ }
if(!(prefs.size >= 0 && prefs.size < SIZES.length)) prefs.size = 0;

// calm === null means "follow the system setting".
function calm(){ return prefs.calm === null ? osReduce() : !!prefs.calm; }

function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(prefs)); }catch(e){ /* ignore */ }
}

var fontLoaded = false;
function loadFont(){
  if(fontLoaded) return;
  fontLoaded = true;
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = FONT_URL;
  // the map draws on a canvas: tell it to redraw once the font is ready
  link.onload = function(){
    if(!document.fonts) return;
    document.fonts.load('16px "Atkinson Hyperlegible"').then(function(){
      window.dispatchEvent(new Event('vx-a11y'));
    }).catch(function(){ /* keep the fallback font */ });
  };
  document.head.appendChild(link);
}

function apply(){
  var html = document.documentElement;
  html.style.setProperty('--a11y-zoom', SIZES[prefs.size]);
  html.classList.toggle('a11y-contrast', !!prefs.contrast);
  html.classList.toggle('a11y-font', !!prefs.font);
  html.classList.toggle('a11y-spacing', !!prefs.spacing);
  html.classList.toggle('a11y-calm', calm());
  if(prefs.font) loadFont();
  if(!prefs.voice) stopSpeaking();
  window.dispatchEvent(new Event('vx-a11y'));
}

/* ---------------- Reading aloud ---------------- */
var synth = window.speechSynthesis || null;
var voice = null;
function pickVoice(){
  if(!synth) return;
  var all = synth.getVoices().filter(function(v){ return /^es/i.test(v.lang); });
  var order = ['es-CO', 'es-419', 'es-MX', 'es-US'];
  voice = null;
  for(var i = 0; i < order.length && !voice; i++){
    voice = all.find(function(v){ return v.lang.replace('_', '-') === order[i]; }) || null;
  }
  if(!voice) voice = all[0] || null;
}
if(synth){
  pickVoice();
  if('onvoiceschanged' in synth) synth.addEventListener('voiceschanged', pickVoice);
}

export function canSpeak(){ return !!synth; }

// Reads html (tags stripped) aloud when the player turned the voice on.
export function speak(html){
  if(!prefs.voice || !synth || !html) return;
  var div = document.createElement('div');
  div.innerHTML = html;
  var text = (div.textContent || '').replace(/\s+/g, ' ').trim();
  if(!text) return;
  synth.cancel();
  var u = new SpeechSynthesisUtterance(text);
  u.lang = voice ? voice.lang : 'es-CO';
  if(voice) u.voice = voice;
  u.rate = 1;
  synth.speak(u);
}
export function stopSpeaking(){ if(synth) synth.cancel(); }

/* ---------------- The panel ---------------- */
// Opened from the HUD and from the galaxy select screen (any [data-a11y]).
var triggers = document.querySelectorAll('[data-a11y]');
var opener = null; // the button that opened it, to give focus back
var pop = document.createElement('div');
pop.id = 'a11y-pop';
pop.setAttribute('role', 'dialog');
pop.setAttribute('aria-label', 'Accesibilidad');
pop.innerHTML =
  '<div class="a11y-head"><h3>Accesibilidad</h3><span class="a11y-key">Alt + A</span></div>' +
  '<div class="a11y-row">' +
    '<span class="a11y-label"><b>Tamaño del texto</b><i id="a11y-size-name"></i></span>' +
    '<div class="a11y-steps">' +
      '<button type="button" class="a11y-step" data-size="-1" aria-label="Texto más pequeño">A−</button>' +
      '<button type="button" class="a11y-step" data-size="1" aria-label="Texto más grande">A+</button>' +
    '</div>' +
  '</div>' +
  toggleHtml('contrast', 'Alto contraste', 'Textos y bordes más nítidos') +
  toggleHtml('font', 'Letra de lectura fácil', 'Atkinson Hyperlegible, pensada para leer mejor') +
  toggleHtml('spacing', 'Más espacio entre líneas', 'Texto más aireado') +
  toggleHtml('calm', 'Reducir movimiento', 'Sin animaciones ni viajes de cámara') +
  toggleHtml('voice', 'Luma lee en voz alta', 'Lee los diálogos y las pistas') +
  '<button type="button" class="btn-secondary a11y-reset">Restablecer</button>';
document.body.appendChild(pop);

function toggleHtml(key, label, sub){
  return '<label class="a11y-row a11y-toggle">' +
    '<span class="a11y-label"><b>' + label + '</b><i>' + sub + '</i></span>' +
    '<input type="checkbox" role="switch" data-key="' + key + '"><span class="a11y-switch" aria-hidden="true"></span>' +
  '</label>';
}

var sizeName = pop.querySelector('#a11y-size-name');
var steps = pop.querySelectorAll('.a11y-step');
var boxes = pop.querySelectorAll('input[data-key]');

function paint(){
  sizeName.textContent = SIZE_NAMES[prefs.size];
  steps[0].disabled = prefs.size === 0;
  steps[1].disabled = prefs.size === SIZES.length - 1;
  boxes.forEach(function(b){
    var k = b.dataset.key;
    b.checked = k === 'calm' ? calm() : !!prefs[k];
  });
  var voiceBox = pop.querySelector('input[data-key="voice"]');
  voiceBox.disabled = !synth;
  if(!synth) voiceBox.closest('.a11y-row').querySelector('i').textContent = 'Este navegador no puede leer en voz alta';
}

steps.forEach(function(s){
  s.addEventListener('click', function(){
    prefs.size = Math.max(0, Math.min(SIZES.length - 1, prefs.size + (+s.dataset.size)));
    save(); apply(); paint();
  });
});
boxes.forEach(function(b){
  b.addEventListener('change', function(){
    prefs[b.dataset.key] = b.checked;
    save(); apply(); paint();
    sfx('click');
    if(b.dataset.key === 'voice' && b.checked) speak('Listo. Leeré en voz alta los diálogos y las pistas.');
  });
});
pop.querySelector('.a11y-reset').addEventListener('click', function(){
  prefs = { size: 0, contrast: false, font: false, spacing: false, calm: null, voice: false };
  save(); apply(); paint();
});

function isOpen(){ return pop.classList.contains('open'); }
function setExpanded(v){
  triggers.forEach(function(t){ t.setAttribute('aria-expanded', v ? 'true' : 'false'); });
}
function open(from){
  opener = from || document.activeElement;
  pop.classList.add('open');
  setExpanded(true);
  paint();
  pop.querySelector('.a11y-step:not(:disabled), input').focus();
}
function close(giveFocusBack){
  pop.classList.remove('open');
  setExpanded(false);
  if(giveFocusBack && opener && opener.focus) opener.focus();
  opener = null;
}

triggers.forEach(function(t){
  t.addEventListener('click', function(){ if(isOpen()) close(false); else open(t); });
});
document.addEventListener('click', function(e){
  if(!isOpen() || pop.contains(e.target)) return;
  for(var i = 0; i < triggers.length; i++) if(triggers[i].contains(e.target)) return;
  close(false);
});
document.addEventListener('keydown', function(e){
  // e.code, because on a Mac Alt+A types "å"
  if(e.altKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyA'){
    e.preventDefault();
    if(isOpen()) close(true); else open();
  } else if(e.key === 'Escape' && isOpen()){
    e.stopPropagation();
    close(true);
  }
}, true);

// The system setting can change while the app is open.
if(window.matchMedia){
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(mq.addEventListener) mq.addEventListener('change', function(){ if(prefs.calm === null){ apply(); paint(); } });
}

apply();
paint();
